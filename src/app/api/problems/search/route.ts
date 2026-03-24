import { NextRequest, NextResponse } from 'next/server';

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

// GET /api/problems/search?username=xxx&q=searchTerm
// Search for problems on LeetCode
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const username = searchParams.get('username');

  if (!query || query.length < 2) {
    return NextResponse.json({ problems: [] });
  }

  try {
    const graphqlQuery = `
      query problems($categorySlug: String, $limit: Int, $skip: Int, $filters: ProblemFilterInput) {
        problemsetQuestionList(
          categorySlug: $categorySlug
          limit: $limit
          skip: $skip
          filters: $filters
        ) {
          questions {
            title
            titleSlug
            difficulty
            topicTags {
              name
              slug
            }
            isPaidOnly
          }
        }
      }
    `;

    const response = await fetch(LEETCODE_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: {
          categorySlug: "",
          limit: 20,
          skip: 0,
          filters: {
            searchKeywords: query
          }
        }
      })
    });

    const data = await response.json();
    
    if (!data?.data?.problemsetQuestionList?.questions) {
      return NextResponse.json({ problems: [] });
    }

    const problems = data.data.problemsetQuestionList.questions
      .filter((q: any) => !q.isPaidOnly)
      .map((q: any) => ({
        problemId: q.titleSlug,
        problemTitle: q.title,
        difficulty: q.difficulty,
        topics: q.topicTags?.map((t: any) => t.name) || [],
        topic: q.topicTags?.[0]?.name || 'Unknown',
      }));

    return NextResponse.json({ problems });
  } catch (error) {
    console.error('Error searching problems:', error);
    return NextResponse.json({ problems: [], error: 'Failed to search problems' });
  }
}
