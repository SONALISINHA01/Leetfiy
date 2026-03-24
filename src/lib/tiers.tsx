export interface RoastTier {
    tier: string;
    iconName: string;
    color: string;
    glowColor: string;
    borderColor: string;
    textColor: string;
    description: string;
    minScore: number;
}

/* SVG Icon Components */
const SkullIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="12" r="1" fill="currentColor" />
        <circle cx="15" cy="12" r="1" fill="currentColor" />
        <path d="M8 18l1-2h6l1 2" />
        <path d="M12 2C6.48 2 2 6.48 2 12c0 3.31 1.61 6.25 4.09 8.07A2 2 0 0 0 8.09 22h7.82a2 2 0 0 0 2-1.93C20.39 18.25 22 15.31 22 12c0-5.52-4.48-10-10-10z" />
    </svg>
);

const GoblinIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L4 7v4c0 5.25 3.4 10.16 8 11.27C16.6 21.16 20 16.25 20 11V7l-8-5z" />
        <circle cx="9" cy="11" r="1.5" fill="currentColor" />
        <circle cx="15" cy="11" r="1.5" fill="currentColor" />
        <path d="M9 16c1.5 1.5 4.5 1.5 6 0" />
    </svg>
);

const BookIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <path d="M8 7h8M8 11h6" />
    </svg>
);

const SmirkIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
        <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
    </svg>
);

const SwordIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
        <path d="M13 19l6-6" />
        <path d="M16 16l4 4" />
        <path d="M19 21l2-2" />
        <path d="M14.5 6.5L18 3h3v3l-3.5 3.5" />
    </svg>
);

const BrainIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a5 5 0 0 1 5 5c0 .88-.23 1.7-.63 2.42A5 5 0 0 1 19 14a5 5 0 0 1-3.6 4.8A3 3 0 0 1 12 22a3 3 0 0 1-3.4-3.2A5 5 0 0 1 5 14a5 5 0 0 1 2.63-4.58A5.007 5.007 0 0 1 7 7a5 5 0 0 1 5-5z" />
        <path d="M12 2v20" />
        <path d="M7 7c2 1 3 3 3 5" />
        <path d="M17 7c-2 1-3 3-3 5" />
        <path d="M8.5 14c1.5 1 2.5 2.5 3.5 4" />
        <path d="M15.5 14c-1.5 1-2.5 2.5-3.5 4" />
    </svg>
);

export function getTierIcon(name: string, className: string = "") {
    switch (name) {
        case "skull": return <SkullIcon className={className} />;
        case "goblin": return <GoblinIcon className={className} />;
        case "book": return <BookIcon className={className} />;
        case "smirk": return <SmirkIcon className={className} />;
        case "sword": return <SwordIcon className={className} />;
        case "brain": return <BrainIcon className={className} />;
        default: return <SkullIcon className={className} />;
    }
}

const TIERS: RoastTier[] = [
    {
        tier: "Copium Coder",
        iconName: "skull",
        color: "from-zinc-500 to-zinc-400",
        glowColor: "rgba(161, 161, 170, 0.2)",
        borderColor: "border-zinc-500/30",
        textColor: "text-zinc-400",
        description: "Submits Easy problems and celebrates",
        minScore: 0,
    },
    {
        tier: "Grind Goblin",
        iconName: "goblin",
        color: "from-green-500 to-emerald-400",
        glowColor: "rgba(34, 197, 94, 0.2)",
        borderColor: "border-green-500/30",
        textColor: "text-green-400",
        description: "300 problems but still fails mediums",
        minScore: 25,
    },
    {
        tier: "NeetCode Disciple",
        iconName: "book",
        color: "from-blue-500 to-cyan-400",
        glowColor: "rgba(59, 130, 246, 0.2)",
        borderColor: "border-blue-500/30",
        textColor: "text-blue-400",
        description: "Watches solutions before attempting",
        minScore: 40,
    },
    {
        tier: "LC Enjoyer",
        iconName: "smirk",
        color: "from-purple-500 to-violet-400",
        glowColor: "rgba(168, 85, 247, 0.2)",
        borderColor: "border-purple-500/30",
        textColor: "text-purple-400",
        description: "Does daily challenge, forgets by Friday",
        minScore: 55,
    },
    {
        tier: "Contest Warrior",
        iconName: "sword",
        color: "from-orange-500 to-amber-400",
        glowColor: "rgba(249, 115, 22, 0.2)",
        borderColor: "border-orange-500/30",
        textColor: "text-orange-400",
        description: "Top 5% but still gets TLE on contests",
        minScore: 70,
    },
    {
        tier: "Actual Human",
        iconName: "brain",
        color: "from-yellow-400 to-orange-300",
        glowColor: "rgba(250, 204, 21, 0.25)",
        borderColor: "border-yellow-400/40",
        textColor: "text-yellow-400",
        description: "Guardian rank. Touches grass occasionally.",
        minScore: 85,
    },
];

export function getRoastTier(score: number): RoastTier {
    let result = TIERS[0];
    for (const tier of TIERS) {
        if (score >= tier.minScore) result = tier;
    }
    return result;
}

export function getAllTiers(): RoastTier[] {
    return TIERS;
}
