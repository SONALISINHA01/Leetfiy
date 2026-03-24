"use client";

import { TreeDeciduous } from "lucide-react";

interface TopicTag {
    tag: string;
    count: number;
}

interface CFTopicTreeProps {
    topTags: TopicTag[];
    totalSolved: number;
}

function getMasteryLevel(count: number, maxCount: number): { label: string; color: string; glow: string; percent: number } {
    const ratio = maxCount > 0 ? count / maxCount : 0;
    if (ratio >= 0.8) return { label: "Mastered", color: "text-emerald-400", glow: "shadow-emerald-500/30", percent: Math.round(ratio * 100) };
    if (ratio >= 0.5) return { label: "Proficient", color: "text-cyan-400", glow: "shadow-cyan-500/20", percent: Math.round(ratio * 100) };
    if (ratio >= 0.25) return { label: "Learning", color: "text-amber-400", glow: "shadow-amber-500/20", percent: Math.round(ratio * 100) };
    return { label: "Beginner", color: "text-zinc-500", glow: "shadow-zinc-500/10", percent: Math.round(ratio * 100) };
}

function getMasteryBarColor(label: string): string {
    switch (label) {
        case "Mastered": return "bg-gradient-to-r from-emerald-500 to-emerald-400";
        case "Proficient": return "bg-gradient-to-r from-cyan-500 to-cyan-400";
        case "Learning": return "bg-gradient-to-r from-amber-500 to-amber-400";
        default: return "bg-gradient-to-r from-zinc-600 to-zinc-500";
    }
}

export function CFTopicTree({ topTags, totalSolved }: CFTopicTreeProps) {
    if (!topTags || topTags.length === 0) {
        return (
            <div className="h-full bg-zinc-950 border border-white/5 rounded-2xl p-6 flex items-center justify-center">
                <p className="text-zinc-500 text-sm">No topic data available.</p>
            </div>
        );
    }

    const maxCount = topTags[0]?.count || 1;

    return (
        <div className="h-full bg-zinc-950 border border-white/5 rounded-2xl p-6 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <TreeDeciduous className="w-5 h-5 text-green-400" /> Topic Mastery Tree
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">Based on {totalSolved} solved problems</p>
                </div>
                <div className="flex gap-3 text-[10px]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Mastered</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Proficient</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Learning</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-500" /> Beginner</span>
                </div>
            </div>

            {/* Tree Visualization */}
            <div className="space-y-3">
                {topTags.map((tag, idx) => {
                    const mastery = getMasteryLevel(tag.count, maxCount);
                    const barColor = getMasteryBarColor(mastery.label);

                    return (
                        <div
                            key={tag.tag}
                            className="group relative"
                            style={{ animationDelay: `${idx * 80}ms` }}
                        >
                            <div className={`flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300 hover:bg-white/[0.04] ${mastery.glow} hover:shadow-lg`}>
                                {/* Node connector line */}
                                <div className="flex flex-col items-center w-6 shrink-0">
                                    {idx === 0 && (
                                        <div className={`w-3 h-3 rounded-full border-2 ${mastery.label === "Mastered" ? "border-emerald-400 bg-emerald-400/30" : mastery.label === "Proficient" ? "border-cyan-400 bg-cyan-400/30" : mastery.label === "Learning" ? "border-amber-400 bg-amber-400/30" : "border-zinc-500 bg-zinc-500/30"}`} />
                                    )}
                                    {idx > 0 && (
                                        <>
                                            <div className="w-px h-1 bg-white/10" />
                                            <div className={`w-2.5 h-2.5 rounded-full border-2 ${mastery.label === "Mastered" ? "border-emerald-400 bg-emerald-400/30" : mastery.label === "Proficient" ? "border-cyan-400 bg-cyan-400/30" : mastery.label === "Learning" ? "border-amber-400 bg-amber-400/30" : "border-zinc-500 bg-zinc-500/30"}`} />
                                        </>
                                    )}
                                </div>

                                {/* Tag name */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-sm font-semibold text-white capitalize truncate">{tag.tag}</span>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${mastery.color}`}>{mastery.label}</span>
                                            <span className="text-xs text-zinc-500 font-mono">{tag.count} solved</span>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
                                            style={{ width: `${mastery.percent}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
