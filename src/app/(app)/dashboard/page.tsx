import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, AlertTriangle, ChevronRight, Sparkles, Mail, ClipboardList, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { DemoButton } from "@/components/demo-button";
import type { Child, Lesson, Substitution, Message, Homework } from "@/lib/types";
import { todayBerlin, dateBerlin, dowBerlin } from "@/lib/date-utils";

const DAY_NAMES = ["", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

function formatTime(time: string): string {
  return time.slice(0, 5);
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" });
}

function LessonRow({
  lesson,
  substitution,
}: {
  lesson: Lesson;
  substitution?: Substitution;
}) {
  const isCancelled = substitution?.type === "cancelled";
  const isSubstituted = substitution?.type === "substituted";
  const isRoomChange = substitution?.type === "room_change";

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
        isCancelled
          ? "border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20"
          : isSubstituted
          ? "border-orange-200 bg-orange-50 dark:border-orange-900/30 dark:bg-orange-950/20"
          : isRoomChange
          ? "border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-950/20"
          : "hover:bg-muted/50"
      }`}
    >
      <div className="w-12 text-center">
        <div className="text-xs font-medium text-muted-foreground">
          {formatTime(lesson.start_time)}
        </div>
        <div className="text-[10px] text-muted-foreground/70">
          {formatTime(lesson.end_time)}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`font-medium text-sm ${
              isCancelled ? "text-red-600 line-through dark:text-red-400" : ""
            }`}
          >
            {isSubstituted && substitution.new_subject
              ? substitution.new_subject
              : lesson.subject}
          </span>
          {isCancelled && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              Entfällt
            </Badge>
          )}
          {isSubstituted && (
            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-[10px] px-1.5 py-0">
              Vertretung
            </Badge>
          )}
          {isRoomChange && (
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] px-1.5 py-0">
              Raumänderung
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {isSubstituted
            ? `${substitution.new_teacher || lesson.teacher || ""}${substitution.new_room ? ` · ${substitution.new_room}` : lesson.room ? ` · ${lesson.room}` : ""}`
            : `${lesson.teacher || ""}${lesson.room ? ` · ${lesson.room}` : ""}`}
        </div>
        {substitution?.info_text && (
          <div className="mt-1 flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            <span className="truncate">{substitution.info_text}</span>
          </div>
        )}
      </div>
      <div className="text-xs text-muted-foreground shrink-0">{lesson.lesson_number}.</div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const todayDow = dowBerlin();
  const todayDate = todayBerlin();
  const tomorrowDate = dateBerlin(1);

  const { data: children } = await supabase
    .from("children")
    .select("*")
    .order("created_at");

  if (!children || children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="rounded-full bg-primary/10 p-6">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Willkommen bei SchoolHub!</h2>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Füge dein erstes Kind hinzu, um Stundenplan und Vertretungen zu sehen.
          </p>
        </div>
        <Link href="/children/add">
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Kind hinzufügen
          </Button>
        </Link>
      </div>
    );
  }

  const childIds = children.map((c: Child) => c.id);

  // Fetch lessons for today and tomorrow
  const tomorrowDow = dowBerlin(1);
  const daysToFetch = todayDow <= 5 ? [todayDow] : [];
  if (tomorrowDow <= 5) daysToFetch.push(tomorrowDow);

  const maxSubDate = dateBerlin(14); // Only next 2 weeks of substitutions

  const [lessonsResult, subsResult, messagesResult, homeworkResult] = await Promise.all([
    supabase
      .from("lessons")
      .select("*")
      .in("child_id", childIds)
      .in("day_of_week", daysToFetch.length > 0 ? daysToFetch : [0])
      .order("lesson_number"),
    supabase
      .from("substitutions")
      .select("*")
      .in("child_id", childIds)
      .gte("date", todayDate)
      .lte("date", maxSubDate)
      .order("date")
      .order("lesson_number"),
    supabase
      .from("messages")
      .select("*")
      .in("child_id", childIds)
      .order("date", { ascending: false })
      .limit(10),
    supabase
      .from("homework")
      .select("*")
      .in("child_id", childIds)
      .eq("completed", false)
      .gte("due_date", dateBerlin(-7))
      .order("due_date")
      .limit(20),
  ]);

  const lessons = (lessonsResult.data || []) as Lesson[];
  const allSubstitutions = (subsResult.data || []) as Substitution[];
  const allMessages = (messagesResult.data || []) as Message[];
  const allHomework = (homeworkResult.data || []) as Homework[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          {todayDow <= 5 ? DAY_NAMES[todayDow] : "Wochenende"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("de-DE", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Per child sections */}
      {(children as Child[]).map((child) => {
        const childLessonsToday = lessons
          .filter((l) => l.child_id === child.id && l.day_of_week === todayDow)
          .sort((a, b) => a.lesson_number - b.lesson_number);

        const childLessonsTomorrow = lessons
          .filter((l) => l.child_id === child.id && l.day_of_week === tomorrowDow)
          .sort((a, b) => a.lesson_number - b.lesson_number);

        const todaySubs = allSubstitutions.filter(
          (s) => s.child_id === child.id && s.date === todayDate
        );

        const tomorrowSubs = allSubstitutions.filter(
          (s) => s.child_id === child.id && s.date === tomorrowDate
        );

        // Future substitutions (day after tomorrow and beyond)
        const futureSubs = allSubstitutions.filter(
          (s) => s.child_id === child.id && s.date > tomorrowDate
        );

        const childMessages = allMessages
          .filter((m) => m.child_id === child.id)
          .slice(0, 3);

        const childHomework = allHomework
          .filter((h) => h.child_id === child.id);

        const todayCancelled = todaySubs.filter((s) => s.type === "cancelled").length;
        const tomorrowCancelled = tomorrowSubs.filter((s) => s.type === "cancelled").length;

        const notSynced = !child.last_synced_at;

        return (
          <div key={child.id} className="space-y-3">
            {/* Child header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  {child.name[0].toUpperCase()}
                </div>
                <div>
                  <div>
                    <span className="font-semibold text-sm">{child.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {child.class_name || child.school_name}
                    </span>
                  </div>
                  {child.last_synced_at && (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Aktualisiert {formatDistanceToNow(new Date(child.last_synced_at), { addSuffix: true, locale: de })}
                    </div>
                  )}
                </div>
              </div>
              <Link href={`/children/${child.id}`}>
                <Button variant="ghost" size="sm" className="text-xs h-7">
                  Sync
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>

            {/* Not synced state */}
            {notSynced ? (
              <Card>
                <CardContent className="py-8 text-center flex flex-col items-center gap-3">
                  <div className="rounded-full bg-muted p-4">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Noch nicht synchronisiert</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Verbinde die Schulplattform oder lade Demo-Daten zum Ausprobieren.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/children/${child.id}`}>
                      <Button size="sm" variant="outline">
                        Einrichten
                      </Button>
                    </Link>
                    <DemoButton childId={child.id} />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Today */}
                <Card>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Heute
                      </CardTitle>
                      {todayCancelled > 0 && (
                        <Badge variant="destructive" className="text-[10px]">
                          {todayCancelled} {todayCancelled === 1 ? "Ausfall" : "Ausfälle"}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    {todayDow > 5 ? (
                      <p className="py-3 text-center text-sm text-muted-foreground">
                        Wochenende – kein Unterricht
                      </p>
                    ) : childLessonsToday.length === 0 ? (
                      <p className="py-3 text-center text-sm text-muted-foreground">
                        Keine Stunden für heute
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {childLessonsToday.map((lesson) => (
                          <LessonRow
                            key={lesson.id}
                            lesson={lesson}
                            substitution={todaySubs.find(
                              (s) => s.lesson_number === lesson.lesson_number
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tomorrow preview */}
                {tomorrowDow <= 5 && childLessonsTomorrow.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Morgen, {DAY_NAMES[tomorrowDow]}
                        </CardTitle>
                        {tomorrowCancelled > 0 && (
                          <Badge variant="destructive" className="text-[10px]">
                            {tomorrowCancelled} {tomorrowCancelled === 1 ? "Ausfall" : "Ausfälle"}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      {tomorrowSubs.length > 0 ? (
                        <div className="space-y-1.5">
                          {childLessonsTomorrow
                            .filter((l) =>
                              tomorrowSubs.some(
                                (s) => s.lesson_number === l.lesson_number
                              )
                            )
                            .map((lesson) => (
                              <LessonRow
                                key={lesson.id}
                                lesson={lesson}
                                substitution={tomorrowSubs.find(
                                  (s) => s.lesson_number === lesson.lesson_number
                                )}
                              />
                            ))}
                        </div>
                      ) : (
                        <p className="py-2 text-center text-sm text-muted-foreground">
                          Keine Änderungen – regulärer Unterricht
                        </p>
                      )}
                      <div className="mt-2 text-center">
                        <span className="text-xs text-muted-foreground">
                          {childLessonsTomorrow.length} Stunden · {formatTime(childLessonsTomorrow[0].start_time)} – {formatTime(childLessonsTomorrow[childLessonsTomorrow.length - 1].end_time)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Homework */}
                {childHomework.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                          <ClipboardList className="h-3.5 w-3.5" />
                          Hausaufgaben
                        </CardTitle>
                        <Link href="/homework">
                          <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                            Alle
                            <ChevronRight className="ml-0.5 h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="space-y-1.5">
                        {childHomework.map((hw) => {
                          const isOverdue = hw.due_date < todayDate;
                          const isDueToday = hw.due_date === todayDate;
                          return (
                            <div
                              key={hw.id}
                              className={`flex items-center gap-3 rounded-lg border p-2.5 ${
                                isOverdue
                                  ? "border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20"
                                  : isDueToday
                                  ? "border-orange-200 bg-orange-50 dark:border-orange-900/30 dark:bg-orange-950/20"
                                  : ""
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium">{hw.subject}</span>
                                  {isOverdue && (
                                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 flex items-center gap-0.5">
                                      <AlertCircle className="h-2.5 w-2.5" />
                                      Überfällig
                                    </Badge>
                                  )}
                                  {isDueToday && (
                                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-[10px] px-1.5 py-0">
                                      Heute fällig
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                  {hw.description}
                                </p>
                              </div>
                              <div className="text-[10px] text-muted-foreground shrink-0">
                                {new Date(hw.due_date + "T00:00:00").toLocaleDateString("de-DE", { day: "numeric", month: "short" })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Messages */}
                {childMessages.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" />
                          Nachrichten
                        </CardTitle>
                        <Link href="/messages">
                          <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                            Alle
                            <ChevronRight className="ml-0.5 h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="space-y-1.5">
                        {childMessages.map((msg) => (
                          <Link key={msg.id} href="/messages" className="block">
                            <div
                              className={`rounded-lg border p-2.5 transition-colors hover:bg-muted/50 ${
                                !msg.read ? "border-primary/30 bg-primary/5" : ""
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`text-sm truncate ${!msg.read ? "font-semibold" : "font-medium"}`}>
                                  {msg.title}
                                </span>
                                {!msg.read && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                {msg.sender && <span>{msg.sender}</span>}
                                {msg.sender && <span>·</span>}
                                <span>
                                  {new Date(msg.date).toLocaleDateString("de-DE", { day: "numeric", month: "short" })}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Upcoming changes */}
                {futureSubs.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Kommende Änderungen
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="space-y-2">
                        {futureSubs.map((sub) => (
                          <div
                            key={sub.id}
                            className={`flex items-center gap-3 rounded-lg border p-2.5 text-sm ${
                              sub.type === "cancelled"
                                ? "border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20"
                                : "border-orange-200 bg-orange-50 dark:border-orange-900/30 dark:bg-orange-950/20"
                            }`}
                          >
                            <div className="text-xs font-medium text-muted-foreground w-16 shrink-0">
                              {formatDateShort(sub.date)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs">
                                {sub.lesson_number}. Std: {sub.original_subject || "–"}
                              </span>
                              {sub.type === "cancelled" && (
                                <Badge variant="destructive" className="ml-2 text-[10px] px-1.5 py-0">
                                  Entfällt
                                </Badge>
                              )}
                              {sub.type === "substituted" && (
                                <Badge className="ml-2 bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0">
                                  Vertretung
                                </Badge>
                              )}
                              {sub.type === "room_change" && (
                                <Badge className="ml-2 bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0">
                                  Raum
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
