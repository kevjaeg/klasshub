"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface DemoButtonProps {
  childId: string;
}

export function DemoButton({ childId }: DemoButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDemo() {
    setLoading(true);

    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Demo-Daten konnten nicht geladen werden");
        setLoading(false);
        return;
      }

      toast.success(
        `Demo geladen! ${data.lessonsCount} Stunden und ${data.substitutionsCount} Vertretungen.`
      );
      router.refresh();
    } catch {
      toast.error("Verbindungsfehler.");
    }

    setLoading(false);
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleDemo}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      Demo-Daten laden
    </Button>
  );
}
