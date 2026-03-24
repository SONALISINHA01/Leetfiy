import { NextRequest, NextResponse } from 'next/server';

const VJUDGE_API_URL = "https://vjudge.net/problem-api/data";

/**
 * GET /api/problems/search-cf?q=searchTerm
 * Search for Codeforces problems using VJudge API
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (!query || query.length < 2) {
    return NextResponse.json({ problems: [] });
  }

  try {
    // VJudge API to search problems
    // Format: POST to https://vjudge.net/problem-api/data with JSON body
    const response = await fetch(VJUDGE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://vjudge.net/problem",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      body: JSON.stringify({
        keyword: query,
        platform: "CF", // Codeforces
        current: 1,
        limit: 20
      })
    });

    if (!response.ok) {
      // Try alternative approach with query params
      const altResponse = await fetch(`${VJUDGE_API_URL}?keyword=${encodeURIComponent(query)}&platform=CF&limit=20`, {
        method: "GET",
        headers: {
          "Referer": "https://vjudge.net/problem",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });
      
      if (!altResponse.ok) {
        throw new Error('VJudge API failed');
      }
      
      const altData = await altResponse.json();
      return processVJudgeResponse(altData);
    }

    const data = await response.json();
    return processVJudgeResponse(data);
  } catch (error) {
    console.error('Error searching CF problems:', error);
    // Try Codeforces API directly as fallback
    return searchCodeforcesDirectly(query);
  }
}

function processVJudgeResponse(data: any) {
  if (!data || !data.data) {
    return NextResponse.json({ problems: [] });
  }

  const problems = (data.data || []).map((p: any) => ({
    problemId: p.origPid || p.pid,
    problemTitle: p.title,
    difficulty: mapRatingToDifficulty(p.rating),
    topic: p.tags?.[0] || 'General',
    platform: 'cf',
    rating: p.rating,
  }));

  return NextResponse.json({ problems });
}

async function searchCodeforcesDirectly(query: string) {
  try {
    // Codeforces problemset API
    const response = await fetch(
      `https://codeforces.com/api/problemset.problems?search=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      }
    );

    if (!response.ok) {
      return NextResponse.json({ problems: [], error: 'CF API failed' });
    }

    const data = await response.json();
    
    if (data.status !== 'OK' || !data.result?.problems) {
      return NextResponse.json({ problems: [] });
    }

    const problems = data.result.problems.slice(0, 20).map((p: any) => ({
      problemId: `${p.contestId}${p.index}`,
      problemTitle: p.name,
      difficulty: mapRatingToDifficulty(p.rating),
      topic: p.tags?.[0] || 'General',
      platform: 'cf',
      rating: p.rating,
    }));

    return NextResponse.json({ problems });
  } catch (error) {
    console.error('Error searching CF problems directly:', error);
    return NextResponse.json({ problems: [], error: 'Failed to search problems' });
  }
}

function mapRatingToDifficulty(rating: number | undefined): string {
  if (!rating) return 'Medium';
  if (rating <= 1200) return 'Easy';
  if (rating <= 2000) return 'Medium';
  return 'Hard';
}
