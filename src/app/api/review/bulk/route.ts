import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import {
  ReviewData,
  createInitialReviewData,
  getDueProblems,
  analyzeWeakTopics,
} from '@/lib/spacedRepetition';
import { fetchLeetCodeRecentSubmissions } from '@/lib/leetcode';
import { fetchCFSubmissions } from '@/lib/codeforces';

// Redis key prefixes - now platform specific
const USER_REVIEWS_KEY = (username: string, platform: string) => `user:${username}:reviews:${platform}`;
const USER_WEAK_TOPICS_KEY = (username: string, platform: string) => `user:${username}:weak_topics:${platform}`;

/**
 * GET /api/review/bulk?username=xxx&platform=leetcode|cf&limit=50
 * Auto-fetch recent submissions and add to review queue
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const platform = searchParams.get('platform') || 'leetcode';
  const limit = parseInt(searchParams.get('limit') || '50');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  if (!['leetcode', 'cf'].includes(platform)) {
    return NextResponse.json({ error: 'Platform must be leetcode or cf' }, { status: 400 });
  }

  if (!redis) {
    return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
  }

  try {
    let problems: any[] = [];

    if (platform === 'leetcode') {
      // Fetch from LeetCode
      const lcData = await fetchLeetCodeRecentSubmissions(username, limit);
      problems = lcData?.map((s: any) => ({
        problemId: s.titleSlug,
        problemTitle: s.title,
        topic: s.topic || 'General',
        difficulty: s.difficulty || 'Medium',
        timestamp: s.timestamp ? s.timestamp * 1000 : Date.now(),
      })) || [];
    } else {
      // Fetch from Codeforces
      const cfData = await fetchCFSubmissions(username);
      problems = cfData?.slice(0, limit).map((s: any) => ({
        problemId: `${s.problemId}_${s.contestId}`,
        problemTitle: s.problemName,
        topic: s.tags?.[0] || 'General',
        difficulty: s.rating ? (s.rating <= 1200 ? 'Easy' : s.rating <= 2000 ? 'Medium' : 'Hard') : 'Medium',
        timestamp: s.creationTimeSeconds ? s.creationTimeSeconds * 1000 : Date.now(),
      })) || [];
    }

    if (problems.length === 0) {
      return NextResponse.json({
        success: true,
        addedCount: 0,
        skippedCount: 0,
        message: `No recent ${platform === 'leetcode' ? 'LeetCode' : 'Codeforces'} submissions found`,
      });
    }

    // Get existing reviews for this platform
    const existingReviews = await redis.get<ReviewData[]>(USER_REVIEWS_KEY(username, platform)) || [];
    const existingIds = new Set(existingReviews.map(r => r.problemId));
    
    let addedCount = 0;
    let skippedCount = 0;

    // Add new problems that aren't already in the queue
    for (const problem of problems) {
      const { problemId, problemTitle, topic, difficulty, timestamp } = problem;
      
      if (!problemId || !problemTitle || !topic || !difficulty) {
        skippedCount++;
        continue;
      }

      if (existingIds.has(problemId)) {
        skippedCount++;
        continue;
      }

      // Create new review entry
      const newReview = createInitialReviewData({
        problemId,
        problemTitle,
        topic,
        difficulty,
        platform: platform as 'leetcode' | 'cf',
      });
      
      // Override the initial review date with the actual solve date
      if (timestamp) {
        newReview.lastReviewDate = timestamp;
        newReview.nextReviewDate = timestamp + (newReview.interval * 24 * 60 * 60 * 1000);
      }
      
      existingReviews.push(newReview);
      addedCount++;
    }

    // Save back to Redis
    await redis.set(USER_REVIEWS_KEY(username, platform), existingReviews);

    // Calculate and cache weak topics
    const weakTopics = analyzeWeakTopics(existingReviews);
    await redis.set(USER_WEAK_TOPICS_KEY(username, platform), weakTopics);

    const dueProblems = getDueProblems(existingReviews);

    return NextResponse.json({
      success: true,
      addedCount,
      skippedCount,
      totalReviews: existingReviews.length,
      dueCount: dueProblems.length,
      platform,
    });
  } catch (error) {
    console.error('Error in bulk fetch:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

/**
 * POST /api/review/bulk
 * Bulk add custom problems to review queue
 * Body: { username, platform, problems: [...] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, platform = 'leetcode', problems } = body;

    if (!username || !problems || !Array.isArray(problems)) {
      return NextResponse.json(
        { error: 'Missing required fields: username, problems (array)' },
        { status: 400 }
      );
    }

    if (!['leetcode', 'cf'].includes(platform)) {
      return NextResponse.json({ error: 'Platform must be leetcode or cf' }, { status: 400 });
    }

    if (!redis) {
      return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
    }

    try {
      // Get existing reviews for this platform
      const existingReviews = await redis.get<ReviewData[]>(USER_REVIEWS_KEY(username, platform)) || [];
      const existingIds = new Set(existingReviews.map(r => r.problemId));
      
      let addedCount = 0;
      let skippedCount = 0;

      // Add new problems that aren't already in the queue
      for (const problem of problems) {
        const { problemId, problemTitle, topic, difficulty, timestamp } = problem;
        
        if (!problemId || !problemTitle || !topic || !difficulty) {
          skippedCount++;
          continue;
        }

        if (existingIds.has(problemId)) {
          skippedCount++;
          continue;
        }

        // Create new review entry
        const newReview = createInitialReviewData({
          problemId,
          problemTitle,
          topic,
          difficulty,
          platform: platform as 'leetcode' | 'cf',
        });
        
        // Override the initial review date with the actual solve date
        if (timestamp) {
          newReview.lastReviewDate = timestamp;
          newReview.nextReviewDate = timestamp + (newReview.interval * 24 * 60 * 60 * 1000);
        }
        
        existingReviews.push(newReview);
        addedCount++;
      }

      // Save back to Redis
      await redis.set(USER_REVIEWS_KEY(username, platform), existingReviews);

      // Calculate and cache weak topics
      const weakTopics = analyzeWeakTopics(existingReviews);
      await redis.set(USER_WEAK_TOPICS_KEY(username, platform), weakTopics);

      const dueProblems = getDueProblems(existingReviews);

      return NextResponse.json({
        success: true,
        addedCount,
        skippedCount,
        totalReviews: existingReviews.length,
        dueCount: dueProblems.length,
        platform,
      });
    } catch (redisError) {
      console.error('Redis error in bulk add:', redisError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in review bulk POST:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
