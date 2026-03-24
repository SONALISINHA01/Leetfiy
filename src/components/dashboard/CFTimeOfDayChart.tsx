"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Clock, Flame } from "lucide-react";

interface CFSubmission {
    creationTimeSeconds?: number;
    verdict?: string;
}

interface CFTimeOfDayChartProps {
    submissions?: {
        creationTimeSeconds?: number;
    }[];
}

// Get hour from Unix timestamp in local timezone (IST = UTC+5:30)
function getHourInLocalTime(seconds: number): number {
    const date = new Date(seconds * 1000);
    // Get hours in IST (UTC+5:30)
    const istOffset = 5.5; // IST is UTC+5:30
    const utcHours = date.getUTCHours();
    let localHour = Math.floor(utcHours + istOffset);
    if (localHour >= 24) localHour -= 24;
    if (localHour < 0) localHour += 24;
    return localHour;
}

// Helper function to get date string from timestamp
function getDateString(seconds: number): string {
    const date = new Date(seconds * 1000);
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const hour = payload[0].payload.hour;
        const submissions = payload[0].value;
        const isPeak = payload[0].payload.isPeak;
        
        return (
            <div className="bg-zinc-900 border border-white/10 p-3 rounded-lg shadow-xl shadow-orange-500/10 backdrop-blur-md">
                <p className="font-bold text-white mb-1">
                    {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                </p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <p className="text-sm text-zinc-300">
                        <span className="text-white font-mono">{submissions}</span> submissions
                    </p>
                </div>
                {isPeak && (
                    <p className="text-xs text-orange-400 mt-1 font-medium flex items-center gap-1"><Flame className="w-3 h-3" /> Peak hour!</p>
                )}
            </div>
        );
    }
    return null;
};

export function CFTimeOfDayChart({ submissions }: CFTimeOfDayChartProps) {
    const [mounted, setMounted] = useState(false);
    const [selectedDay, setSelectedDay] = useState<string>("all");

    useEffect(() => {
        setMounted(true);
    }, []);

    // Get unique dates from submissions
    const availableDates = useMemo(() => {
        const dates = new Set<string>();
        dates.add("all"); // Add "all" option
        
        const subList = submissions || [];
        for (const sub of subList) {
            if (sub.creationTimeSeconds) {
                dates.add(getDateString(sub.creationTimeSeconds));
            }
        }
        
        // Convert to array and sort (newest first)
        return Array.from(dates).sort((a, b) => {
            if (a === "all") return -1;
            if (b === "all") return 1;
            return b.localeCompare(a);
        });
    }, [submissions]);

    if (!mounted) {
        return (
            <div className="bg-[#1a0b0b] border border-orange-500/10 rounded-2xl p-5 h-[280px] animate-pulse" />
        );
    }

    // Count submissions by hour in local time (IST)
    const hourCounts: number[] = new Array(24).fill(0);
    let totalSubs = 0;
    
    const subList = submissions || [];
    
    for (const sub of subList) {
        if (sub.creationTimeSeconds) {
            const dateStr = getDateString(sub.creationTimeSeconds);
            
            // Filter by selected day if not "all"
            if (selectedDay !== "all" && dateStr !== selectedDay) {
                continue;
            }
            
            const hour = getHourInLocalTime(sub.creationTimeSeconds);
            hourCounts[hour]++;
            totalSubs++;
        }
    }

    // Find peak hour
    const maxCount = Math.max(...hourCounts);
    
    // Create chart data
    const data = hourCounts.map((count, hour) => ({
        hour: hour,
        submissions: count,
        isPeak: count === maxCount && maxCount > 0,
    }));

    // Calculate periods
    const morningSubs = hourCounts.slice(6, 12).reduce((a, b) => a + b, 0);
    const afternoonSubs = hourCounts.slice(12, 18).reduce((a, b) => a + b, 0);
    const eveningSubs = hourCounts.slice(18, 24).reduce((a, b) => a + b, 0);
    const nightSubs = hourCounts.slice(0, 6).reduce((a, b) => a + b, 0);

    // Determine most active period
    const periods = [
        { name: "Morning", count: morningSubs, label: "6AM-12PM" },
        { name: "Afternoon", count: afternoonSubs, label: "12PM-6PM" },
        { name: "Evening", count: eveningSubs, label: "6PM-12AM" },
        { name: "Night", count: nightSubs, label: "12AM-6AM" },
    ];
    const mostActive = periods.reduce((a, b) => a.count > b.count ? a : b);

    // Find peak hour in local time
    const peakHourLocal = hourCounts.indexOf(maxCount);

    if (totalSubs === 0) {
        return (
            <div className="bg-[#1a0b0b] border border-orange-500/10 rounded-2xl p-5 h-[280px] flex flex-col items-center justify-center text-center">
                <Clock className="w-10 h-10 text-zinc-700 mb-3" />
                <h3 className="text-lg font-bold text-zinc-400">No Time Data</h3>
                <p className="text-sm text-zinc-600">Not enough submissions to analyze.</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a0b0b] border border-orange-500/10 rounded-2xl p-5 flex flex-col h-full relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/8 blur-[60px] rounded-full pointer-events-none" />

            <div className="flex items-center justify-between mb-4 z-10">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                        <Clock className="w-4 h-4 text-orange-400" />
                    </div>
                    <h3 className="font-semibold text-sm text-zinc-300">Productivity by Hour</h3>
                </div>
                <div className="text-right text-xs">
                    <p className="text-zinc-500">Peak (Local)</p>
                    <p className="text-orange-400 font-medium">
                        {peakHourLocal}:00
                    </p>
                </div>
            </div>

            {/* Day selector */}
            <div className="mb-4 z-10">
                <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs px-3 py-1.5 rounded-lg outline-none cursor-pointer hover:bg-orange-500/20"
                >
                    <option value="all">All Days</option>
                    {availableDates.filter(d => d !== "all").map(date => (
                        <option key={date} value={date}>{date}</option>
                    ))}
                </select>
            </div>

            {/* Summary badges */}
            <div className="flex gap-2 mb-4 z-10">
                <div className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Most Active</p>
                    <p className="text-sm font-bold text-orange-400">{mostActive.name}</p>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Total</p>
                    <p className="text-sm font-bold text-white">{totalSubs.toLocaleString()}</p>
                </div>
            </div>

            <div className="flex-1 min-h-[140px] z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <XAxis 
                            dataKey="hour" 
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                            tickLine={false}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            tickFormatter={(val) => {
                                if (val % 3 === 0) {
                                    return val === 0 ? "12a" : val < 12 ? `${val}a` : val === 12 ? "12p" : `${val-12}p`;
                                }
                                return "";
                            }}
                        />
                        <YAxis 
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Bar dataKey="submissions" radius={[2, 2, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.isPeak ? "#f97316" : entry.submissions > 0 ? "rgba(249, 115, 22, 0.6)" : "rgba(255,255,255,0.05)"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Hour labels */}
            <div className="flex justify-between text-[9px] text-zinc-600 px-1 z-10">
                <span>12a</span>
                <span>6a</span>
                <span>12p</span>
                <span>6p</span>
                <span>12a</span>
            </div>
        </motion.div>
    );
}
