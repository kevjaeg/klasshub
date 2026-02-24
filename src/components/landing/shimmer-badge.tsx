import { type ReactNode } from "react";

interface ShimmerBadgeProps {
  children: ReactNode;
  className?: string;
}

export function ShimmerBadge({ children, className = "" }: ShimmerBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(110deg, transparent 33%, rgba(255,255,255,0.6) 50%, transparent 67%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 3s ease-in-out infinite",
      }}
    >
      {children}
    </span>
  );
}
