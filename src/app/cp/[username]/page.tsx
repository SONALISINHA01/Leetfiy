import { Suspense } from "react";
import { ArrowLeft, Share2, Briefcase, FileCode2, Code2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaangScoreCard } from "@/components/dashboard/FaangScoreCard";
import { AiRoastPanel } from "@/components/dashboard/AiRoastPanel";
import { LeetCodeStats } from "@/components/dashboard/LeetCodeStats";
import { ContestRatingChart } from "@/components/dashboard/ContestRatingChart";
import { TopTopicsChart } from "@/components/dashboard/TopTopicsChart";
import { fetchLeetCodeProfile, fetchLeetCodeStats, fetchLeetCodeContest, fetchLeetCodeCalendar, fetchLeetCodeSkills, fetchLeetCodeRecentSubmissions } from "@/lib/leetcode";
import { computeCPScore } from "@/lib/scoring";
import { generateCPRoast } from "@/lib/roast";
import { redis } from "@/lib/redis";
import { FadeIn } from "@/components/animations/FadeIn";
import { RoastTierBadge, RoastTierCard } from "@/components/dashboard/RoastTierBadge";
import { getRoastTier, getAllTiers } from "@/lib/tiers";
import { LCHeatmap } from "@/components/dashboard/LCHeatmap";
import { LCRadarChart } from "@/components/dashboard/LCRadarChart";
import { LCPercentileTracker } from "@/components/dashboard/LCPercentileTracker";
import { LCTimeOfDayChart } from "@/components/dashboard/LCTimeOfDayChart";
import { LCWeaknessRadar } from "@/components/dashboard/LCWeaknessRadar";
import { SmartReviewCard } from "@/components/dashboard/SmartReviewCard";
import { PreInterviewMode } from "@/components/dashboard/PreInterviewMode";
import { WeakTopicsAlert } from "@/components/dashboard/WeakTopicsAlert";
import { CPDashboardTabs } from "@/components/dashboard/CPDashboardTabs";
import Image from "next/image";

