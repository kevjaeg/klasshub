"use client";

import { useState, useTransition, useOptimistic } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { HomeworkCalendarButton } from "@/components/homework-calendar-button";
import type { Homework } from "@/lib/types";

interface HomeworkListProps {
  homework: Homework[];
  childMap: Record<string, string>;
}

export function HomeworkList({ homework, childMap }: HomeworkListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [optimisticHomework, setOptimistic] = useOptimistic(
    homework,
    (state, toggledId: string) =>
      state.map((hw) =>
        hw.id === toggledId ? { ...hw, completed: !hw.completed } : hw
      )
  );

  const today = new Date();
  const todayDate = today.toISOString().split("T")[0];
  const multipleChildren = Object.keys(childMap).length > 1;

  // Calculate end of this week (Sunday)
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
  const endOfWeekDate = endOfWeek.toISOString().split("T")[0];

  const completedHomework = optimisticHomework.filter((h) => h.completed);
  const openHomework = optimisticHomework.filter((h) => !h.completed);

  const overdueHomework = openHomework.filter((h) => h.due_date < todayDate);
  const todayHomework = openHomework.filter((h) => h.due_date === todayDate);
  const thisWeekHomework = openHomework.filter(
    (h) => h.due_date > todayDate && h.due_date <= endOfWeekDate
  );
  const laterHomework = openHomework.filter((h) => h.due_date > endOfWeekDate);

  const groups = [
    { key: "overdue", label: "Überfällig", items: overdueHomework, color: "text-red-600 dark:text-red-400" },
    { key: "today", label: "Heute", items: todayHomework, color: "text-orange-600 dark:text-orange-400" },
    { key: "week", label: "Diese Woche", items: thisWeekHomework, color: "text-yellow-600 dark:text-yellow-400" },
    { key: "later", label: "Später", items: laterHomework, color: "text-green-600 dark:text-green-400" },
  ];

  async function toggleCompleted(id: string, completed: boolean) {
    if (togglingId) return; // prevent double-clicks
    setTogglingId(id);

    startTransition(async () => {
      setOptimistic(id);

      try {
        const res = await fetch("/api/homework/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ homeworkId: id, completed }),
        });

        if (!res.ok) {
          toast.error("Fehler beim Speichern");
        } else {
          toast.success(completed ? "Hausaufgabe erledigt" : "Als offen markiert");
        }
      } catch {
        toast.error("Verbindungsfehler. Bitte versuche es erneut.");
      }

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
              disabled={!!togglingId}
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                hw.completed
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/30 hover:border-primary"
              } ${isToggling ? "opacity-50" : ""}`}
            >
              {isToggling ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : hw.completed ? (
                <Check className="h-3 w-3" />
              ) : null}
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
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] text-muted-foreground">
                  Fällig:{" "}
                  {new Date(hw.due_date + "T00:00:00").toLocaleDateString(
                    "de-DE",
                    { weekday: "short", day: "numeric", month: "short" }
                  )}
                </span>
                {!hw.completed && (
                  <HomeworkCalendarButton
                    subject={hw.subject}
                    description={hw.description}
                    dueDate={hw.due_date}
                  />
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
      {groups.map(
        ({ key, label, items, color }) =>
          items.length > 0 && (
            <div key={key} className="space-y-2">
              <h2 className={`text-sm font-medium ${color}`}>
                {label} ({items.length})
              </h2>
              {items.map((hw) => (
                <HomeworkItem key={hw.id} hw={hw} />
              ))}
            </div>
          )
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
