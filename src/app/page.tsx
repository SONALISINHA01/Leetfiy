"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Search, Flame, Github, Terminal, Code2, Zap, ChevronDown,
  BarChart3, Brain, Clock, ListChecks, Users, Trophy, Swords,
  Target, TrendingUp, BookOpen, Star, Sparkles, ArrowRight,
  Shield, Rocket, Crown, Medal, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FloatingParticles from "@/components/animations/FloatingParticles";
import AnimatedCounter from "@/components/animations/AnimatedCounter";
import GlowCard from "@/components/animations/GlowCard";
import { getAllTiers, getTierIcon } from "@/lib/tiers";

type CPPlatform = "leetcode" | "codeforces";
type AppMode = "analyze" | "review" | "reminder";

/* ─── Scroll-animated section wrapper ─── */
function AnimatedSection({ children, className = "", delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─── Section heading ─── */
function SectionHeading({ badge, title, subtitle }: {
  badge: string;
  title: React.ReactNode;
  subtitle: string;
}) {
  return (
    <div className="text-center mb-16 space-y-4">
      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
        <Sparkles className="w-3.5 h-3.5" />
        {badge}
      </span>
      <h2 className="text-3xl md:text-5xl font-bold text-white">{title}</h2>
      <p className="text-zinc-400 text-lg max-w-2xl mx-auto">{subtitle}</p>
    </div>
  );
}

/* ─── Feature data ─── */
const FEATURES = [
  {
    icon: <Flame className="w-7 h-7" />,
    title: "AI Roaster",
    description: "Get your coding profile brutally roasted by AI. From \"Copium Coder\" to \"Actual Human\" — shareable roast cards, 1v1 comparisons.",
    color: "from-orange-500 to-red-500",
    glowColor: "rgba(249, 115, 22, 0.15)",
    tags: ["Shareable Cards", "1v1 Battle", "Roast Tiers"],
  },
  {
    icon: <BarChart3 className="w-7 h-7" />,
    title: "Deep Analyzer",
    description: "Submission heatmaps, topic weakness radar, contest rating graphs, time-of-day productivity — every stat you need.",
    color: "from-blue-500 to-cyan-500",
    glowColor: "rgba(59, 130, 246, 0.15)",
    tags: ["Heatmaps", "Radar Charts", "Percentile Tracker"],
  },
  {
    icon: <Clock className="w-7 h-7" />,
    title: "Smart Reminders",
    description: "Spaced repetition engine that resurfaces problems you solved. Pre-interview mode intensifies your weak topics automatically.",
    color: "from-green-500 to-emerald-500",
    glowColor: "rgba(34, 197, 94, 0.15)",
    tags: ["Spaced Repetition", "Pre-Interview", "Daily Nudges"],
  },
  {
    icon: <ListChecks className="w-7 h-7" />,
    title: "Question Lists",
    description: "Tag problems with custom labels, auto-suggest by company + topic gap, import NeetCode/Blind 75. Export as PDF study sheets.",
    color: "from-yellow-500 to-amber-500",
    glowColor: "rgba(234, 179, 8, 0.15)",
    tags: ["Custom Tags", "Company Filter", "PDF Export"],
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: "Paired Learner",
    description: "Match with learners by rating + topic interest. Shared problem queues, async code diffs, and timed challenges.",
    color: "from-purple-500 to-pink-500",
    glowColor: "rgba(168, 85, 247, 0.15)",
    tags: ["Pair Matching", "Code Diff", "Challenges"],
  },
];

const GAMIFICATION = [
  {
    icon: <Trophy className="w-6 h-6 text-yellow-400" />,
    title: "XP & Progression",
    description: "Earn XP per problem. Skill tree visualization per topic. Weekly XP decay if inactive.",
  },
  {
    icon: <Swords className="w-6 h-6 text-red-400" />,
    title: "1v1 Duels",
    description: "Same problem, who submits AC first? Real-time competitive coding against matched opponents.",
  },
  {
    icon: <Crown className="w-6 h-6 text-purple-400" />,
    title: "Seasonal Rankings",
    description: "Monthly leaderboard resets. College-level filters. Most improved badges.",
  },
  {
    icon: <Target className="w-6 h-6 text-cyan-400" />,
    title: "Weakness Autopilot",
    description: "Auto-adds problems from your 3 weakest topics to your daily queue. Never avoid segment trees again.",
  },
];

const ROAST_TIERS = getAllTiers();

/* ─── Main Page ─── */
export default function Home() {
  const [username, setUsername] = useState("");
  const [player2, setPlayer2] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [cpPlatform, setCpPlatform] = useState<CPPlatform>("leetcode");
  const [appMode, setAppMode] = useState<AppMode>("analyze");
  const [isBattleMode, setIsBattleMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    
    // Close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showModeDropdown && !target.closest('.mode-dropdown')) {
        setShowModeDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showModeDropdown]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || (isBattleMode && !player2.trim())) return;
    setIsScanning(true);
    setTimeout(() => {
        // Navigate based on mode (analyze vs review vs reminder)
        if (appMode === "review" || appMode === "reminder") {
          // For review/reminder mode, go to review page
          const platformSlug = cpPlatform === "codeforces" ? "cf" : "lc";
          router.push(`/review/${platformSlug}/${username}`);
        } else if (cpPlatform === "codeforces") {
          if (isBattleMode) {
            router.push(`/battle/cf/${username}/${player2}`);
          } else {
            router.push(`/cf/${username}`);
          }
        } else {
          if (isBattleMode) {
            router.push(`/battle/cp/${username}/${player2}`);
          } else {
            router.push(`/cp/${username}`);
          }
        }
    }, 1500);
  };

  const isCF = cpPlatform === "codeforces";
  const accentColor = isCF ? "from-orange-500 to-red-500" : "from-blue-500 to-cyan-500";
  const glowColor = isCF ? "bg-orange-900/20" : "bg-blue-900/20";
  const tagColor = isCF ? "text-orange-300" : "text-blue-300";
  const tagIcon = isCF ? <Flame className="w-4 h-4 text-orange-500" /> : <Zap className="w-4 h-4 text-cyan-400" />;

  const placeholderText = isCF
      ? (isBattleMode ? "Player 1 Codeforces..." : appMode === "review" ? "Enter Codeforces handle for review..." : appMode === "reminder" ? "Enter Codeforces handle for reminders..." : "Enter Codeforces handle...")
      : (isBattleMode ? "Player 1 LeetCode..." : appMode === "review" ? "Enter LeetCode username for review..." : appMode === "reminder" ? "Enter LeetCode username for reminders..." : "Enter LeetCode username...");

  const tagLabel = appMode === "review" 
      ? "Smart Review Mode" 
      : appMode === "reminder"
        ? "Smart Reminders"
        : isCF ? "The Ultimate Codeforces Analyzer" : "The Ultimate LeetCode Analyzer";

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 relative overflow-hidden">
      <FloatingParticles count={60} />

      {/* ═══════════════════ STICKY NAV ═══════════════════ */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "bg-black/80 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-purple-500/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold">
              Leet<span className="gradient-text">ify</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#gamification" className="hover:text-white transition-colors">Gamification</a>
            <a href="#community" className="hover:text-white transition-colors">Community</a>
            <a href="#tiers" className="hover:text-white transition-colors">Roast Tiers</a>
          </div>
          <Button
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0 rounded-full px-6 text-sm font-semibold shadow-lg shadow-purple-500/20"
            onClick={() => document.getElementById("hero-search")?.scrollIntoView({ behavior: "smooth" })}
          >
            Get Roasted
          </Button>
        </div>
      </motion.nav>

      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        {/* Ambient glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] animate-pulse-glow pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-glow pointer-events-none" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[160px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="z-10 w-full max-w-3xl flex flex-col items-center text-center space-y-8"
        >
          {/* Mode Toggles */}
          <div className="flex flex-col sm:flex-row items-center gap-4 relative z-20">
            {/* CP Platform Sub-toggle */}
            <div className="flex bg-zinc-900/60 p-1.5 rounded-2xl border border-white/10 w-fit backdrop-blur-md shadow-2xl">
              <button
                onClick={() => { setCpPlatform("leetcode"); setUsername(""); setPlayer2(""); setIsScanning(false); }}
                className={`relative px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 ${!isCF ? "text-cyan-400" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                {!isCF && (
                  <motion.div layoutId="cp-platform-bg" className="absolute inset-0 bg-cyan-500/10 rounded-xl border border-cyan-500/20" />
                )}
                <span className="relative z-10 flex items-center gap-2"><Code2 className="w-4 h-4" /> LeetCode</span>
              </button>
              <button
                onClick={() => { setCpPlatform("codeforces"); setUsername(""); setPlayer2(""); setIsScanning(false); }}
                className={`relative px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 ${isCF ? "text-orange-400" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                {isCF && (
                  <motion.div layoutId="cp-platform-bg" className="absolute inset-0 bg-orange-500/10 rounded-xl border border-orange-500/20" />
                )}
                <span className="relative z-10 flex items-center gap-2"><Trophy className="w-4 h-4" /> Codeforces</span>
              </button>
            </div>

            <div className="flex bg-zinc-900/80 p-1.5 rounded-2xl w-fit border border-white/10 shadow-2xl backdrop-blur-md">
              <button
                onClick={() => setIsBattleMode(!isBattleMode)}
                className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-300 ${isBattleMode ? "text-red-400" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                {isBattleMode && (
                  <motion.div layoutId="battle-bg" className="absolute inset-0 bg-red-500/10 rounded-xl border border-red-500/20" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                <span className="relative z-10 flex items-center gap-2"><Swords className="w-4 h-4" /> 1v1 Battle</span>
              </button>
            </div>

            <div className="flex bg-zinc-900/80 p-1.5 rounded-2xl w-fit border border-white/10 shadow-2xl backdrop-blur-md relative mode-dropdown">
              <button
                onClick={() => setShowModeDropdown(!showModeDropdown)}
                className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-300 ${appMode ? "text-emerald-400" : "text-blue-400"}`}
              >
                <motion.div layoutId="app-mode-bg" className="absolute inset-0 bg-blue-500/10 rounded-xl border border-blue-500/20" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                <span className="relative z-10 flex items-center gap-2">
                  {appMode === "review" ? <Target className="w-4 h-4" /> : appMode === "reminder" ? <Bell className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
                  {appMode === "review" ? "Smart Review" : appMode === "reminder" ? "Reminders" : "Analyze & Roast"}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showModeDropdown ? 'rotate-180' : ''}`} />
                </span>
              </button>
              
              {/* Dropdown Menu */}
              <AnimatePresence>
                {showModeDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 left-0 w-48 py-2 rounded-xl bg-zinc-900 border border-white/10 shadow-xl z-50"
                  >
                    <button
                      onClick={() => { setAppMode("analyze"); setShowModeDropdown(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${appMode === "analyze" ? "bg-blue-500/10 text-blue-400" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      Analyze
                    </button>
                    <button
                      onClick={() => { setAppMode("review"); setShowModeDropdown(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${appMode === "review" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
                    >
                      <Target className="w-4 h-4" />
                      Review
                    </button>
                    <button
                      onClick={() => { setAppMode("reminder"); setShowModeDropdown(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${appMode === "reminder" ? "bg-purple-500/10 text-purple-400" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
                    >
                      <Bell className="w-4 h-4" />
                      Reminder
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Tag */}
          <motion.div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium transition-colors duration-500 ${tagColor}`}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {tagIcon}
            <span>{tagLabel}</span>
          </motion.div>

          {/* Title */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={cpPlatform}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-4 leading-none">
                  Leet<span className="gradient-text animate-text-glow">ify</span>
                </h1>
                <p className="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto leading-relaxed">
                  {appMode === "review" 
                    ? "Spaced repetition for LeetCode & Codeforces. Master weak areas systematically."
                    : isCF 
                      ? "Get your Codeforces profile dissected, your rating mocked, and your algorithms ranked."
                      : "Get your LeetCode stats destroyed, FAANG readiness evaluated, and your algorithms mocked."
                  }
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Search Bar */}
          <motion.div
            id="hero-search"
            className="w-full max-w-xl mt-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <form onSubmit={handleSearch} className="relative group flex flex-col gap-4">
              <div className={`absolute -inset-0.5 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500 bg-gradient-to-r ${isBattleMode ? "from-red-500 to-orange-500" : accentColor}`}></div>

              <div className="relative flex flex-col md:flex-row items-center gap-2 bg-zinc-950 border border-white/10 rounded-xl overflow-hidden p-2 shadow-2xl">
                <div className="relative flex-1 w-full flex items-center">
                  <Code2 className="absolute left-4 w-5 h-5 text-zinc-400" />
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={placeholderText}
                    className="w-full bg-transparent border-none text-lg px-12 py-6 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-zinc-600 outline-none"
                    disabled={isScanning}
                  />
                </div>

                {isBattleMode && (
                  <>
                    <div className="hidden md:flex w-px h-8 bg-white/10" />
                    <div className="relative flex-1 w-full flex items-center border-t md:border-t-0 border-white/10">
                      <span className="absolute left-4 text-xs font-bold text-red-500 tracking-widest">VS</span>
                      <Input
                        value={player2}
                        onChange={(e) => setPlayer2(e.target.value)}
                        placeholder={isCF ? "Player 2 Codeforces..." : "Player 2 LeetCode..."}
                        className="w-full bg-transparent border-none text-lg px-12 py-6 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-zinc-600 outline-none"
                        disabled={isScanning}
                      />
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={!username.trim() || (isBattleMode && !player2.trim()) || isScanning}
                  className={`text-black hover:bg-zinc-200 rounded-lg px-8 font-semibold transition-all md:ml-2 w-full md:w-auto ${isBattleMode ? "bg-red-400 hover:bg-red-300 shadow-[0_0_20px_rgba(248,113,113,0.3)]" : isCF ? "bg-orange-400 hover:bg-orange-300 text-black shadow-[0_0_20px_rgba(249,115,22,0.3)]" : "bg-white shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"}`}
                >
                  {isScanning ? (
                    <Terminal className="w-5 h-5 animate-pulse" />
                  ) : (
                    isBattleMode ? "FIGHT" : appMode === "review" ? "Start Review" : appMode === "reminder" ? "View Reminders" : "Analyze Profile"
                  )}
                </Button>
              </div>
            </form>

            {isScanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mt-6 flex flex-col items-center gap-2 text-sm font-mono ${isCF ? "text-orange-400" : "text-blue-400"}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-ping ${isCF ? "bg-orange-500" : "bg-blue-500"}`} />
                  <span>{isCF ? "Analyzing Codeforces..." : appMode === "review" ? "Preparing Review Session..." : appMode === "reminder" ? "Loading Reminders..." : "Analyzing Submissions..."}</span>
                </div>
                <p className="text-zinc-500">{appMode === "review" ? "Loading spaced repetition protocol..." : appMode === "reminder" ? "Fetching your scheduled problems..." : "Preparing brutal honesty protocol v4.0..."}</p>
              </motion.div>
            )}
          </motion.div>

          {/* Feature pills */}
          <motion.div
            className="flex flex-wrap justify-center gap-3 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {(appMode === "review" ? [
              { icon: <ListChecks className="w-3.5 h-3.5" />, label: "Spaced Repetition" },
              { icon: <Brain className="w-3.5 h-3.5" />, label: "Weak Topics" },
              { icon: <Clock className="w-3.5 h-3.5" />, label: "Due Problems" },
              { icon: <Target className="w-3.5 h-3.5" />, label: "Focus Mode" },
              { icon: <BarChart3 className="w-3.5 h-3.5" />, label: "Progress" },
              { icon: <Zap className="w-3.5 h-3.5" />, label: "Streak" },
            ] : appMode === "reminder" ? [
              { icon: <Bell className="w-3.5 h-3.5" />, label: "Daily Nudges" },
              { icon: <Clock className="w-3.5 h-3.5" />, label: "Scheduled" },
              { icon: <ListChecks className="w-3.5 h-3.5" />, label: "Due Today" },
              { icon: <Target className="w-3.5 h-3.5" />, label: "Streak" },
              { icon: <Brain className="w-3.5 h-3.5" />, label: "Weak Topics" },
              { icon: <Zap className="w-3.5 h-3.5" />, label: "Smart Alerts" },
            ] : [
              { icon: <Flame className="w-3.5 h-3.5" />, label: "AI Roast" },
              { icon: <BarChart3 className="w-3.5 h-3.5" />, label: "Analytics" },
              { icon: <Clock className="w-3.5 h-3.5" />, label: "Reminders" },
              { icon: <ListChecks className="w-3.5 h-3.5" />, label: "Lists" },
              { icon: <Users className="w-3.5 h-3.5" />, label: "Pair Learning" },
              { icon: <Trophy className="w-3.5 h-3.5" />, label: "Gamification" },
            ]).map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-zinc-400 text-xs font-medium hover:bg-white/[0.06] hover:text-zinc-300 transition-all cursor-default"
              >
                {item.icon}
                {item.label}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 z-10"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-6 h-6 text-zinc-600" />
        </motion.div>
      </section>

      {/* ═══════════════════ STATS BAR ═══════════════════ */}
      <AnimatedSection className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 glass-card rounded-2xl divide-x divide-white/5">
          <AnimatedCounter end={15420} suffix="+" label="Profiles Roasted" icon={<Flame className="w-5 h-5" />} />
          <AnimatedCounter end={89200} suffix="+" label="Problems Analyzed" icon={<BarChart3 className="w-5 h-5" />} />
          <AnimatedCounter end={4800} suffix="+" label="Active Users" icon={<Users className="w-5 h-5" />} />
          <AnimatedCounter end={98} suffix="%" label="Accuracy Rate" icon={<Target className="w-5 h-5" />} />
        </div>
      </AnimatedSection>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <AnimatedSection>
          <SectionHeading
            badge="Core Modules"
            title={<>Everything you need to <span className="gradient-text">level up</span></>}
            subtitle="Five powerful modules designed by competitive programmers, for competitive programmers."
          />
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <AnimatedSection key={feature.title} delay={i * 0.1}>
              <GlowCard glowColor={feature.glowColor} className="h-full">
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {feature.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs text-zinc-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </GlowCard>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ═══════════════════ GAMIFICATION ═══════════════════ */}
      <section id="gamification" className="relative z-10 py-24">
        {/* Decorative separator */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-purple-500/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <SectionHeading
              badge="Gamification"
              title={<>Make grinding <span className="gradient-text">addictive</span></>}
              subtitle="XP systems, seasonal rankings, 1v1 duels, and skill trees that keep you coming back."
            />
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {GAMIFICATION.map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 0.1}>
                <div className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-purple-500/20 transition-all duration-500">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center">
                      {item.icon}
                    </div>
                    <h3 className="font-bold text-white">{item.title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Skill Tree Preview */}
          <AnimatedSection delay={0.3} className="mt-16">
            <div className="relative p-8 rounded-2xl glass-card overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-blue-600/5" />
              <div className="relative flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-4">
                  <h3 className="text-2xl font-bold text-white">Skill Tree Visualization</h3>
                  <p className="text-zinc-400">Track your progression from Arrays → Sliding Window → Advanced Two Pointer. See exactly where your skills rust and where you excel.</p>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      Mastered
                    </div>
                    <div className="flex items-center gap-2 text-yellow-400 text-sm">
                      <div className="w-2 h-2 rounded-full bg-yellow-400" />
                      In Progress
                    </div>
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      Rusting
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex justify-center">
                  {/* Skill tree visual */}
                  <div className="relative w-64 h-48">
                    {[
                      { x: "50%", y: "10%", label: "DP", color: "bg-green-500", size: "w-12 h-12" },
                      { x: "20%", y: "45%", label: "Trees", color: "bg-yellow-500", size: "w-10 h-10" },
                      { x: "80%", y: "45%", label: "Graphs", color: "bg-red-500", size: "w-10 h-10" },
                      { x: "10%", y: "80%", label: "Arrays", color: "bg-green-500", size: "w-9 h-9" },
                      { x: "50%", y: "80%", label: "Strings", color: "bg-green-500", size: "w-9 h-9" },
                      { x: "90%", y: "80%", label: "Math", color: "bg-yellow-500", size: "w-9 h-9" },
                    ].map((node) => (
                      <motion.div
                        key={node.label}
                        className={`absolute ${node.size} ${node.color} rounded-full flex items-center justify-center text-[10px] font-bold text-black shadow-lg`}
                        style={{ left: node.x, top: node.y, transform: "translate(-50%, -50%)" }}
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
                      >
                        {node.label}
                      </motion.div>
                    ))}
                    {/* Connection lines */}
                    <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                      <line x1="50%" y1="10%" x2="20%" y2="45%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                      <line x1="50%" y1="10%" x2="80%" y2="45%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                      <line x1="20%" y1="45%" x2="10%" y2="80%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                      <line x1="20%" y1="45%" x2="50%" y2="80%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                      <line x1="80%" y1="45%" x2="50%" y2="80%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                      <line x1="80%" y1="45%" x2="90%" y2="80%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════════════ COMMUNITY ═══════════════════ */}
      <section id="community" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <SectionHeading
              badge="Community & Social"
              title={<>Don&apos;t grind <span className="gradient-text">alone</span></>}
              subtitle="Study groups, college leaderboards, friend activity feeds, and notes that help everyone."
            />
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Users className="w-6 h-6 text-blue-400" />,
                title: "Study Groups",
                description: "Create groups of 5-10 people. Shared leaderboards, 24h challenges, and group streaks — if anyone breaks it, everyone gets roasted.",
                gradient: "from-blue-500/10 to-cyan-500/10",
              },
              {
                icon: <TrendingUp className="w-6 h-6 text-green-400" />,
                title: "College Leaderboards",
                description: "Filter by institution. \"Most improved this month\" badges. Public profiles with real-time activity feeds.",
                gradient: "from-green-500/10 to-emerald-500/10",
              },
              {
                icon: <BookOpen className="w-6 h-6 text-amber-400" />,
                title: "Community Notes",
                description: "Per-problem \"aha moment\" notes, approach hints voted by the community. See anonymized struggle stats.",
                gradient: "from-amber-500/10 to-orange-500/10",
              },
            ].map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 0.12}>
                <div className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 h-full">
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center">
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ ROAST TIERS ═══════════════════ */}
      <section id="tiers" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <SectionHeading
              badge="Roast Tiers"
              title={<>Where do <span className="gradient-text">you</span> rank?</>}
              subtitle="Based on your submission patterns, acceptance rates, and grinding behavior."
            />
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {ROAST_TIERS.map((tier, i) => (
              <AnimatedSection key={tier.tier} delay={i * 0.08}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="relative p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center space-y-3 cursor-default group"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className={`${tier.textColor}`}>{getTierIcon(tier.iconName, "w-10 h-10")}</div>
                  <h4 className={`text-sm font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                    {tier.tier}
                  </h4>
                  <p className="text-[11px] text-zinc-500 leading-snug">{tier.description}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ INTELLIGENCE PREVIEW ═══════════════════ */}
      <AnimatedSection className="relative z-10 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative p-10 md:p-16 rounded-3xl glass-card overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/5 to-pink-600/10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-purple-500/50 to-transparent" />

            <div className="relative space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Brain className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Intelligence Layer — <span className="gradient-text">Coming Soon</span>
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                ML-powered problem recommender. Interview timeline → auto-generated study plans.
                Cold-start assessment quiz. Company-specific prep paths.
                Pattern recognition to detect why you fail — TLE, WA, or just giving up.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-4">
                {["Collaborative Filtering", "Study Planner", "Cold Start Quiz", "Company Paths", "Pattern Detection"].map((tag) => (
                  <span key={tag} className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ═══════════════════ CTA FOOTER ═══════════════════ */}
      <AnimatedSection className="relative z-10 py-32">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <motion.h2
            className="text-4xl md:text-6xl font-black text-white"
            animate={{ scale: [1, 1.01, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            Ready to get <span className="gradient-text">roasted</span>?
          </motion.h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Join thousands of competitive programmers who are tracking, improving, and roasting their way to FAANG.
          </p>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0 rounded-full px-10 py-6 text-lg font-bold shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <Rocket className="w-5 h-5 mr-2" />
              Start Free — Get Roasted Now
            </Button>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="relative z-10 border-t border-white/[0.06] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm text-zinc-400">
                Leet<span className="text-white font-semibold">ify</span> — Built by competitive programmers, for competitive programmers.
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs text-zinc-600">
              <span>© 2026 Leetify</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