export default async function CPDashboard({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;

    let profileData: any = null;
    let statsData: any = null;
    let contestData: any = null;
    let calendarData: any = null;
    let skillsData: any = null;
    let scoreData: any = null;
    let roast = "";
    let recentSubsData: any = null;

    try {
        const cacheKey = `leetcodebang:cp:v6:${username.toLowerCase()}`;

        // Check Redis cache first
        if (redis) {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                const parsed = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
                profileData = parsed.profileData;
                statsData = parsed.statsData;
                contestData = parsed.contestData;
                calendarData = parsed.calendarData;
                skillsData = parsed.skillsData;
                scoreData = parsed.scoreData;
                roast = parsed.roast;
                recentSubsData = parsed.recentSubsData;
                
                console.log('[CP Page] Cache hit, recentSubsData:', {
                    hasData: !!recentSubsData,
                    length: recentSubsData?.length
                });
            }
        }

        // No cache hit OR missing recentSubsData — fetch fresh data
        if (!profileData || !recentSubsData) {
            console.log('[CP Page] No cache hit, fetching fresh data for:', username);
            profileData = await fetchLeetCodeProfile(username);

            if (profileData) {
                statsData = await fetchLeetCodeStats(username);
                contestData = await fetchLeetCodeContest(username);
                calendarData = await fetchLeetCodeCalendar(username);
                skillsData = await fetchLeetCodeSkills(username);
                recentSubsData = await fetchLeetCodeRecentSubmissions(username, 500);
                
                console.log('[CP Page] Fetched recentSubsData:', {
                    hasData: !!recentSubsData,
                    length: recentSubsData?.length,
                    firstItem: recentSubsData?.[0]
                });

                scoreData = await computeCPScore(profileData, statsData, contestData, calendarData);
                roast = await generateCPRoast(username, profileData, statsData, contestData, skillsData, scoreData);

                // Cache the results for 24 hours
                if (redis) {
                    await redis.setex(cacheKey, 86400, JSON.stringify({
                        profileData,
                        statsData,
                        contestData,
                        calendarData,
                        skillsData,
                        scoreData,
                        roast,
                        recentSubsData
                    }));
                }
            }
        }

    } catch (e) {
        console.error("Failed to load CP Data:", e);
    }

    if (!profileData) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <Code2 className="w-16 h-16 text-zinc-600 mb-6" />
                <h1 className="text-3xl font-bold mb-2">User not found</h1>
                <p className="text-zinc-400 mb-8">Could not locate @{username} on LeetCode.</p>
                <Link href="/">
                    <Button variant="outline" className="border-white/10 hover:bg-white/10">Try another username</Button>
                </Link>
            </div>
        );
    }

    const totalSolved = statsData?.solved?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 0;
    const rating = contestData?.rating ? Math.round(contestData.rating) : "Unrated";
    const ranking = profileData?.profile?.ranking || "Unranked";

    // Map CP-specific breakdown keys to the generic score card prop names
    const mappedBreakdown = scoreData ? {
        commits: scoreData.breakdown.algos,
        quality: scoreData.breakdown.mastery,
        diversity: scoreData.breakdown.persistence,
        oss: scoreData.breakdown.speed
    } : undefined;

    return (
        <div id="leetcodebang-cp-dashboard" className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Dynamic Background with Cyan/Blue aesthetic */}
            <div className="fixed inset-0 z-0" data-html2canvas-ignore="true">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.15),transparent_40%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_40%)]" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
                {/* Navigation */}
                <nav className="flex items-center justify-between mb-8">
                    <Link href="/">
                        <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/10 gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Search
                        </Button>
                    </Link>
                    <div className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-blue-400" />
                        <span className="text-blue-400">LeetCode</span> Roaster
                    </div>
                </nav>

                {/* Header Profile Section */}
                <FadeIn delay={0.1} direction="up">
                    <div className="mb-12 flex flex-col items-center md:items-start md:flex-row gap-6">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-900 shadow-[0_0_30px_rgba(56,189,248,0.3)] relative">
                            {profileData.profile?.userAvatar ? (
                                <Image src={profileData.profile.userAvatar} alt={username} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full bg-zinc-800" />
                            )}
                        </div>
                        <div className="space-y-2 text-center md:text-left">
                            <h1 className="text-4xl font-bold flex items-center gap-3">
                                {profileData.profile?.realName || username}
                            </h1>
                            <p className="text-zinc-400 text-lg max-w-xl">{profileData.profile?.aboutMe || "Just another algorithmic monkey."}</p>
                            <div className="flex gap-4 items-center text-sm text-zinc-500 mt-2">
                                <span><strong className="text-white">{totalSolved}</strong> Problems Solved</span>
                                <span><strong className="text-white">#{ranking}</strong> Global Rank</span>
                                <span><strong className="text-white">{rating}</strong> Contest Rating</span>
                            </div>
                        </div>
                    </div>
                </FadeIn>

                {/* Roast Tier Assignment */}
                <FadeIn delay={0.15} direction="up" className="mb-8">
                    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Your Roast Tier</h3>
                                <p className="text-xs text-zinc-500">Based on your algorithmic score of {scoreData?.score ?? 0}/100</p>
                            </div>
                            {scoreData && <RoastTierBadge score={scoreData.score} size="lg" />}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {getAllTiers().map(t => (
                                <RoastTierCard key={t.tier} tier={t} isActive={scoreData ? getRoastTier(scoreData.score).tier === t.tier : false} />
                            ))}
                        </div>
                    </div>
                </FadeIn>

                {/* Dashboard Tabs */}
                <CPDashboardTabs
                    username={username}
                    profileData={profileData}
                    statsData={statsData}
                    contestData={contestData}
                    calendarData={calendarData}
                    skillsData={skillsData}
                    scoreData={scoreData}
                    roast={roast}
                    recentSubsData={recentSubsData}
                />
            </div>
        </div>
    );
}
