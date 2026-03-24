import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import {
  ReviewData,
  ReviewInput,
  createInitialReviewData,
  updateReviewData,
  getDueProblems,
  analyzeWeakTopics,
  WeakTopic,
} from '@/lib/spacedRepetition';

// Redis key prefixes - now platform specific
const USER_REVIEWS_KEY = (username: string, platform: string) => `user:${username}:reviews:${platform}`;
const USER_WEAK_TOPICS_KEY = (username: string, platform: string) => `user:${username}:weak_topics:${platform}`;

/**
 * GET /api/review?username=xxx&platform=leetcode|cf
 * Get all review data for a user
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const platform = searchParams.get('platform') || 'leetcode';

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
    const reviews = await redis.get<ReviewData[]>(USER_REVIEWS_KEY(username, platform));
    
    if (!reviews) {
      return NextResponse.json({ reviews: [], dueCount: 0, platform });
    }

    const dueProblems = getDueProblems(reviews);
    
    return NextResponse.json({
      reviews,
      dueCount: dueProblems.length,
      dueProblems,
      platform,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

/**
 * POST /api/review
 * Add or update a problem in the review queue
 * Body: { username, platform, problemId, problemTitle, topic, difficulty, quality }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, platform = 'leetcode', problemId, problemTitle, topic, difficulty, quality } = body;

    if (!username || !problemId || !problemTitle || !topic || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields: username, problemId, problemTitle, topic, difficulty' },
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
      
      // Find if problem already exists in review
      const existingIndex = existingReviews.findIndex(r => r.problemId === problemId);
      
      let updatedReview: ReviewData;
      
      if (existingIndex >= 0) {
        // Update existing review with quality rating
        const existingReview = existingReviews[existingIndex];
        const q = quality !== undefined ? quality : 3; // Default to "correct with hesitation"
        updatedReview = updateReviewData(existingReview, q);
        existingReviews[existingIndex] = updatedReview;
      } else {
        // Create new review entry
        updatedReview = createInitialReviewData({
          problemId,
          problemTitle,
          topic,
          difficulty,
          platform: platform as 'leetcode' | 'cf',
        });
        existingReviews.push(updatedReview);
      }

      // Save back to Redis
      await redis.set(USER_REVIEWS_KEY(username, platform), existingReviews);

      // Calculate and cache weak topics
      const weakTopics = analyzeWeakTopics(existingReviews);
      await redis.set(USER_WEAK_TOPICS_KEY(username, platform), weakTopics);

      return NextResponse.json({
        success: true,
        review: updatedReview,
        dueCount: getDueProblems(existingReviews).length,
        platform,
      });
    } catch (redisError) {
      console.error('Redis error:', redisError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in review POST:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
