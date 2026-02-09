"use client";

import Link from "next/link";
import { trackEvent } from "@/components/analytics";

interface TrackedLinkProps {
  href: string;
  event: string;
  props?: Record<string, string>;
  children: React.ReactNode;
  className?: string;
}

export function TrackedLink({ href, event, props, children, className }: TrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackEvent(event, props)}
    >
      {children}
    </Link>
  );
}
