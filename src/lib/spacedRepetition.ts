/**
 * SM-2 Spaced Repetition Algorithm Implementation
 * 
 * The SM-2 algorithm calculates:
 * - Ease Factor (EF): How easy the problem is for the user (min 1.3)
 * - Interval: Days until next review
 * - Next Review Date: When the problem should be reviewed again
 * 
 * Quality ratings:
 * 0 - Complete blackout
 * 1 - Incorrect, but remembered upon seeing answer
 * 2 - Incorrect, but seemed easy to recall
 * 3 - Correct with serious difficulty
 * 4 - Correct after hesitation
 * 5 - Perfect response
 */

export interface ReviewData {
  problemId: string;
  problemTitle: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  platform: 'leetcode' | 'cf';
  lastReviewDate: number; // Unix timestamp
  nextReviewDate: number; // Unix timestamp
  easeFactor: number; // Default 2.5
  interval: number; // Days until next review
  reviewCount: number; // How many times reviewed
  consecutiveCorrect: number;
}

export interface ReviewInput {
  problemId: string;
  problemTitle: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  platform: 'leetcode' | 'cf';
  quality: number; // 0-5 rating
}

export interface WeakTopic {
  topic: string;
  totalAttempts: number;
  successfulAttempts: number;
  successRate: number;
  averageGap: number; // Days between attempts
  lastAttemptDate: number;
  recommendation: string;
}

// Default values for new problems
const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;
const INITIAL_INTERVAL = 1; // 1 day

/**
 * Calculate the next review parameters using SM-2 algorithm
 */
export function calculateNextReview(
  currentData: ReviewData | null,
  quality: number
): { easeFactor: number; interval: number; nextReviewDate: number } {
  // Clamp quality to 0-5 range
  const q = Math.max(0, Math.min(5, quality));
  
  let easeFactor = currentData?.easeFactor ?? DEFAULT_EASE_FACTOR;
  let interval = currentData?.interval ?? INITIAL_INTERVAL;
  
  // If quality < 3, reset the interval (user struggled)
  if (q < 3) {
    interval = 1;
  } else {
    // Calculate new ease factor
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    
    // Ensure ease factor doesn't go below minimum
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor);
    
    // Calculate new interval
    if (currentData?.reviewCount === 0 || !currentData) {
      interval = 1;
    } else if (currentData.reviewCount === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }
  
  // Calculate next review date
  const nextReviewDate = Date.now() + (interval * 24 * 60 * 60 * 1000);
  
  return { easeFactor, interval, nextReviewDate };
}

/**
 * Create initial review data for a new problem
 */
export function createInitialReviewData(input: Omit<ReviewInput, 'quality'>): ReviewData {
  const now = Date.now();
  
  return {
    problemId: input.problemId,
    problemTitle: input.problemTitle,
    topic: input.topic,
    difficulty: input.difficulty,
    platform: input.platform || 'leetcode',
    lastReviewDate: now,
    nextReviewDate: now + (INITIAL_INTERVAL * 24 * 60 * 60 * 1000),
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: INITIAL_INTERVAL,
    reviewCount: 0,
    consecutiveCorrect: 0,
  };
}

/**
 * Update review data after a review session
 */
export function updateReviewData(
  currentData: ReviewData,
  quality: number
): ReviewData {
  const { easeFactor, interval, nextReviewDate } = calculateNextReview(currentData, quality);
  const now = Date.now();
  const consecutiveCorrect = quality >= 3 ? currentData.consecutiveCorrect + 1 : 0;
  
  return {
    ...currentData,
    lastReviewDate: now,
    nextReviewDate,
    easeFactor,
    interval,
    reviewCount: currentData.reviewCount + 1,
    consecutiveCorrect,
  };
}

/**
 * Check if a problem is due for review today
 */
export function isDueToday(reviewData: ReviewData): boolean {
  const now = Date.now();
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  
  return reviewData.nextReviewDate <= endOfToday.getTime();
}

/**
 * Get problems due for review today from a list
 */
export function getDueProblems(reviewDataList: ReviewData[]): ReviewData[] {
  const now = Date.now();
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  
  return reviewDataList.filter(
    (data) => data.nextReviewDate <= endOfToday.getTime()
  );
}

/**
 * Calculate topic performance from review history
 */
