import { type ReactNode } from "react";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
}

export function GlowCard({ children, className = "" }: GlowCardProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Animated glow */}
      <div
        className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-primary/20 blur-md"
        style={{ animation: "glow-pulse 3s ease-in-out infinite" }}
      />
      {/* Card content */}
      <div className="relative rounded-2xl border border-primary/20 bg-white p-8 shadow-lg">
        {children}
      </div>
    </div>
  );
}
