"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Target, Award, Zap, Users, Code2, Trophy, Star, Flame, ArrowRight, TrendingDown, Minus } from "lucide-react";

interface CFPercentileTrackerProps {
    rating?: number;
    maxRating?: number;
    rank?: string;
    totalSolved?: number;
    totalContests?: number;
    friendOfCount?: number;
    ratingHistory?: { oldRating: number; newRating: number }[];
}

// More accurate CF statistics based on public data
const CF_STATS = {
    // Total registered users (approximate)
    totalUsers: 2500000,
    // User distribution by rating (approximate from public CF data)
    ratingThresholds: [
        { rating: 3000, percentile: 99.98 },
        { rating: 2800, percentile: 99.95 },
        { rating: 2600, percentile: 99.9 },
        { rating: 2400, percentile: 99.5 },
        { rating: 2200, percentile: 98 },
        { rating: 2100, percentile: 95 },
        { rating: 2000, percentile: 90 },
        { rating: 1900, percentile: 82 },
        { rating: 1800, percentile: 72 },
        { rating: 1700, percentile: 60 },
        { rating: 1600, percentile: 48 },
        { rating: 1500, percentile: 36 },
        { rating: 1400, percentile: 25 },
        { rating: 1300, percentile: 16 },
        { rating: 1200, percentile: 9 },
        { rating: 1100, percentile: 4 },
    ],
    // Problems solved distribution
    solvedThresholds: [
        { solved: 3000, percentile: 99.5 },
        { solved: 2000, percentile: 97 },
        { solved: 1500, percentile: 92 },
        { solved: 1000, percentile: 80 },
        { solved: 700, percentile: 65 },
        { solved: 500, percentile: 50 },
        { solved: 350, percentile: 35 },
        { solved: 200, percentile: 20 },
        { solved: 100, percentile: 10 },
        { solved: 50, percentile: 5 },
    ],
    // Contest participation distribution
    contestThresholds: [
        { contests: 200, percentile: 99 },
        { contests: 100, percentile: 95 },
        { contests: 50, percentile: 80 },
        { contests: 30, percentile: 60 },
        { contests: 20, percentile: 45 },
        { contests: 10, percentile: 25 },
        { contests: 5, percentile: 12 },
    ],
};

// Accurate percentile calculation based on rating
function getRatingPercentile(rating: number | undefined): number {
    if (!rating) return 0;
    
    for (const threshold of CF_STATS.ratingThresholds) {
        if (rating >= threshold.rating) {
            return threshold.percentile;
        }
    }
    return 2;
}

// Calculate percentile based on problems solved
function getSolvedPercentile(solved: number | undefined): number {
    if (!solved) return 0;
    
    for (const threshold of CF_STATS.solvedThresholds) {
        if (solved >= threshold.solved) {
            return threshold.percentile;
        }
    }
    return 1;
}

// Calculate percentile based on contests
function getContestPercentile(contests: number | undefined): number {
    if (!contests) return 0;
    
    for (const threshold of CF_STATS.contestThresholds) {
        if (contests >= threshold.contests) {
            return threshold.percentile;
        }
    }
    return 1;
}

