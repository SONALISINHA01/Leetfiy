"use client";

import { useState, useEffect } from "react";
import { motion, Reorder } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Layers, X, Plus, GripVertical, Trash2, RefreshCw } from "lucide-react";

interface SkillItem {
    tagName: string;
    problemsSolved: number;
}

interface LCRadarChartProps {
    skills: {
        advanced: SkillItem[];
        intermediate: SkillItem[];
        fundamental: SkillItem[];
    } | null;
}

// All available LeetCode topics
const ALL_TOPICS = [
    // Arrays & Strings
    "Array", "String", "Hash Table", "Two Pointers", "Sliding Window",
    // Dynamic Programming
    "Dynamic Programming", "Memoization", "Combinatorics",
    // Math & Number Theory
    "Math", "Number Theory", "Geometry", "Bit Manipulation",
    // Algorithms
    "Sorting", "Greedy", "Binary Search", "Divide and Conquer",
    // Graph Algorithms
    "Graph", "Breadth-First Search", "Depth-First Search", "Union Find",
    // Trees & Tries
    "Tree", "Binary Tree", "Trie", "Segment Tree", "Binary Indexed Tree",
    // Data Structures
    "Stack", "Heap", "Priority Queue", "Queue", "Linked List",
    // Advanced
    "Backtracking", "Recursion", "Sliding Window", "Topological Sort",
    "Shortest Path", "Minimum Spanning Tree", "String Matching",
    "Rolling Hash", "Suffix Array", "Monotonic Stack", "Hash Function",
    "Counting", "Simulation", "Design", "Database", "Brainteaser",
    "Geometry", "Probability", "Game Theory", "Matrix", "Prefix Sum"
];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-900 border border-white/10 p-3 rounded-lg shadow-xl shadow-blue-500/10 backdrop-blur-md">
                <p className="font-bold text-white mb-1">{payload[0].payload.subject}</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <p className="text-sm text-zinc-300">
                        <span className="text-white font-mono">{payload[0].value}</span> solved
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export function LCRadarChart({ skills }: LCRadarChartProps) {
    const [mounted, setMounted] = useState(false);
    const [selectedTopics, setSelectedTopics] = useState<SkillItem[]>([]);
    const [showTopicPicker, setShowTopicPicker] = useState(false);
    const [availableTopics, setAvailableTopics] = useState<string[]>([]);
    const [topicCount, setTopicCount] = useState<number>(5); // Default to 5 topics

    useEffect(() => {
        setMounted(true);
        
        // Initialize selected topics from skills
        if (skills) {
            const allTopics = [
                ...skills.advanced,
                ...skills.intermediate,
                ...skills.fundamental
            ].filter((t, index, self) =>
                index === self.findIndex((t2) => t2.tagName === t.tagName)
            );
            setSelectedTopics(allTopics.slice(0, topicCount));
        }
    }, [skills, topicCount]);

    useEffect(() => {
        // Filter out already selected topics
        const selectedNames = selectedTopics.map(t => t.tagName);
        setAvailableTopics(ALL_TOPICS.filter(t => !selectedNames.includes(t)));
    }, [selectedTopics, topicCount]);

    const addTopic = (topicName: string) => {
        if (selectedTopics.length >= 8) return;
        
        const existingSkill = skills?.advanced.find(s => s.tagName === topicName) ||
            skills?.intermediate.find(s => s.tagName === topicName) ||
            skills?.fundamental.find(s => s.tagName === topicName);
        
        const newTopic: SkillItem = {
            tagName: topicName,
            problemsSolved: existingSkill?.problemsSolved || 0
        };
        setSelectedTopics([...selectedTopics, newTopic]);
    };

    const removeTopic = (index: number) => {
        setSelectedTopics(selectedTopics.filter((_, i) => i !== index));
    };

    const resetToDefaults = () => {
        if (skills) {
            const allTopics = [
                ...skills.advanced,
                ...skills.intermediate,
                ...skills.fundamental
            ].filter((t, index, self) =>
                index === self.findIndex((t2) => t2.tagName === t.tagName)
            );
            setSelectedTopics(allTopics.slice(0, topicCount));
        }
    };

    if (!mounted) {
        return (
            <div className="col-span-1 min-h-[300px] h-full rounded-2xl bg-zinc-950/80 border border-white/5 p-6 animate-pulse" />
        );
    }

    if (!skills || (!skills.advanced.length && !skills.intermediate.length && !skills.fundamental.length)) {
        return (
            <div className="col-span-1 min-h-[300px] h-full rounded-2xl bg-zinc-950/80 border border-white/5 p-6 flex flex-col items-center justify-center text-center">
                <Layers className="w-12 h-12 text-zinc-700 mb-4" />
                <h3 className="text-xl font-bold font-mono text-zinc-400">No Topic Data</h3>
                <p className="text-sm text-zinc-600 mt-2 max-w-xs">User hasn't solved enough categorized problems.</p>
            </div>
        );
    }

    // Use selected topics for the radar chart (based on topicCount)
    const displayTopics = selectedTopics.slice(0, topicCount);
    
    // Ensure at least 3 topics for the radar
    const minTopicsCount = Math.max(displayTopics.length, 3);
    const data = Array.from({ length: minTopicsCount }).map((_, i) => {
        if (displayTopics[i]) {
            return {
                subject: displayTopics[i].tagName,
                A: displayTopics[i].problemsSolved,
            };
        }
        return { subject: `Topic ${i + 1}`, A: 0 };
    });

    const maxVal = Math.max(...data.map(d => d.A), 1);
    const domainMax = Math.max(maxVal * 1.1, 10);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-1 p-4 rounded-2xl bg-[#0b121a] border border-blue-500/10 flex flex-col h-full relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex items-center justify-between mb-4 z-10">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Layers className="w-5 h-5 text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold font-mono tracking-tight text-white">Topic Mastery</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={resetToDefaults}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                        title="Reset to default"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    {/* Topic count selector */}
                    <select
                        value={topicCount}
                        onChange={(e) => setTopicCount(Number(e.target.value))}
                        className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-2 py-1.5 rounded-lg outline-none cursor-pointer hover:bg-blue-500/20"
                        title="Number of topics to display"
                    >
                        {[3, 4, 5, 6, 7, 8].map(num => (
                            <option key={num} value={num}>{num}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setShowTopicPicker(!showTopicPicker)}
                        className="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                        title="Add topic"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Topic picker dropdown */}
            {showTopicPicker && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 p-3 rounded-xl bg-zinc-900/80 border border-white/10 z-20 max-h-40 overflow-y-auto"
                >
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-2">Available Topics</p>
                    <div className="flex flex-wrap gap-1">
                        {availableTopics.length > 0 ? (
                            availableTopics.slice(0, 15).map((topic) => (
                                <button
                                    key={topic}
                                    onClick={() => addTopic(topic)}
                                    className="px-2 py-1 text-xs rounded-md bg-white/5 hover:bg-blue-500/20 text-zinc-300 hover:text-blue-300 transition-colors"
                                >
                                    + {topic}
                                </button>
                            ))
                        ) : (
                            <p className="text-xs text-zinc-500">All topics selected</p>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Selected topics list with remove capability */}
            <div className="flex flex-wrap gap-1 mb-3 z-10">
                {selectedTopics.map((topic, index) => (
                    <motion.div
                        key={`${topic.tagName}-${index}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-xs"
                    >
                        <GripVertical className="w-3 h-3 text-zinc-600 cursor-grab" />
                        <span className="text-blue-300">{topic.tagName}</span>
                        <span className="text-zinc-500">({topic.problemsSolved})</span>
                        <button
                            onClick={() => removeTopic(index)}
                            className="ml-1 p-0.5 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </motion.div>
                ))}
            </div>

            <div className="flex-1 w-full relative min-h-[200px] z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="rgba(59, 130, 246, 0.2)" />
                        <PolarAngleAxis 
                            dataKey="subject" 
                            tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 10, fontWeight: 500 }} 
                        />
                        <PolarRadiusAxis angle={30} domain={[0, domainMax]} tick={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Radar
                            name="Mastery"
                            dataKey="A"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="url(#colorBlueRadar)"
                            fillOpacity={0.6}
                        />
                        <defs>
                            <linearGradient id="colorBlueRadar" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2} />
                            </linearGradient>
                        </defs>
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
