"use client";

import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { AlertTriangle, TrendingDown, Target } from "lucide-react";

interface SkillItem {
    tagName: string;
    problemsSolved: number;
}

interface LCWeaknessRadarProps {
    skills: {
        advanced: SkillItem[];
        intermediate: SkillItem[];
        fundamental: SkillItem[];
    } | null;
}

// Common LeetCode topic categories
const TOPIC_CATEGORIES = [
    "Array", "String", "Hash Table", "Dynamic Programming", "Math",
    "Sorting", "Greedy", "Depth-First Search", "Binary Search",
    "Breadth-First Search", "Tree", "Matrix", "Two Pointers",
    "Stack", "Heap", "Graph", "Linked List", "Recursion"
];

// Calculate weakness scores - topics not well covered
function calculateWeaknessScores(skills: LCWeaknessRadarProps['skills']): { subject: string; weakness: number; fullMark: number }[] {
    if (!skills) return [];
    
    // Flatten all user topics
    const allUserSkills = [
        ...skills.advanced,
        ...skills.intermediate,
        ...skills.fundamental
    ];
    
    const userTopicCounts = new Map<string, number>();
    for (const skill of allUserSkills) {
        userTopicCounts.set(skill.tagName.toLowerCase(), skill.problemsSolved);
    }
    
    const maxCount = Math.max(...allUserSkills.map(s => s.problemsSolved), 1);
    
    // Create data for major topics
    const topicData = TOPIC_CATEGORIES.map(topic => {
        let count = 0;
        // Check if any user topic matches this category
        userTopicCounts.forEach((userCount, userTopic) => {
            if (userTopic.includes(topic.toLowerCase()) || topic.toLowerCase().includes(userTopic)) {
                count = Math.max(count, userCount);
            }
        });
        
        const strength = (count / maxCount) * 100;
        const weakness = 100 - strength;
        
        return {
            subject: topic,
            weakness: Math.round(weakness),
            fullMark: 100,
        };
    });
    
    // Sort by weakness (highest first)
    return topicData.sort((a, b) => b.weakness - a.weakness);
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const weakness = payload[0].value;
        const isWeak = weakness > 50;
        
        return (
            <div className="bg-zinc-900 border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
                <p className="font-bold text-white mb-1">{payload[0].payload.subject}</p>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isWeak ? 'bg-red-500' : 'bg-green-500'}`} />
                    <p className="text-sm text-zinc-300">
                        <span className={`font-mono font-bold ${isWeak ? 'text-red-400' : 'text-green-400'}`}>
                            {weakness}%
                        </span> weakness
                    </p>
                </div>
                {isWeak && (
                    <p className="text-xs text-red-400 mt-1 font-medium">⚠️ Needs improvement</p>
                )}
            </div>
        );
    }
    return null;
};

export function LCWeaknessRadar({ skills }: LCWeaknessRadarProps) {
    if (!skills || (!skills.advanced.length && !skills.intermediate.length && !skills.fundamental.length)) {
        return (
            <div className="col-span-1 min-h-[300px] h-full rounded-2xl bg-zinc-950/80 border border-white/5 p-6 flex flex-col items-center justify-center text-center">
                <AlertTriangle className="w-12 h-12 text-zinc-700 mb-4" />
                <h3 className="text-xl font-bold font-mono text-zinc-400">No Topic Data</h3>
                <p className="text-sm text-zinc-600 mt-2 max-w-xs">User hasn't solved enough categorized problems.</p>
            </div>
        );
    }

    const weaknessData = calculateWeaknessScores(skills);
    const topWeaknesses = weaknessData.filter(w => w.weakness > 50).slice(0, 3);
    
    // Get top 6 topics for radar visualization (mix of weak and strong)
    const displayData = [
        ...weaknessData.filter(w => w.weakness > 50).slice(0, 3),
        ...weaknessData.filter(w => w.weakness <= 50).slice(0, 3)
    ];

    if (displayData.length < 3) {
        // Pad with defaults if not enough data
        while (displayData.length < 6) {
            displayData.push({ subject: `Topic ${displayData.length + 1}`, weakness: 0, fullMark: 100 });
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-1 p-6 rounded-2xl bg-[#0b121a] border border-red-500/10 flex flex-col h-full relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex items-center gap-2 mb-4 z-10">
                <div className="p-2 bg-red-500/20 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-red-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold font-mono tracking-tight text-white">Weakness Radar</h2>
                    <p className="text-xs text-zinc-500">Topics needing attention</p>
                </div>
            </div>

            {/* Top weaknesses badges */}
            {topWeaknesses.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 z-10">
                    {topWeaknesses.map((w, i) => (
                        <div key={i} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3 text-red-400" />
                            <span className="text-xs font-medium text-red-300">{w.subject}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex-1 w-full relative min-h-[220px] z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={displayData}>
                        <PolarGrid stroke="rgba(239, 68, 68, 0.2)" />
                        <PolarAngleAxis 
                            dataKey="subject" 
                            tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 10, fontWeight: 500 }} 
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Radar
                            name="Weakness"
                            dataKey="weakness"
                            stroke="#ef4444"
                            strokeWidth={2}
                            fill="url(#colorRedRadarLC)"
                            fillOpacity={0.5}
                        />
                        <defs>
                            <linearGradient id="colorRedRadarLC" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0.2} />
                            </linearGradient>
                        </defs>
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs text-zinc-500 z-10">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span>High weakness</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Strong area</span>
                </div>
            </div>
        </motion.div>
    );
}