function getTierColor(rank?: string): string {
    if (!rank) return "text-zinc-400";
    const r = rank.toLowerCase();
    if (r.includes("legendary") || r.includes("grandmaster")) return "text-red-500";
    if (r.includes("international")) return "text-red-400";
    if (r.includes("master")) return "text-orange-500";
    if (r.includes("candidate")) return "text-purple-400";
    if (r.includes("expert")) return "text-blue-400";
    if (r.includes("specialist")) return "text-green-400";
    if (r.includes("pupil")) return "text-green-300";
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

export function CFPercentileTracker({ 
    rating, 
    maxRating, 
    rank, 
    totalSolved, 
    totalContests,
    friendOfCount,
    ratingHistory 
}: CFPercentileTrackerProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="bg-[#1a0b0b] border border-orange-500/10 rounded-2xl p-5 h-full animate-pulse">
                <div className="h-6 w-48 bg-zinc-800 rounded mb-4" />
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-zinc-800/50 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    const ratingPercentile = getRatingPercentile(rating);
    const maxRatingPercentile = getRatingPercentile(maxRating);
    const solvedPercentile = getSolvedPercentile(totalSolved);
    const contestPercentile = getContestPercentile(totalContests);

    // Calculate rating trend (unconditionally)
    const ratingTrend = ratingHistory && ratingHistory.length >= 2 ? (() => {
        const recent = ratingHistory.slice(-5);
        const avgChange = recent.reduce((sum, r) => sum + (r.newRating - r.oldRating), 0) / recent.length;
        return avgChange > 0 ? <TrendingUp className="w-4 h-4 text-green-400" /> : avgChange < 0 ? <TrendingDown className="w-4 h-4 text-red-400" /> : <Minus className="w-4 h-4 text-zinc-400" />;
    })() : null;

    // Calculate overall score based on available data
    const metricsWithData = [ratingPercentile, solvedPercentile, contestPercentile].filter(p => p > 0);
    const overallPercentile = metricsWithData.length > 0 
        ? metricsWithData.reduce((a, b) => a + b, 0) / metricsWithData.length 
        : 0;

    // Estimate global rank based on rating percentile
    const estimatedRank = ratingPercentile > 0 
        ? Math.round((100 - ratingPercentile) / 100 * CF_STATS.totalUsers)
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a0b0b] border border-orange-500/10 rounded-2xl p-5 flex flex-col h-full relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/8 blur-[60px] rounded-full pointer-events-none" />

            <div className="flex items-center gap-2 mb-4 z-10">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                </div>
                <h3 className="font-semibold text-sm text-zinc-300">Percentile Tracker</h3>
                {ratingTrend && <span className="text-lg">{ratingTrend}</span>}
            </div>

            {/* Overall Score */}
            <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Overall Percentile</p>
                        <p className="text-2xl font-bold text-white">
                            {overallPercentile > 0 ? `Top ${Math.round(100 - overallPercentile)}%` : 'N/A'}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Est. Global Rank</p>
                        <p className="text-lg font-bold text-orange-400">
                            {estimatedRank ? `#${estimatedRank.toLocaleString()}` : '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Individual Metrics */}
            <div className="space-y-2 flex-1 overflow-y-auto z-10">
                <PercentileItem 
                    label="Current Rating"
                    value={rating || "Unrated"}
                    percentile={ratingPercentile}
                    icon={<Award className="w-4 h-4 text-orange-400" />}
                    color={getTierColor(rank)}
                    accentColor="bg-orange-500"
                />
                <PercentileItem 
                    label="Peak Rating"
                    value={maxRating || "—"}
                    percentile={maxRatingPercentile}
                    icon={<Zap className="w-4 h-4 text-yellow-400" />}
                    color={maxRating ? getTierColor(rank) : "text-zinc-500"}
                    accentColor="bg-yellow-500"
                />
                <PercentileItem 
                    label="Problems Solved"
                    value={totalSolved || 0}
                    percentile={solvedPercentile}
                    icon={<Code2 className="w-4 h-4 text-blue-400" />}
                    color="text-blue-400"
                    accentColor="bg-blue-500"
                />
                <PercentileItem 
                    label="Contests Attended"
                    value={totalContests || 0}
                    percentile={contestPercentile}
                    icon={<Target className="w-4 h-4 text-green-400" />}
                    color="text-green-400"
                    accentColor="bg-green-500"
                />
            </div>

            <div className="mt-3 pt-3 border-t border-white/5 text-center z-10">
                <p className="text-[10px] text-zinc-600">
                    Based on ~{CF_STATS.totalUsers.toLocaleString()} Codeforces users
                </p>
            </div>
        </motion.div>
    );
}
