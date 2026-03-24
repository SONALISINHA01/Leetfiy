import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { ReviewData, getDueProblems } from '@/lib/spacedRepetition';

const USER_REVIEWS_KEY = (username: string, platform: string) => `user:${username}:reviews:${platform}`;

/**
 * GET /api/review/due?username=xxx&platform=leetcode|cf
 * Get problems due for review today
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
    
    if (!reviews || reviews.length === 0) {
      return NextResponse.json({
        dueProblems: [],
        dueCount: 0,
        totalInQueue: 0,
        platform,
        message: 'No problems in review queue. Start practicing to add problems!',
      });
    }

    const dueProblems = getDueProblems(reviews);
    
    // Sort by priority: harder problems first, then by next review date
    const sortedDueProblems = dueProblems.sort((a, b) => {
      const difficultyOrder = { Hard: 0, Medium: 1, Easy: 2 };
      const diffCompare = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      if (diffCompare !== 0) return diffCompare;
      return a.nextReviewDate - b.nextReviewDate;
    });

    return NextResponse.json({
      dueProblems: sortedDueProblems,
      dueCount: sortedDueProblems.length,
      totalInQueue: reviews.length,
      platform,
    });
  } catch (error) {
    console.error('Error fetching due problems:', error);
    return NextResponse.json({ error: 'Failed to fetch due problems' }, { status: 500 });
  }
}
