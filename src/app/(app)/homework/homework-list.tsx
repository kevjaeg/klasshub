"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check } from "lucide-react";
import type { Homework } from "@/lib/types";

interface HomeworkListProps {
  homework: Homework[];
  childMap: Record<string, string>;
}

export function HomeworkList({ homework, childMap }: HomeworkListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const todayDate = new Date().toISOString().split("T")[0];
  const multipleChildren = Object.keys(childMap).length > 1;

  const openHomework = homework.filter((h) => !h.completed);
  const completedHomework = homework.filter((h) => h.completed);

  async function toggleCompleted(id: string, completed: boolean) {
    setTogglingId(id);
    await fetch("/api/homework/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeworkId: id, completed }),
    });
    startTransition(() => {
      setTogglingId(null);
      router.refresh();
    });
  }

  function HomeworkItem({ hw }: { hw: Homework }) {
    const isOverdue = !hw.completed && hw.due_date < todayDate;
    const isDueToday = !hw.completed && hw.due_date === todayDate;
    const isToggling = togglingId === hw.id;

    return (
      <Card
        className={`transition-colors ${
          isOverdue
            ? "border-red-200 dark:border-red-900/30"
            : isDueToday
            ? "border-orange-200 dark:border-orange-900/30"
            : ""
        }`}
      >
        <CardContent className="px-4 py-3">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => toggleCompleted(hw.id, !hw.completed)}
              disabled={isPending}
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                hw.completed
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/30 hover:border-primary"
              } ${isToggling ? "opacity-50" : ""}`}
            >
              {hw.completed && <Check className="h-3 w-3" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-sm font-medium ${
                    hw.completed ? "text-muted-foreground line-through" : ""
                  }`}
                >
                  {hw.subject}
                </span>
                {isOverdue && (
                  <Badge
                    variant="destructive"
                    className="text-[10px] px-1.5 py-0 flex items-center gap-0.5"
                  >
                    <AlertCircle className="h-2.5 w-2.5" />
                    Überfällig
                  </Badge>
                )}
                {isDueToday && (
                  <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-[10px] px-1.5 py-0">
                    Heute fällig
                  </Badge>
                )}
                {multipleChildren && (
                  <span className="text-[10px] text-muted-foreground">
                    {childMap[hw.child_id]}
                  </span>
                )}
              </div>
              <p
                className={`text-xs mt-0.5 ${
                  hw.completed
                    ? "text-muted-foreground/60 line-through"
                    : "text-muted-foreground"
                }`}
              >
                {hw.description}
              </p>
              <div className="text-[10px] text-muted-foreground mt-1">
                Fällig:{" "}
                {new Date(hw.due_date + "T00:00:00").toLocaleDateString(
                  "de-DE",
                  { weekday: "short", day: "numeric", month: "short" }
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {openHomework.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            Offen ({openHomework.length})
          </h2>
          {openHomework.map((hw) => (
            <HomeworkItem key={hw.id} hw={hw} />
          ))}
        </div>
      )}

      {completedHomework.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            Erledigt ({completedHomework.length})
          </h2>
          {completedHomework.map((hw) => (
            <HomeworkItem key={hw.id} hw={hw} />
          ))}
        </div>
      )}
    </div>
  );
}
