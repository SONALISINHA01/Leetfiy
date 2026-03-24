"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Target, Award, Zap, Users, Code2, Trophy, Flame } from "lucide-react";

interface LCPercentileTrackerProps {
    rating?: number;
    globalRanking?: number;
    totalParticipants?: number;
    topPercentage?: number;
    totalSolved?: number;
    easySolved?: number;
    mediumSolved?: number;
    hardSolved?: number;
}

// More accurate LC statistics
const LC_STATS = {
    totalUsers: 3000000,
    // Contest rating percentile thresholds
    ratingThresholds: [
        { rating: 3000, percentile: 99.99 },
        { rating: 2800, percentile: 99.9 },
        { rating: 2600, percentile: 99.5 },
        { rating: 2400, percentile: 98 },
        { rating: 2200, percentile: 95 },
        { rating: 2000, percentile: 90 },
        { rating: 1900, percentile: 82 },
        { rating: 1800, percentile: 72 },
        { rating: 1700, percentile: 60 },
        { rating: 1600, percentile: 48 },
        { rating: 1500, percentile: 36 },
        { rating: 1400, percentile: 25 },
        { rating: 1300, percentile: 16 },
        { rating: 1200, percentile: 9 },
    ],
    // Problems solved distribution
    solvedThresholds: [
        { solved: 3000, percentile: 99.9 },
        { solved: 2000, percentile: 99 },
        { solved: 1500, percentile: 95 },
        { solved: 1000, percentile: 85 },
        { solved: 700, percentile: 70 },
        { solved: 500, percentile: 50 },
        { solved: 300, percentile: 30 },
        { solved: 200, percentile: 18 },
        { solved: 100, percentile: 8 },
        { solved: 50, percentile: 3 },
    ],
    // Hard problems distribution
    hardSolvedThresholds: [
        { solved: 200, percentile: 99 },
        { solved: 150, percentile: 95 },
        { solved: 100, percentile: 90 },
        { solved: 75, percentile: 80 },
        { solved: 50, percentile: 65 },
        { solved: 30, percentile: 50 },
        { solved: 20, percentile: 35 },
        { solved: 10, percentile: 20 },
        { solved: 5, percentile: 10 },
    ],
};

// Get percentile from rating
function getRatingPercentile(rating: number | undefined): number {
    if (!rating) return 0;
    
    for (const threshold of LC_STATS.ratingThresholds) {
        if (rating >= threshold.rating) {
            return threshold.percentile;
        }
    }
    return 1;
}

// Get percentile from problems solved
function getSolvedPercentile(solved: number | undefined): number {
    if (!solved) return 0;
    
    for (const threshold of LC_STATS.solvedThresholds) {
        if (solved >= threshold.solved) {
            return threshold.percentile;
        }
    }
    return 0.5;
}

// Get percentile from hard problems
function getHardPercentile(hardSolved: number | undefined): number {
    if (!hardSolved) return 0;
    
    for (const threshold of LC_STATS.hardSolvedThresholds) {
        if (hardSolved >= threshold.solved) {
            return threshold.percentile;
        }
    }
    return 0.5;
}

// Calculate percentile from global ranking
function getRankingPercentile(ranking: number | undefined, totalUsers: number = LC_STATS.totalUsers): number {
    if (!ranking || ranking === 0) return 0;
    return Math.min(99.9, ((totalUsers - ranking) / totalUsers) * 100);
}

function getRatingColor(rating?: number): string {
    if (!rating) return "text-zinc-400";
    if (rating >= 2800) return "text-red-500";
    if (rating >= 2400) return "text-orange-500";
    if (rating >= 2000) return "text-yellow-500";
    if (rating >= 1800) return "text-purple-400";
    if (rating >= 1600) return "text-blue-400";
    if (rating >= 1400) return "text-cyan-400";
    if (rating >= 1200) return "text-green-400";
    return "text-zinc-400";
}

interface PercentileItemProps {
    label: string;
    value: string | number;
    percentile: number;
    icon: React.ReactNode;
    color: string;
    accentColor: string;
}

