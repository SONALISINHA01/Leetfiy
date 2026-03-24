"use client";

import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Layers } from "lucide-react";

interface CFRadarChartProps {
    topTags: { tag: string; count: number }[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-900 border border-white/10 p-3 rounded-lg shadow-xl shadow-orange-500/10 backdrop-blur-md">
                <p className="font-bold text-white mb-1 capitalize">{payload[0].payload.subject}</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <p className="text-sm text-zinc-300">
                        <span className="text-white font-mono">{payload[0].value}</span> solved
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export function CFRadarChart({ topTags }: CFRadarChartProps) {
    if (!topTags || topTags.length === 0) {
        return (
            <div className="col-span-1 min-h-[300px] h-full rounded-2xl bg-zinc-950/80 border border-white/5 p-6 flex flex-col items-center justify-center text-center">
                <Layers className="w-12 h-12 text-zinc-700 mb-4" />
                <h3 className="text-xl font-bold font-mono text-zinc-400">No Topic Data</h3>
                <p className="text-sm text-zinc-600 mt-2 max-w-xs">User hasn't solved enough categorized problems.</p>
            </div>
        );
    }

    // Limit to 6 topics
    const displayTopics = topTags.slice(0, 6);

    // If fewer than 3 topics, radar chart looks broken (needs at least a triangle), so we pad it
    const minTopicsCount = Math.max(displayTopics.length, 3);
    const data = Array.from({ length: minTopicsCount }).map((_, i) => {
        if (displayTopics[i]) {
            return {
                subject: displayTopics[i].tag,
                A: displayTopics[i].count,
            };
        }
        return { subject: `Topic ${i + 1}`, A: 0 };
    });

    const maxVal = Math.max(...data.map(d => d.A));
    const domainMax = Math.max(maxVal * 1.1, 10);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-1 p-6 rounded-2xl bg-[#1a0b0b] border border-orange-500/10 flex flex-col h-full relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex items-center gap-2 mb-6 z-10">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Layers className="w-5 h-5 text-orange-400" />
                </div>
                <h2 className="text-xl font-bold font-mono tracking-tight text-white">Topic Mastery Radar</h2>
            </div>

            <div className="flex-1 w-full relative min-h-[250px] z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="rgba(249, 115, 22, 0.2)" />
                        <PolarAngleAxis 
                            dataKey="subject" 
                            tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 11, fontWeight: 500 }} 
                        />
                        <PolarRadiusAxis angle={30} domain={[0, domainMax]} tick={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Radar
                            name="Mastery"
                            dataKey="A"
                            stroke="#f97316"
                            strokeWidth={2}
                            fill="url(#colorOrangeRadar)"
                            fillOpacity={0.6}
                        />
                        <defs>
                            <linearGradient id="colorOrangeRadar" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2} />
                            </linearGradient>
                        </defs>
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
