"use client";

import { motion } from "framer-motion";

import { RoastTier, getTierIcon, getRoastTier } from "@/lib/tiers";

interface RoastTierBadgeProps {
    score: number;
    size?: "sm" | "md" | "lg";
}

export function RoastTierBadge({ score, size = "md" }: RoastTierBadgeProps) {
    const tier = getRoastTier(score);

    const sizeClasses = {
        sm: "px-3 py-1.5 text-xs gap-1.5",
        md: "px-4 py-2 text-sm gap-2",
        lg: "px-6 py-3 text-base gap-3",
    };

    const iconSizes = {
        sm: "[&_svg]:w-4 [&_svg]:h-4",
        md: "[&_svg]:w-5 [&_svg]:h-5",
        lg: "[&_svg]:w-6 [&_svg]:h-6",
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ 
                delay: 0.2, 
                type: "spring", 
                bounce: 0.5,
                duration: 0.8 
            }}
            whileHover={{ 
                scale: 1.05,
                rotate: [0, -2, 2, 0],
                transition: { duration: 0.3 }
            }}
            className={`inline-flex items-center rounded-full bg-gradient-to-r ${tier.color} bg-opacity-10 border ${tier.borderColor} font-bold ${sizeClasses[size]}`}
            style={{ 
                boxShadow: `0 0 25px ${tier.glowColor}, inset 0 0 15px ${tier.glowColor}` 
            }}
        >
            <motion.span 
                className={tier.textColor}
                animate={{ 
                    scale: [1, 1.1, 1],
                }}
                transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                {getTierIcon(tier.iconName, iconSizes[size])}
            </motion.span>
            <motion.span 
                className="text-white"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
            >
                {tier.tier}
            </motion.span>
            <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: "spring", bounce: 0.6 }}
                className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full"
            >
                {score} pts
            </motion.span>
        </motion.div>
    );
}

interface RoastTierCardProps {
    tier: RoastTier;
    isActive?: boolean;
}

export function RoastTierCard({ tier, isActive = false }: RoastTierCardProps) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isActive ? 1 : 0.5, y: 0 }}
            whileHover={{ 
                scale: isActive ? 1.02 : 1,
                backgroundColor: isActive ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)"
            }}
            transition={{ duration: 0.3 }}
            className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                isActive
                    ? `${tier.borderColor} bg-white/[0.04] shadow-lg`
                    : "border-white/5 bg-white/[0.01]"
            }`}
            style={isActive ? { boxShadow: `0 0 30px ${tier.glowColor}` } : {}}
        >
            {/* Animated glow for active tier */}
            {isActive && (
                <motion.div 
                    className="absolute inset-0 rounded-xl"
                    style={{ 
                        background: `linear-gradient(135deg, ${tier.glowColor} 0%, transparent 100%)`,
                    }}
                    animate={{ 
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            )}
            
            <motion.div 
                className={`p-2.5 rounded-lg bg-gradient-to-br ${tier.color} bg-opacity-20 ${tier.textColor} relative z-10`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", bounce: 0.4 }}
            >
                {getTierIcon(tier.iconName, "w-6 h-6")}
            </motion.div>
            
            <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center gap-2">
                    <motion.span 
                        className={`font-bold ${tier.textColor}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        {tier.tier}
                    </motion.span>
                    {isActive && (
                        <motion.span 
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
                            className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-full text-white"
                        >
                            You
                        </motion.span>
                    )}
                </div>
                <motion.p 
                    className="text-xs text-zinc-500 mt-0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    transition={{ delay: 0.2 }}
                >
                    {tier.description}
                </motion.p>
            </div>
            
            <motion.span 
                className="text-xs text-zinc-600 font-mono shrink-0 relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.3 }}
            >
                {tier.minScore}+
            </motion.span>
        </motion.div>
    );
}
