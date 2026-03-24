'use client';

import { FadeIn } from '@/components/animations/FadeIn';
import { FaangScoreCard } from '@/components/dashboard/FaangScoreCard';
import { AiRoastPanel } from '@/components/dashboard/AiRoastPanel';
import { CFRatingChart } from '@/components/dashboard/CFRatingChart';
import { CFProblemStats } from '@/components/dashboard/CFProblemStats';
import { CFLanguageChart } from '@/components/dashboard/CFLanguageChart';
import { CFHeatmap } from '@/components/dashboard/CFHeatmap';
import { CFContestPerformance } from '@/components/dashboard/CFContestPerformance';
import { CFRadarChart } from '@/components/dashboard/CFRadarChart';
import { CFPercentileTracker } from '@/components/dashboard/CFPercentileTracker';
import { CFTimeOfDayChart } from '@/components/dashboard/CFTimeOfDayChart';
import { CFWeaknessRadar } from '@/components/dashboard/CFWeaknessRadar';
import { SmartReviewCard } from '@/components/dashboard/SmartReviewCard';

interface CFDashboardTabsProps {
  handle: string;
  profileData: any;
  ratingHistory: any;
  solvedStats: any;
  scoreData: any;
  contestPerf: any;
  roast: string;
}

export function CFDashboardTabs({
  handle,
  profileData,
  ratingHistory,
  solvedStats,
  scoreData,
  contestPerf,
  roast,
}: CFDashboardTabsProps) {
  const mappedBreakdown = scoreData ? {
    commits: scoreData.breakdown?.algos || 0,
    quality: scoreData.breakdown?.mastery || 0,
    diversity: scoreData.breakdown?.persistence || 0,
    oss: scoreData.breakdown?.speed || 0
  } : undefined;

  return (
    <div className="space-y-6">
      {/* ANALYZE SECTION */}
      {/* Score + Roast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeIn delay={0.1} direction="up" className="h-full">
          <FaangScoreCard score={scoreData?.score} breakdown={mappedBreakdown} isCPMode={false} />
        </FadeIn>
        <FadeIn delay={0.3} direction="up" className="h-full">
          <AiRoastPanel roastText={roast} isCPMode={false} />
        </FadeIn>
      </div>

      {/* Problem Stats */}
      <FadeIn delay={0.4} direction="up">
        <CFProblemStats 
          ratingBuckets={solvedStats?.ratingBuckets || {}}
          topTags={solvedStats?.topTags || []}
          totalSolved={solvedStats?.totalSolved || 0}
          avgProblemRating={solvedStats?.avgProblemRating || 0}
        />
      </FadeIn>

      {/* Heatmap */}
      {solvedStats?.submissionCalendar && (
        <FadeIn delay={0.45} direction="up">
          <CFHeatmap submissionCalendar={solvedStats.submissionCalendar} />
        </FadeIn>
      )}

      {/* Language Chart */}
      {solvedStats?.languageMap && (
        <FadeIn delay={0.5} direction="up">
          <CFLanguageChart languageMap={solvedStats.languageMap} />
        </FadeIn>
      )}

      {/* Contest Performance */}
      <FadeIn delay={0.55} direction="up">
        <CFContestPerformance performance={contestPerf} />
      </FadeIn>

      {/* Rating Chart */}
      <FadeIn delay={0.6} direction="up">
        <CFRatingChart ratingHistory={ratingHistory} />
      </FadeIn>

      {/* Radar Chart */}
      <FadeIn delay={0.65} direction="up">
        <CFRadarChart topTags={solvedStats?.topTags || []} />
      </FadeIn>

      {/* Percentile Tracker */}
      <FadeIn delay={0.7} direction="up">
        <CFPercentileTracker 
          rating={profileData?.rating}
          maxRating={profileData?.maxRating}
        />
      </FadeIn>

      {/* Time of Day + Weakness Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {solvedStats?.allSubmissions && (
          <FadeIn delay={0.75} direction="up">
            <CFTimeOfDayChart submissions={solvedStats.allSubmissions || []} />
          </FadeIn>
        )}
        {solvedStats && solvedStats.topTags?.length > 0 && (
          <FadeIn delay={0.8} direction="up">
            <CFWeaknessRadar 
              topTags={solvedStats.topTags} 
              ratingBuckets={solvedStats.ratingBuckets}
            />
          </FadeIn>
        )}
      </div>

      {/* REVIEW SECTION */}
      {/* Smart Review Card */}
      <FadeIn delay={0.1} direction="up">
        <SmartReviewCard 
          username={handle} 
          codeforcesUsername={handle}
        />
      </FadeIn>
    </div>
  );
}
