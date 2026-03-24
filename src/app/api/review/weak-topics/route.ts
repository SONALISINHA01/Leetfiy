import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { ReviewData, WeakTopic, analyzeWeakTopics } from '@/lib/spacedRepetition';

const USER_REVIEWS_KEY = (username: string) => `user:${username}:reviews`;
const USER_WEAK_TOPICS_KEY = (username: string) => `user:${username}:weak_topics`;

/**
 * GET /api/review/weak-topics?username=xxx
 * Get weak topics analysis for a user
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  if (!redis) {
    return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
  }

  try {
    // Try to get cached weak topics first
    let weakTopics = await redis.get<WeakTopic[]>(USER_WEAK_TOPICS_KEY(username));
    
    if (!weakTopics) {
      // Calculate from scratch if not cached
      const reviews = await redis.get<ReviewData[]>(USER_REVIEWS_KEY(username));
      
      if (!reviews || reviews.length === 0) {
        return NextResponse.json({
          weakTopics: [],
          message: 'No review data yet. Start practicing to analyze your weak topics!',
        });
      }
      
      weakTopics = analyzeWeakTopics(reviews);
      
      // Cache the results
      await redis.set(USER_WEAK_TOPICS_KEY(username), weakTopics);
    }

    // Filter to get only topics that need attention (success rate < 70% or large gaps)
    const attentionTopics = weakTopics.filter(
      (topic) => topic.successRate < 0.7 || topic.averageGap > 14
    );

    return NextResponse.json({
      weakTopics: attentionTopics,
      allTopics: weakTopics,
      totalTopics: weakTopics.length,
      needsFocus: attentionTopics.length > 0,
    });
  } catch (error) {
    console.error('Error fetching weak topics:', error);
    return NextResponse.json({ error: 'Failed to fetch weak topics' }, { status: 500 });
  }
}