export function analyzeWeakTopics(
  reviewDataList: ReviewData[]
): WeakTopic[] {
  const topicMap = new Map<string, {
    attempts: number;
    successes: number;
    gaps: number[];
    lastAttempt: number;
  }>();
  
  for (const data of reviewDataList) {
    const existing = topicMap.get(data.topic) || {
      attempts: 0,
      successes: 0,
      gaps: [],
      lastAttempt: 0,
    };
    
    existing.attempts++;
    if (data.consecutiveCorrect > 0 || data.reviewCount === 0) {
      existing.successes++;
    }
    if (existing.lastAttempt > 0) {
      const gap = (data.lastReviewDate - existing.lastAttempt) / (24 * 60 * 60 * 1000);
      existing.gaps.push(gap);
    }
    existing.lastAttempt = data.lastReviewDate;
    
    topicMap.set(data.topic, existing);
  }
  
  const weakTopics: WeakTopic[] = [];
  
  Array.from(topicMap.entries()).forEach(([topic, stats]) => {
    const successRate = stats.attempts > 0 ? stats.successes / stats.attempts : 0;
    const averageGap = stats.gaps.length > 0
      ? stats.gaps.reduce((a, b) => a + b, 0) / stats.gaps.length
      : 0;
    
    // Determine recommendation based on metrics
    let recommendation = '';
    if (successRate < 0.5) {
      recommendation = 'Focus: Practice fundamentals';
    } else if (successRate < 0.7) {
      recommendation = 'Review: More practice needed';
    } else if (averageGap > 14) {
      recommendation = 'Refresh: Gap too large';
    } else {
      recommendation = 'Maintain: Keep practicing';
    }
    
    weakTopics.push({
      topic,
      totalAttempts: stats.attempts,
      successfulAttempts: stats.successes,
      successRate,
      averageGap,
      lastAttemptDate: stats.lastAttempt,
      recommendation,
    });
  });
  
  // Sort by success rate (lowest first) and gap (highest first)
  return weakTopics.sort((a, b) => {
    if (a.successRate !== b.successRate) return a.successRate - b.successRate;
    return b.averageGap - a.averageGap;
  });
}

/**
 * Pre-interview mode settings
 */
export interface PreInterviewSettings {
  enabled: boolean;
  targetDate: number | null; // Unix timestamp
  intensity: 'normal' | 'intensive' | 'crash';
  selectedTopics: string[];
  problemsPerDay: number;
}

export const DEFAULT_PREINTERVIEW_SETTINGS: PreInterviewSettings = {
  enabled: false,
  targetDate: null,
  intensity: 'normal',
  selectedTopics: [
    'Arrays',
    'Strings',
    'Dynamic Programming',
    'Trees',
    'Graphs',
    'Hash Tables',
    'Sorting',
    'Binary Search',
    'Two Pointers',
    'Sliding Window',
  ],
  problemsPerDay: 5,
};

/**
 * Get days until interview
 */
export function getDaysUntilInterview(targetDate: number | null): number | null {
  if (!targetDate) return null;
  
  const now = Date.now();
  const diff = targetDate - now;
  
  if (diff <= 0) return 0;
  
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

/**
 * Calculate interview mode problem selection
 */
export function getInterviewModeProblemCount(
  settings: PreInterviewSettings,
  baseCount: number
): number {
  if (!settings.enabled) return baseCount;
  
  const daysUntil = getDaysUntilInterview(settings.targetDate);
  if (daysUntil === null || daysUntil <= 0) return baseCount;
  
  switch (settings.intensity) {
    case 'crash':
      // Double the problems for crash mode
      return Math.min(baseCount * 2, 20);
    case 'intensive':
      // 1.5x problems for intensive
      return Math.min(Math.ceil(baseCount * 1.5), 15);
    default:
      return baseCount;
  }
}

/**
 * Common interview topics priority
 */
export const INTERVIEW_TOPICS = [
  'Arrays',
  'Strings',
  'Dynamic Programming',
  'Trees',
  'Graphs',
  'Hash Tables',
  'Sorting',
  'Binary Search',
  'Two Pointers',
  'Sliding Window',
  'Linked Lists',
  'Stacks',
  'Queues',
  'Recursion',
  'Backtracking',
  'Greedy',
  'Math',
  'Bit Manipulation',
];

/**
 * Difficulty weights for interview prep
 */
export const INTERVIEW_DIFFICULTY_WEIGHTS = {
  Easy: 1.0,
  Medium: 2.0,
  Hard: 0.5, // Skip hard unless specifically requested
};
