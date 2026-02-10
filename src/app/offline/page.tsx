"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw, Clock, ClipboardList, AlertTriangle, Mail } from "lucide-react";

interface CachedData {
  lessons: Array<{
    subject: string;
    teacher: string | null;
    room: string | null;
    day_of_week: number;
    lesson_number: number;
    start_time: string;
    end_time: string;
  }>;
  substitutions: Array<{
    date: string;
    lesson_number: number;
    type: string;
    new_subject: string | null;
    info_text: string | null;
  }>;
  homework: Array<{
    subject: string;
    description: string;
    due_date: string;
    completed: boolean;
  }>;
  messages: Array<{
    title: string;
    sender: string | null;
    date: string;
    read: boolean;
  }>;
  cachedAt: string | null;
}

const DAY_NAMES = ["", "Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function formatTime(time: string): string {
  return time.slice(0, 5);
}

async function loadCachedData(): Promise<CachedData> {
  const empty: CachedData = { lessons: [], substitutions: [], homework: [], messages: [], cachedAt: null };

  try {
    const cache = await caches.open("supabase-api");
    const keys = await cache.keys();

    let lessons: CachedData["lessons"] = [];
    let substitutions: CachedData["substitutions"] = [];
    let homework: CachedData["homework"] = [];
    let messages: CachedData["messages"] = [];
    let latestDate: Date | null = null;

    for (const request of keys) {
      const url = new URL(request.url);
      const path = url.pathname;

      // Determine which table this cache entry is for
      let table: string | null = null;
      if (path.includes("/rest/v1/lessons")) table = "lessons";
      else if (path.includes("/rest/v1/substitutions")) table = "substitutions";
      else if (path.includes("/rest/v1/homework")) table = "homework";
      else if (path.includes("/rest/v1/messages")) table = "messages";

      if (!table) continue;

      try {
        const response = await cache.match(request);
        if (!response) continue;

        // Track latest cache date from response headers
        const dateHeader = response.headers.get("date");
        if (dateHeader) {
          const d = new Date(dateHeader);
          if (!latestDate || d > latestDate) latestDate = d;
        }

        const data = await response.json();
        if (!Array.isArray(data)) continue;

        if (table === "lessons") lessons = [...lessons, ...data];
        else if (table === "substitutions") substitutions = [...substitutions, ...data];
        else if (table === "homework") homework = [...homework, ...data];
        else if (table === "messages") messages = [...messages, ...data];
      } catch {
        // Skip corrupted cache entries
      }
    }

    return {
      lessons,
      substitutions,
      homework,
      messages,
      cachedAt: latestDate ? latestDate.toISOString() : null,
    };
  } catch {
    return empty;
  }
}

