"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Clock, Calendar, Flame } from "lucide-react";

interface LCRecentSubmission {
    timestamp?: number;
    id?: string;
    statusDisplay?: string;
    lang?: string;
}

interface LCSubmissionCalendar {
    [timestamp: string]: number;
}

interface LCTimeOfDayChartProps {
    recentSubmissions?: {
        timestamp?: number;
    }[];
    submissionCalendar?: string | Record<string, number>;
}

// Helper function to calculate hour of day from timestamp
function getHourOfDay(timestamp: number): number {
    const date = new Date(timestamp * 1000);
    return date.getUTCHours();
}

// Helper function to get date string from timestamp
function getDateString(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

// Get day of week from timestamp (0 = Sunday, 6 = Saturday)
function getDayOfWeek(timestamp: number): number {
    const date = new Date(timestamp * 1000);
    return date.getUTCDay();
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const hour = payload[0].payload.hour;
        const submissions = payload[0].value;
        const isPeak = payload[0].payload.isPeak;
        
        return (
            <div className="bg-zinc-900 border border-white/10 p-3 rounded-lg shadow-xl shadow-blue-500/10 backdrop-blur-md">
                <p className="font-bold text-white mb-1">
                    {typeof hour === 'string' ? hour : (hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`)}
                </p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <p className="text-sm text-zinc-300">
                        <span className="text-white font-mono">{submissions}</span> submissions
                    </p>
                </div>
                {isPeak && (
                    <p className="text-xs text-blue-400 mt-1 font-medium flex items-center gap-1"><Flame className="w-3 h-3" /> Peak!</p>
                )}
            </div>
        );
    }
    return null;
};

export function LCTimeOfDayChart({ recentSubmissions, submissionCalendar }: LCTimeOfDayChartProps) {
    const [mounted, setMounted] = useState(false);
    const [selectedDay, setSelectedDay] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"hour" | "dayofweek">("hour");

    useEffect(() => {
        setMounted(true);
    }, []);

    // Get unique dates from submissions
    const availableDates = useMemo(() => {
        const dates = new Set<string>();
        dates.add("all"); // Add "all" option
        
        const subList = recentSubmissions || [];
        for (const sub of subList) {
            if (sub.timestamp) {
                dates.add(getDateString(sub.timestamp));
            }
        }
        
        // Convert to array and sort (newest first)
        return Array.from(dates).sort((a, b) => {
            if (a === "all") return -1;
            if (b === "all") return 1;
            return b.localeCompare(a);
        });
    }, [recentSubmissions]);

    if (!mounted) {
        return (
            <div className="bg-[#0b121a] border border-blue-500/10 rounded-2xl p-5 h-[280px] animate-pulse" />
        );
    }

    // Process submissions and count by hour
    const hourCounts: number[] = new Array(24).fill(0);
    const dayOfWeekCounts: number[] = new Array(7).fill(0);
    let totalSubs = 0;
    let hasTimestamps = false;

    const subList = recentSubmissions || [];
    
    // First check if we have timestamp data
    for (const sub of subList) {
        if (sub.timestamp) {
            hasTimestamps = true;
            break;
        }
    }
    
    // If we have timestamps, process hourly data
    if (hasTimestamps) {
        for (const sub of subList) {
            if (sub.timestamp) {
                const dateStr = getDateString(sub.timestamp);
                
                // Filter by selected day if not "all"
                if (selectedDay !== "all" && dateStr !== selectedDay) {
                    continue;
                }
                
                const hour = getHourOfDay(sub.timestamp);
                hourCounts[hour]++;
                totalSubs++;
                
                // Also count by day of week
                const dayOfWeek = getDayOfWeek(sub.timestamp);
                dayOfWeekCounts[dayOfWeek]++;
            }
        }
    } else if (submissionCalendar) {
        // Use calendar data to show day of week patterns
        try {
            let calData: Record<string, number> = {};
            
            if (typeof submissionCalendar === 'string') {
                calData = JSON.parse(submissionCalendar);
            } else if (typeof submissionCalendar === 'object') {
                calData = submissionCalendar;
            }

            // Convert calendar to day of week distribution
            // Calendar keys are dates, values are submission counts
            for (const [dateStr, count] of Object.entries(calData)) {
                const date = new Date(dateStr);
                if (!isNaN(date.getTime())) {
                    const dayOfWeek = date.getUTCDay();
                    dayOfWeekCounts[dayOfWeek] += count;
                    totalSubs += count;
                }
            }
            
            if (totalSubs > 0) {
                setViewMode("dayofweek");
            }
        } catch (e) {
            console.error("[LCTimeOfDay] Failed to parse calendar:", e);
        }
    }

    // Find peak
    const currentCounts = viewMode === "hour" ? hourCounts : dayOfWeekCounts;
    const maxCount = Math.max(...currentCounts);
    
    // Create chart data
    const data = currentCounts.map((count, i) => ({
        hour: viewMode === "hour" ? i : DAY_NAMES[i],
        submissions: count,
        isPeak: count === maxCount && maxCount > 0,
    }));

    // Calculate periods for hourly view
    const morningSubs = hourCounts.slice(6, 12).reduce((a, b) => a + b, 0);
    const afternoonSubs = hourCounts.slice(12, 18).reduce((a, b) => a + b, 0);
    const eveningSubs = hourCounts.slice(18, 24).reduce((a, b) => a + b, 0);
    const nightSubs = hourCounts.slice(0, 6).reduce((a, b) => a + b, 0);

    const periods = [
        { name: "Morning", count: morningSubs, label: "6AM-12PM" },
        { name: "Afternoon", count: afternoonSubs, label: "12PM-6PM" },
        { name: "Evening", count: eveningSubs, label: "6PM-12AM" },
        { name: "Night", count: nightSubs, label: "12AM-6AM" },
    ];
    const mostActive = periods.reduce((a, b) => a.count > b.count ? a : b);

    // Find peak hour in UTC
    const peakHourUTC = hourCounts.indexOf(maxCount);
    const peakDay = DAY_NAMES[dayOfWeekCounts.indexOf(maxCount)];

    if (totalSubs === 0) {
        return (
            <div className="bg-[#0b121a] border border-blue-500/10 rounded-2xl p-5 h-[280px] flex flex-col items-center justify-center text-center">
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
            className="bg-[#0b121a] border border-blue-500/10 rounded-2xl p-5 flex flex-col h-full relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/8 blur-[60px] rounded-full pointer-events-none" />

            <div className="flex items-center justify-between mb-4 z-10">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Clock className="w-4 h-4 text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-sm text-zinc-300">
                        {viewMode === "hour" ? "Productivity by Hour" : "Submissions by Day"}
                    </h3>
                </div>
                <div className="text-right text-xs">
                    <p className="text-zinc-500">Peak</p>
                    <p className="text-blue-400 font-medium">
                        {viewMode === "hour" ? `${peakHourUTC}:00 UTC` : peakDay}
                    </p>
                </div>
            </div>

            {/* View mode and day selector */}
            <div className="flex gap-2 mb-4 z-10">
                <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value as "hour" | "dayofweek")}
                    className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-3 py-1.5 rounded-lg outline-none cursor-pointer hover:bg-blue-500/20"
                >
                    <option value="hour">By Hour</option>
                    <option value="dayofweek">By Day</option>
                </select>
                
                {viewMode === "hour" && hasTimestamps && (
                    <select
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(e.target.value)}
                        className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-3 py-1.5 rounded-lg outline-none cursor-pointer hover:bg-blue-500/20"
                    >
                        <option value="all">All Days</option>
                        {availableDates.filter(d => d !== "all").map(date => (
                            <option key={date} value={date}>{date}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Summary badges */}
            <div className="flex gap-2 mb-4 z-10">
                {viewMode === "hour" && hasTimestamps ? (
                    <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Most Active</p>
                        <p className="text-sm font-bold text-blue-400">{mostActive.name}</p>
                    </div>
                ) : (
                    <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Most Active</p>
                        <p className="text-sm font-bold text-blue-400">{peakDay}</p>
                    </div>
                )}
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
                                    fill={entry.isPeak ? "#3b82f6" : entry.submissions > 0 ? "rgba(59, 130, 246, 0.6)" : "rgba(255,255,255,0.05)"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Labels */}
            <div className="flex justify-between text-[9px] text-zinc-600 px-1 z-10">
                {viewMode === "hour" ? (
                    <>
                        <span>12a</span>
                        <span>6a</span>
                        <span>12p</span>
                        <span>6p</span>
                        <span>12a</span>
                    </>
                ) : (
                    <>
                        <span>Sun</span>
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                    </>
                )}
            </div>
        </motion.div>
    );
}
