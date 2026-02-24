"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import Link from "next/link";
import { GraduationCap, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  const { scrollY } = useScroll();
  const shadow = useTransform(
    scrollY,
    [0, 100],
    ["0 0 0 0 rgba(0,0,0,0)", "0 1px 8px 0 rgba(0,0,0,0.06)"]
  );
  const borderOpacity = useTransform(scrollY, [0, 100], [0, 1]);

  return (
    <motion.header
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl"
      style={{ boxShadow: shadow }}
    >
      <motion.div
        className="absolute inset-x-0 bottom-0 h-px bg-border"
        style={{ opacity: borderOpacity }}
      />
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">KlassHub</span>
        </Link>
        <div className="flex items-center gap-2">
          <a href="https://github.com/kevjaeg/klasshub" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" aria-label="GitHub">
              <Github className="h-4 w-4" />
            </Button>
          </a>
          <Link href="/login">
            <Button variant="ghost" className="rounded-full px-4">Anmelden</Button>
          </Link>
          <Link href="/register">
            <Button className="rounded-full px-5">Registrieren</Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
