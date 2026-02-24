import { type ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
}

export function GradientText({ children, className = "" }: GradientTextProps) {
  return (
    <span
      className={`bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  );
}
