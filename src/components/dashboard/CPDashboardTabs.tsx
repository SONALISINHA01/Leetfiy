'use client';

import { FadeIn } from '@/components/animations/FadeIn';
import { FaangScoreCard } from '@/components/dashboard/FaangScoreCard';
import { AiRoastPanel } from '@/components/dashboard/AiRoastPanel';
import { LeetCodeStats } from '@/components/dashboard/LeetCodeStats';
import { ContestRatingChart } from '@/components/dashboard/ContestRatingChart';
import { LCHeatmap } from '@/components/dashboard/LCHeatmap';
import { LCRadarChart } from '@/components/dashboard/LCRadarChart';
import { LCPercentileTracker } from '@/components/dashboard/LCPercentileTracker';
import { LCTimeOfDayChart } from '@/components/dashboard/LCTimeOfDayChart';
import { LCWeaknessRadar } from '@/components/dashboard/LCWeaknessRadar';
import { SmartReviewCard } from '@/components/dashboard/SmartReviewCard';
import { PreInterviewMode } from '@/components/dashboard/PreInterviewMode';
import { WeakTopicsAlert } from '@/components/dashboard/WeakTopicsAlert';

interface CPDashboardTabsProps {
  username: string;
  profileData: any;
  statsData: any;
  contestData: any;
  calendarData: any;
  skillsData: any;
  scoreData: any;
  roast: string;
  recentSubsData: any;
}

export function CPDashboardTabs({
  username,
  profileData,
  statsData,
  contestData,
  calendarData,
  skillsData,
  scoreData,
  roast,
  recentSubsData,
}: CPDashboardTabsProps) {
  const totalSolved = statsData?.solved?.reduce((acc: number, item: any) => acc + item.count, 0) || 0;

  // Map CP-specific breakdown keys to the generic score card prop names
  const mappedBreakdown = scoreData ? {
    commits: scoreData.breakdown?.algos || 0,
    quality: scoreData.breakdown?.mastery || 0,
    diversity: scoreData.breakdown?.persistence || 0,
    oss: scoreData.breakdown?.speed || 0
  } : undefined;

  return (
    <div className="space-y-6">
      {/* ANALYZE SECTION */}
      {/* Row 1: Score + Roast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeIn delay={0.1} direction="up" className="h-full">
          <FaangScoreCard score={scoreData?.score} breakdown={mappedBreakdown} isCPMode={true} />
        </FadeIn>
        <FadeIn delay={0.3} direction="up" className="h-full">
          <AiRoastPanel roastText={roast} isCPMode={true} />
        </FadeIn>
      </div>

      {/* Row 2: Stats + Heatmap */}
      <FadeIn delay={0.4} direction="up" className="h-[300px]">
        <LeetCodeStats stats={statsData} />
      </FadeIn>
      
      {calendarData?.submissionCalendar && (
        <FadeIn delay={0.45} direction="up" className="h-[300px]">
          <LCHeatmap submissionCalendar={calendarData.submissionCalendar} />
        </FadeIn>
      )}

      {/* Topic Mastery Radar */}
      <FadeIn delay={0.5} direction="up" className="h-[300px]">
        <LCRadarChart skills={skillsData} />
      </FadeIn>

      {/* Contest Rating Chart */}
      <FadeIn delay={0.5} direction="up" className="h-[300px] min-h-[300px]">
        <ContestRatingChart contest={contestData} />
      </FadeIn>

      {/* Percentile Tracker */}
      <FadeIn delay={0.55} direction="up" className="min-h-[300px]">
        <LCPercentileTracker 
          rating={contestData?.rating}
          globalRanking={profileData?.profile?.ranking}
          totalParticipants={contestData?.totalParticipants}
          topPercentage={contestData?.topPercentage}
          totalSolved={totalSolved}
          easySolved={statsData?.solved?.find((s: any) => s.difficulty === "Easy")?.count}
          mediumSolved={statsData?.solved?.find((s: any) => s.difficulty === "Medium")?.count}
          hardSolved={statsData?.solved?.find((s: any) => s.difficulty === "Hard")?.count}
        />
      </FadeIn>

      {/* Time of Day + Weakness Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {calendarData?.submissionCalendar && (
          <FadeIn delay={0.6} direction="up">
            <LCTimeOfDayChart 
              recentSubmissions={recentSubsData}
              submissionCalendar={calendarData.submissionCalendar}
            />
          </FadeIn>
        )}
        <FadeIn delay={0.65} direction="up">
          <LCWeaknessRadar skills={skillsData} />
        </FadeIn>
      </div>

      {/* REVIEW SECTION */}
      {/* Smart Review Card */}
      <FadeIn delay={0.1} direction="up">
        <SmartReviewCard 
          username={username} 
          leetcodeUsername={username}
        />
      </FadeIn>

      {/* Pre-Interview Mode */}
      <FadeIn delay={0.15} direction="up">
        <PreInterviewMode username={username} />
      </FadeIn>

      {/* Weak Topics Alert */}
      <FadeIn delay={0.2} direction="up">
        <WeakTopicsAlert username={username} />
      </FadeIn>
    </div>
  );
}
