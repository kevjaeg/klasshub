"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function StickyCTABar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      const scrollPercent =
        window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      setVisible(scrollPercent > 0.5);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 px-4 py-3 backdrop-blur transition-transform duration-300 sm:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <Link href="/register" className="block">
        <Button size="lg" className="w-full gap-2 text-base font-semibold">
          Jetzt ausprobieren
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
