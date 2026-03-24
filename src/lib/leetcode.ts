const LEETCODE_API_URL = "https://leetcode.com/graphql";


const USER_PROFILE_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      githubUrl
      twitterUrl
      profile {
        realName
        userAvatar
        aboutMe
        school
        company
        countryName
        ranking
      }
      languageProblemCount {
        languageName
        problemsSolved
      }
    }
  }
`;


const SUBMIT_STATS_QUERY = `
  query userProblemsSolved($username: String!) {
    allQuestionsCount {
      difficulty
      count
    }
    matchedUser(username: $username) {
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
  }
`;


const CONTEST_RANKING_QUERY = `
  query userContestRankingInfo($username: String!) {
    userContestRanking(username: $username) {
      attendedContestsCount
      rating
      globalRanking
      totalParticipants
      topPercentage
    }
  }
`;


const USER_CALENDAR_QUERY = `
  query userProfileCalendar($username: String!) {
    matchedUser(username: $username) {
      userCalendar {
        activeYears
        streak
        totalActiveDays
        submissionCalendar
      }
    }
  }
`;


const SKILL_STATS_QUERY = `
  query skillStats($username: String!) {
    matchedUser(username: $username) {
      tagProblemCounts {
        advanced {
          tagName
          problemsSolved
        }
        intermediate {
          tagName
          problemsSolved
        }
        fundamental {
          tagName
          problemsSolved
        }
      }
    }
  }
`;


const RECENT_SUBMISSIONS_QUERY = `
  query recentSubmissions($username: String!, $limit: Int) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      id
      title
      titleSlug
      timestamp
      statusDisplay
      lang
    }
  }
`;

async function fetchGraphQL(query: string, variables: any) {
  try {
    const response = await fetch(LEETCODE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`LeetCode API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching from LeetCode GraphQL API:", error);
    return null;
  }
}

export async function fetchLeetCodeProfile(username: string) {
  const data = await fetchGraphQL(USER_PROFILE_QUERY, { username });
  if (!data || !data.matchedUser) return null;
  return data.matchedUser;
}

export async function fetchLeetCodeStats(username: string) {
  const data = await fetchGraphQL(SUBMIT_STATS_QUERY, { username });
  if (!data || !data.matchedUser) return null;

  const acSubmissions = data.matchedUser.submitStatsGlobal.acSubmissionNum.filter(
    (item: any) => item.difficulty !== 'All'
  );
  const allQuestions = data.allQuestionsCount;;

  return {
    solved: acSubmissions,
    total: allQuestions
  };
}

export async function fetchLeetCodeContest(username: string) {
  const data = await fetchGraphQL(CONTEST_RANKING_QUERY, { username });
  if (!data || !data.userContestRanking) return null;
  return data.userContestRanking;
}

export async function fetchLeetCodeCalendar(username: string) {
  const data = await fetchGraphQL(USER_CALENDAR_QUERY, { username });
  if (!data || !data.matchedUser) return null;
  return data.matchedUser.userCalendar;
}

export async function fetchLeetCodeSkills(username: string) {
  const data = await fetchGraphQL(SKILL_STATS_QUERY, { username });
  if (!data || !data.matchedUser || !data.matchedUser.tagProblemCounts) return null;
  return data.matchedUser.tagProblemCounts;
}

export interface LCSubmission {
  id: string;
  title: string;
  titleSlug: string;
  timestamp: number;
  statusDisplay: string;
  lang: string;
}

export async function fetchLeetCodeRecentSubmissions(username: string, limit: number = 100): Promise<LCSubmission[] | null> {
  console.log('[LeetCode API] Fetching recent submissions for:', username, 'limit:', limit);
  const data = await fetchGraphQL(RECENT_SUBMISSIONS_QUERY, { username, limit });
  console.log('[LeetCode API] Response:', JSON.stringify(data)?.slice(0, 500));
  if (!data || !data.recentAcSubmissionList) return null;
  return data.recentAcSubmissionList;
}