export default function OfflinePage() {
  const [data, setData] = useState<CachedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCachedData().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const hasCachedData = data && (data.lessons.length > 0 || data.homework.length > 0 || data.messages.length > 0);

  // Filter for today
  const todayDow = (() => {
    const d = new Date().getDay();
    return d === 0 ? 7 : d;
  })();
  const todayDate = new Date().toISOString().split("T")[0];

  const todayLessons = data?.lessons
    .filter((l) => l.day_of_week === todayDow)
    .sort((a, b) => a.lesson_number - b.lesson_number) || [];

  const todaySubs = data?.substitutions.filter((s) => s.date === todayDate) || [];

  const openHomework = data?.homework
    .filter((h) => !h.completed)
    .sort((a, b) => a.due_date.localeCompare(b.due_date)) || [];

  const unreadMessages = data?.messages.filter((m) => !m.read).length || 0;

  const cachedTimeStr = data?.cachedAt
    ? new Date(data.cachedAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
    : null;

  const cachedDateStr = data?.cachedAt
    ? new Date(data.cachedAt).toLocaleDateString("de-DE", { day: "numeric", month: "long" })
    : null;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Offline header */}
      <div className="sticky top-0 z-50 border-b bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4" />
            <div>
              <span className="text-sm font-medium">Offline-Modus</span>
              {cachedTimeStr && (
                <p className="text-xs text-amber-600 dark:text-amber-500">
                  Daten von {cachedDateStr}, {cachedTimeStr} Uhr
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 text-xs font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Neu laden
          </button>
        </div>
      </div>

      {/* Pending changes banner */}
      <div className="border-b bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 px-4 py-2">
        <p className="mx-auto max-w-2xl text-xs text-center">
          Änderungen werden automatisch synchronisiert sobald du online bist.
        </p>
      </div>

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Lade gecachte Daten...</p>
          </div>
        ) : !hasCachedData ? (
          /* No cached data fallback */
          <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <WifiOff className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Du bist offline</h1>
              <p className="text-muted-foreground max-w-xs">
                Keine Internetverbindung und keine gecachten Daten vorhanden.
                Öffne die App einmal online, damit Daten für den Offline-Modus gespeichert werden.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Erneut versuchen
            </button>
          </div>
        ) : (
          /* Cached data view */
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">
                {DAY_NAMES[todayDow] === "Sa" || DAY_NAMES[todayDow] === "So"
                  ? "Wochenende"
                  : `${["", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"][todayDow]}`}
              </h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            {/* Today's schedule */}
            {todayLessons.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Stundenplan heute
                </h2>
                <div className="space-y-1.5">
                  {todayLessons.map((lesson, i) => {
                    const sub = todaySubs.find((s) => s.lesson_number === lesson.lesson_number);
                    const isCancelled = sub?.type === "cancelled";
                    const isSubstituted = sub?.type === "substituted";
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-3 rounded-lg border p-3 ${
                          isCancelled
                            ? "border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20"
                            : isSubstituted
                            ? "border-orange-200 bg-orange-50 dark:border-orange-900/30 dark:bg-orange-950/20"
                            : ""
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
                            <span className={`font-medium text-sm ${isCancelled ? "text-red-600 line-through" : ""}`}>
                              {isSubstituted && sub?.new_subject ? sub.new_subject : lesson.subject}
                            </span>
                            {isCancelled && (
                              <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0 rounded-full font-medium">
                                Entfällt
                              </span>
                            )}
                            {isSubstituted && (
                              <span className="text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-1.5 py-0 rounded-full font-medium">
                                Vertretung
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {lesson.teacher || ""}{lesson.room ? ` · ${lesson.room}` : ""}
                          </div>
                          {sub?.info_text && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-orange-600">
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                              <span className="truncate">{sub.info_text}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground shrink-0">{lesson.lesson_number}.</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Open homework */}
            {openHomework.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <ClipboardList className="h-3.5 w-3.5" />
                  Offene Hausaufgaben ({openHomework.length})
                </h2>
                <div className="space-y-1.5">
                  {openHomework.slice(0, 5).map((hw, i) => {
                    const isOverdue = hw.due_date < todayDate;
                    const isDueToday = hw.due_date === todayDate;
                    return (
                      <div
                        key={i}
                        className={`rounded-lg border p-2.5 ${
                          isOverdue
                            ? "border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20"
                            : isDueToday
                            ? "border-orange-200 bg-orange-50 dark:border-orange-900/30 dark:bg-orange-950/20"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{hw.subject}</span>
                          {isOverdue && (
                            <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0 rounded-full font-medium">
                              Überfällig
                            </span>
                          )}
                          {isDueToday && (
                            <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0 rounded-full font-medium">
                              Heute fällig
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{hw.description}</p>
                      </div>
                    );
                  })}
                  {openHomework.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center py-1">
                      + {openHomework.length - 5} weitere
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Messages summary */}
            {data!.messages.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Nachrichten
                  {unreadMessages > 0 && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0 rounded-full font-medium">
                      {unreadMessages} ungelesen
                    </span>
                  )}
                </h2>
                <div className="space-y-1.5">
                  {data!.messages.slice(0, 3).map((msg, i) => (
                    <div
                      key={i}
                      className={`rounded-lg border p-2.5 ${!msg.read ? "border-primary/30 bg-primary/5" : ""}`}
                    >
                      <span className={`text-sm truncate ${!msg.read ? "font-semibold" : "font-medium"}`}>
                        {msg.title}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        {msg.sender && <span>{msg.sender}</span>}
                        {msg.sender && <span>&middot;</span>}
                        <span>{new Date(msg.date).toLocaleDateString("de-DE", { day: "numeric", month: "short" })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center py-4">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <RefreshCw className="h-4 w-4" />
                Erneut versuchen
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