function PercentileItem({ label, value, percentile, icon, color, accentColor }: PercentileItemProps) {
    const getPercentileLabel = (p: number) => {
        if (p >= 99) return "Top 1%";
        if (p >= 95) return "Top 5%";
        if (p >= 90) return "Top 10%";
        if (p >= 80) return "Top 20%";
        if (p >= 50) return "Top 50%";
        return "Keep grinding!";
    };

    const getBarColor = (p: number) => {
        if (p >= 95) return "from-yellow-500 to-orange-500";
        if (p >= 80) return "from-green-500 to-emerald-500";
        if (p >= 50) return "from-blue-500 to-cyan-500";
        return "from-zinc-500 to-zinc-600";
    };

    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
            <div className={`p-2 rounded-lg ${accentColor}/20`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-500 font-medium">{label}</span>
                    <span className={`text-sm font-bold ${color}`}>{value}</span>
                </div>
                <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentile, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getBarColor(percentile)} rounded-full`}
                    />
                </div>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-zinc-600">
                        {percentile > 0 ? `${percentile.toFixed(1)}%` : 'N/A'}
                    </span>
                    <span className="text-[10px] font-medium text-zinc-400">
                        {percentile > 0 ? getPercentileLabel(percentile) : 'No data'}
                    </span>
                </div>
            </div>
        </div>
    );
}

export function LCPercentileTracker({ 
    rating,
    globalRanking,
    totalParticipants,
    topPercentage,
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
}: LCPercentileTrackerProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="bg-[#0b121a] border border-blue-500/10 rounded-2xl p-5 h-full animate-pulse">
                <div className="h-6 w-48 bg-zinc-800 rounded mb-4" />
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-16 bg-zinc-800/50 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    // Use topPercentage from LeetCode API if available (most accurate)
    const rankingPercentile = topPercentage 
        ? 100 - topPercentage 
        : getRankingPercentile(globalRanking, totalParticipants || LC_STATS.totalUsers);
    
    const ratingPercentile = getRatingPercentile(rating);
    const solvedPercentile = getSolvedPercentile(totalSolved);
    const hardPercentile = getHardPercentile(hardSolved);

    // Calculate overall score
    const metricsWithData = [rankingPercentile, solvedPercentile, ratingPercentile].filter(p => p > 0);
    const overallPercentile = metricsWithData.length > 0 
        ? metricsWithData.reduce((a, b) => a + b, 0) / metricsWithData.length 
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0b121a] border border-blue-500/10 rounded-2xl p-5 flex flex-col h-full relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/8 blur-[60px] rounded-full pointer-events-none" />

            <div className="flex items-center gap-2 mb-4 z-10">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="font-semibold text-sm text-zinc-300">Percentile Tracker</h3>
            </div>

            {/* Overall Score */}
            <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Overall Percentile</p>
                        <p className="text-2xl font-bold text-white">
                            {overallPercentile > 0 ? `Top ${Math.round(100 - overallPercentile)}%` : 'N/A'}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Global Rank</p>
                        <p className="text-lg font-bold text-blue-400">
                            {globalRanking ? `#${globalRanking.toLocaleString()}` : '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Individual Metrics */}
            <div className="space-y-2 flex-1 overflow-y-auto z-10">
                <PercentileItem 
                    label="Contest Rating"
                    value={rating || "Unrated"}
                    percentile={ratingPercentile}
                    icon={<Award className="w-4 h-4 text-yellow-400" />}
                    color={getRatingColor(rating)}
                    accentColor="bg-yellow-500"
                />
                <PercentileItem 
                    label="Global Ranking"
                    value={globalRanking ? `#${globalRanking.toLocaleString()}` : "Unranked"}
                    percentile={rankingPercentile}
                    icon={<Users className="w-4 h-4 text-purple-400" />}
                    color={rankingPercentile >= 50 ? "text-purple-400" : "text-zinc-400"}
                    accentColor="bg-purple-500"
                />
                <PercentileItem 
                    label="Total Solved"
                    value={totalSolved || 0}
                    percentile={solvedPercentile}
                    icon={<Code2 className="w-4 h-4 text-green-400" />}
                    color="text-green-400"
                    accentColor="bg-green-500"
                />
                <PercentileItem 
                    label="Hard Problems"
                    value={hardSolved || 0}
                    percentile={hardPercentile}
                    icon={<Zap className="w-4 h-4 text-red-400" />}
                    color="text-red-400"
                    accentColor="bg-red-500"
                />
            </div>

            <div className="mt-3 pt-3 border-t border-white/5 text-center z-10">
                <p className="text-[10px] text-zinc-600">
                    Based on ~{LC_STATS.totalUsers.toLocaleString()} active LeetCode users
                </p>
            </div>
        </motion.div>
    );
}
