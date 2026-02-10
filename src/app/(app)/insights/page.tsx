import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { Child, Homework, Substitution } from "@/lib/types";
import { WeeklyChart } from "./weekly-chart";

const DAY_NAMES_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const DAY_NAMES = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

function getWeekDates(): { start: string; end: string; dates: string[] } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }

  return {
    start: dates[0],
    end: dates[6],
    dates,
  };
}

function getLastNWeeksDates(n: number): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString().split("T")[0];
  const start = new Date(now);
  start.setDate(now.getDate() - n * 7);
  return { start: start.toISOString().split("T")[0], end };
}

export default async function InsightsPage() {
  const supabase = await createClient();

  const { data: children } = await supabase
    .from("children")
    .select("*")
    .order("created_at");

  if (!children || children.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Statistiken</h1>
        <p className="text-muted-foreground">Füge zuerst ein Kind hinzu, um Statistiken zu sehen.</p>
      </div>
    );
  }

  const childIds = children.map((c: Child) => c.id);
  const week = getWeekDates();
  const last4Weeks = getLastNWeeksDates(4);

  // Fetch all homework (completed and open) for the current week + last 4 weeks
  const [weekHomeworkResult, allHomeworkResult, weekSubsResult, allSubsResult] = await Promise.all([
    supabase
      .from("homework")
      .select("*")
      .in("child_id", childIds)
      .gte("due_date", week.start)
      .lte("due_date", week.end),
    supabase
      .from("homework")
      .select("*")
      .in("child_id", childIds)
      .gte("due_date", last4Weeks.start)
      .lte("due_date", last4Weeks.end),
    supabase
      .from("substitutions")
      .select("*")
      .in("child_id", childIds)
      .gte("date", week.start)
      .lte("date", week.end),
    supabase
      .from("substitutions")
      .select("*")
      .in("child_id", childIds)
      .gte("date", last4Weeks.start)
      .lte("date", last4Weeks.end),
  ]);

  const weekHomework = (weekHomeworkResult.data || []) as Homework[];
  const allHomework = (allHomeworkResult.data || []) as Homework[];
  const weekSubs = (weekSubsResult.data || []) as Substitution[];
  const allSubs = (allSubsResult.data || []) as Substitution[];

  // Build weekly chart data (Mon–Fri)
  const chartData = week.dates.slice(0, 5).map((date, i) => {
    const dayHw = weekHomework.filter((h) => h.due_date === date);
    const daySubs = weekSubs.filter((s) => s.date === date);
    return {
      day: DAY_NAMES_SHORT[((i + 1) % 7)], // Mon=1 → index in DAY_NAMES_SHORT
      label: DAY_NAMES[((i + 1) % 7)],
      date,
      total: dayHw.length,
      completed: dayHw.filter((h) => h.completed).length,
      cancelled: daySubs.filter((s) => s.type === "cancelled").length,
      substituted: daySubs.filter((s) => s.type === "substituted").length,
    };
  });

  // Compute insights
  const totalThisWeek = weekHomework.length;
  const completedThisWeek = weekHomework.filter((h) => h.completed).length;
  const completionRate = totalThisWeek > 0 ? Math.round((completedThisWeek / totalThisWeek) * 100) : 0;

  const totalAll = allHomework.length;
  const completedAll = allHomework.filter((h) => h.completed).length;
  const overallRate = totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0;

  const overdueCount = allHomework.filter(
    (h) => !h.completed && h.due_date < new Date().toISOString().split("T")[0]
  ).length;

  // Best/worst day analysis (by completion rate, minimum 1 homework)
  const dayStats = chartData
    .filter((d) => d.total > 0)
    .map((d) => ({
      ...d,
      rate: Math.round((d.completed / d.total) * 100),
    }));

  const bestDay = dayStats.length > 0
    ? dayStats.reduce((a, b) => (a.rate > b.rate ? a : b))
    : null;
  const worstDay = dayStats.length > 0
    ? dayStats.reduce((a, b) => (a.rate < b.rate ? a : b))
    : null;

  // Cancellation stats
  const cancelledThisWeek = weekSubs.filter((s) => s.type === "cancelled").length;
  const substitutedThisWeek = weekSubs.filter((s) => s.type === "substituted").length;
  const cancelledTotal = allSubs.filter((s) => s.type === "cancelled").length;

  // Subject distribution (top subjects with most homework)
  const subjectCounts: Record<string, { total: number; completed: number }> = {};
  for (const hw of allHomework) {
    if (!subjectCounts[hw.subject]) {
      subjectCounts[hw.subject] = { total: 0, completed: 0 };
    }
    subjectCounts[hw.subject].total++;
    if (hw.completed) subjectCounts[hw.subject].completed++;
  }
  const topSubjects = Object.entries(subjectCounts)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Statistiken</h1>
        <p className="text-sm text-muted-foreground">Deine Woche auf einen Blick</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Erledigt</span>
            </div>
            <div className="mt-1">
              <span className="text-2xl font-bold">{completionRate}%</span>
              <span className="text-xs text-muted-foreground ml-1">diese Woche</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {completedThisWeek} von {totalThisWeek} Aufgaben
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">4-Wochen-Schnitt</span>
            </div>
            <div className="mt-1">
              <span className="text-2xl font-bold">{overallRate}%</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {completedAll} von {totalAll} Aufgaben
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-xs text-muted-foreground">Überfällig</span>
            </div>
            <div className="mt-1">
              <span className={`text-2xl font-bold ${overdueCount > 0 ? "text-red-600" : ""}`}>
                {overdueCount}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              offene Aufgaben
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-xs text-muted-foreground">Ausfälle</span>
            </div>
            <div className="mt-1">
              <span className="text-2xl font-bold">{cancelledThisWeek}</span>
              <span className="text-xs text-muted-foreground ml-1">diese Woche</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              + {substitutedThisWeek} Vertretungen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly bar chart */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Deine Woche
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {totalThisWeek === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Keine Hausaufgaben diese Woche
            </p>
          ) : (
            <WeeklyChart data={chartData} />
          )}
        </CardContent>
      </Card>

      {/* Smart insights */}
      {dayStats.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Erkenntnisse
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            {bestDay && bestDay.rate > 0 && (
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                <p className="text-sm">
                  Du erledigst Aufgaben am besten <strong>{bestDay.label}s</strong>{" "}
                  <span className="text-muted-foreground">({bestDay.rate}% erledigt)</span>
                </p>
              </div>
            )}
            {worstDay && bestDay && worstDay.day !== bestDay.day && worstDay.rate < 100 && (
              <div className="flex items-start gap-2">
                <TrendingDown className="h-4 w-4 mt-0.5 text-orange-600 shrink-0" />
                <p className="text-sm">
                  <strong>{worstDay.label}</strong> ist dein schwächster Tag{" "}
                  <span className="text-muted-foreground">({worstDay.rate}% erledigt)</span>
                </p>
              </div>
            )}
            {cancelledTotal > 0 && (
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 text-red-600 shrink-0" />
                <p className="text-sm">
                  <strong>{cancelledTotal} Stunden</strong> sind in den letzten 4 Wochen ausgefallen
                </p>
              </div>
            )}
            {completionRate === 100 && totalThisWeek > 0 && (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                <p className="text-sm text-green-700 font-medium">
                  Perfekte Woche! Alle Aufgaben erledigt.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Subject breakdown */}
      {topSubjects.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aufgaben nach Fach (4 Wochen)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2.5">
              {topSubjects.map(([subject, stats]) => {
                const rate = Math.round((stats.completed / stats.total) * 100);
                return (
                  <div key={subject}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{subject}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {stats.completed}/{stats.total}
                        </span>
                        <Badge
                          variant={rate === 100 ? "default" : rate >= 50 ? "secondary" : "destructive"}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {rate}%
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          rate === 100
                            ? "bg-green-500"
                            : rate >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
