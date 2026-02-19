"use client";

import { useState, useTransition, useOptimistic, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Check, Loader2, ArrowUpDown, StickyNote, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { HomeworkCalendarButton } from "@/components/homework-calendar-button";
import type { Homework } from "@/lib/types";
import { triggerConfetti } from "@/lib/confetti";

type SortMode = "due_date" | "subject" | "priority";

interface HomeworkListProps {
  homework: Homework[];
  childMap: Record<string, string>;
}

function getPriority(hw: Homework, todayDate: string, endOfWeekDate: string): number {
  if (hw.due_date < todayDate) return 0; // overdue = highest
  if (hw.due_date === todayDate) return 1;
  if (hw.due_date <= endOfWeekDate) return 2;
  return 3;
}

export function HomeworkList({ homework, childMap }: HomeworkListProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [optimisticHomework, setOptimistic] = useOptimistic(
    homework,
    (state, toggledId: string) =>
      state.map((hw) =>
        hw.id === toggledId ? { ...hw, completed: !hw.completed } : hw
      )
  );

  // Sort & filter state
  const [sortMode, setSortMode] = useState<SortMode>("due_date");
  const [childFilter, setChildFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);

  const today = new Date();
  const todayDate = today.toISOString().split("T")[0];
  const multipleChildren = Object.keys(childMap).length > 1;

  // Calculate end of this week (Sunday)
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
  const endOfWeekDate = endOfWeek.toISOString().split("T")[0];

  // Apply child filter
  const childFiltered =
    childFilter === "all"
      ? optimisticHomework
      : optimisticHomework.filter((h) => h.child_id === childFilter);

  // Apply subject filter
  const filtered =
    subjectFilter === null
      ? childFiltered
      : childFiltered.filter((h) => h.subject === subjectFilter);

  // Get unique subjects with counts (from child-filtered, non-completed only)
  const subjectCounts = childFiltered
    .filter((h) => !h.completed)
    .reduce<Record<string, number>>((acc, h) => {
      acc[h.subject] = (acc[h.subject] || 0) + 1;
      return acc;
    }, {});
  const subjects = Object.entries(subjectCounts).sort((a, b) =>
    a[0].localeCompare(b[0], "de")
  );

  // Sort function
  function sortHomework(items: Homework[]): Homework[] {
    return [...items].sort((a, b) => {
      switch (sortMode) {
        case "subject":
          return a.subject.localeCompare(b.subject, "de") || a.due_date.localeCompare(b.due_date);
        case "priority":
          return (
            getPriority(a, todayDate, endOfWeekDate) - getPriority(b, todayDate, endOfWeekDate) ||
            a.due_date.localeCompare(b.due_date)
          );
        case "due_date":
        default:
          return a.due_date.localeCompare(b.due_date);
      }
    });
  }

  const completedHomework = sortHomework(filtered.filter((h) => h.completed));
  const openHomework = sortHomework(filtered.filter((h) => !h.completed));

  // Group open homework by due date bucket (only for due_date/priority sort)
  const useGroups = sortMode !== "subject";
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
    if (togglingId) return;
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
          // Check if this was the last open homework being completed
          const remainingOpen = optimisticHomework.filter(
            (h) => !h.completed && h.id !== id
          ).length;
          if (completed && remainingOpen === 0) {
            triggerConfetti();
            toast.success("Alles erledigt! Goenn dir eine Pause.");
          } else {
            toast.success(completed ? "Hausaufgabe erledigt" : "Als offen markiert");
          }
        }
      } catch {
        // Register background sync so the SW replays when back online
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.ready;
          if ("sync" in reg) {
            await (reg as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync.register("sync-homework");
            toast.info("Offline – Änderung wird synchronisiert sobald du online bist.");
          } else {
            toast.error("Verbindungsfehler. Bitte versuche es erneut.");
          }
        } else {
          toast.error("Verbindungsfehler. Bitte versuche es erneut.");
        }
      }

      setTogglingId(null);
      router.refresh();
    });
  }

  function HomeworkItem({ hw }: { hw: Homework }) {
    const isOverdue = !hw.completed && hw.due_date < todayDate;
    const isDueToday = !hw.completed && hw.due_date === todayDate;
    const isToggling = togglingId === hw.id;
    const [showNotes, setShowNotes] = useState(!!hw.notes);
    const [notes, setNotes] = useState(hw.notes || "");
    const [savingNotes, setSavingNotes] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

    async function saveNotes(value: string) {
      setSavingNotes(true);
      try {
        const res = await fetch("/api/homework/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ homeworkId: hw.id, notes: value }),
        });
        if (!res.ok) {
          toast.error("Notiz konnte nicht gespeichert werden");
        }
      } catch {
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.ready;
          if ("sync" in reg) {
            await (reg as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync.register("sync-homework");
            toast.info("Offline – Notiz wird synchronisiert sobald du online bist.");
          } else {
            toast.error("Verbindungsfehler");
          }
        } else {
          toast.error("Verbindungsfehler");
        }
      }
      setSavingNotes(false);
    }

    function handleNotesChange(value: string) {
      setNotes(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => saveNotes(value), 800);
    }

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
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all ${
                hw.completed
                  ? "border-primary bg-primary text-primary-foreground scale-100 animate-[bounce-check_0.3s_ease-in-out]"
                  : "border-muted-foreground/30 hover:border-primary hover:scale-110 active:scale-95"
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
                  <>
                    <HomeworkCalendarButton
                      subject={hw.subject}
                      description={hw.description}
                      dueDate={hw.due_date}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNotes(!showNotes)}
                      className={`shrink-0 rounded p-1 transition-colors ${
                        showNotes || hw.notes
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-primary hover:bg-muted"
                      }`}
                      title="Notiz hinzufügen"
                    >
                      <StickyNote className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
              {showNotes && !hw.completed && (
                <div className="mt-2 relative">
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    placeholder="Notizen (z.B. 'Mit Tim zusammen machen')"
                    rows={2}
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                  />
                  {savingNotes && (
                    <Loader2 className="absolute top-2 right-2 h-3 w-3 animate-spin text-muted-foreground" />
                  )}
                </div>
              )}
              {hw.completed && hw.notes && (
                <p className="text-[10px] text-muted-foreground/60 italic mt-1">
                  {hw.notes}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Child filter tabs */}
      {multipleChildren && (
        <Tabs value={childFilter} onValueChange={setChildFilter}>
          <TabsList className="w-full">
            <TabsTrigger value="all">Alle</TabsTrigger>
            {Object.entries(childMap).map(([id, name]) => (
              <TabsTrigger key={id} value={id}>
                {name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Subject filter + sort controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Sort dropdown */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="h-7 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="due_date">Nach Fälligkeit</option>
            <option value="subject">Nach Fach</option>
            <option value="priority">Nach Priorität</option>
          </select>
        </div>

        {/* Subject filter badges */}
        {subjects.length > 1 && (
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] text-muted-foreground mr-0.5">Fach:</span>
            {subjectFilter !== null && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 cursor-pointer hover:bg-muted"
                onClick={() => setSubjectFilter(null)}
              >
                Alle
              </Badge>
            )}
            {subjects.map(([subject, count]) => (
              <Badge
                key={subject}
                variant={subjectFilter === subject ? "default" : "outline"}
                className="text-[10px] px-1.5 py-0 cursor-pointer hover:bg-muted"
                onClick={() =>
                  setSubjectFilter(subjectFilter === subject ? null : subject)
                }
              >
                {subject} ({count})
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Grouped or flat list */}
      {useGroups
        ? groups.map(
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
          )
        : openHomework.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-foreground">
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

      {openHomework.length === 0 && completedHomework.length > 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <PartyPopper className="h-8 w-8 text-primary" />
          <p className="text-sm font-medium">Alles erledigt!</p>
          <p className="text-xs text-muted-foreground">Goenn dir eine Pause.</p>
        </div>
      )}

      {openHomework.length === 0 && completedHomework.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          Keine Hausaufgaben gefunden.
        </p>
      )}
    </div>
  );
}
