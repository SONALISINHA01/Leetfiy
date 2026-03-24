"use client";

import { useRef, useState } from "react";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export default function GlowCard({
  children,
  className = "",
  glowColor = "rgba(139, 92, 246, 0.15)",
}: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${className}`}
      style={{
        background: isHovered
          ? `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 40%)`
          : "transparent",
      }}
    >
      <div className="absolute inset-0 rounded-2xl border border-white/[0.08] transition-colors duration-500"
        style={{
          borderColor: isHovered ? "rgba(139, 92, 246, 0.3)" : "rgba(255, 255, 255, 0.08)",
        }}
      />
      <div className="relative z-10 p-6 md:p-8 bg-zinc-950/80 m-[1px] rounded-2xl backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
}
