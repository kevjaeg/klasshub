import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, AlertTriangle, AlertCircle, Mail, ClipboardList, Sparkles, GraduationCap } from "lucide-react";
import { ForceLightMode } from "@/components/force-light-mode";
import { DEMO_LESSONS, generateDemoSubstitutions, generateDemoMessages, generateDemoHomework } from "@/lib/webuntis/demo-data";

export const metadata = {
  title: "KlassHub Demo – So sieht dein Dashboard aus",
  description: "Interaktive Demo von KlassHub. Sieh dir den Stundenplan, Vertretungen und Hausaufgaben an – ohne Registrierung.",
};

const DAY_NAMES = ["", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

function formatTime(time: string): string {
  return time.slice(0, 5);
}

function getTodayDayOfWeek(): number {
  const day = new Date().getDay();
  return day === 0 ? 7 : day;
}

export default function DemoPage() {
  const todayDow = getTodayDayOfWeek();
  const todayDate = new Date().toISOString().split("T")[0];

  const lessons = DEMO_LESSONS;
  const substitutions = generateDemoSubstitutions();
  const messages = generateDemoMessages();
  const homework = generateDemoHomework();

  const todayLessons = lessons
    .filter((l) => l.dayOfWeek === (todayDow <= 5 ? todayDow : 1))
    .sort((a, b) => a.lessonNumber - b.lessonNumber);

  const todaySubs = substitutions.filter((s) => s.date === todayDate);
  const openHomework = homework.filter((h) => !h.completed);
  const todayCancelled = todaySubs.filter((s) => s.type === "cancelled").length;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <ForceLightMode />

      {/* Demo banner */}
      <div className="sticky top-0 z-50 border-b bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Demo-Modus</span>
          </div>
          <Link href="/register">
            <Button size="sm" variant="secondary" className="h-7 text-xs gap-1">
              Eigenes Konto erstellen
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation mock */}
      <header className="border-b bg-background">
        <div className="mx-auto flex h-12 max-w-2xl items-center px-4 gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold">KlassHub</span>
          <span className="ml-auto text-xs text-muted-foreground">Demo-Nutzer</span>
        </div>
      </header>

      {/* Dashboard content */}
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold">
              {todayDow <= 5 ? DAY_NAMES[todayDow] : "Montag"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("de-DE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Child header */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
              M
            </div>
            <div>
              <span className="font-semibold text-sm">Max Mustermann</span>
              <span className="text-xs text-muted-foreground ml-2">7b, Demo-Gymnasium</span>
            </div>
          </div>

          {/* Today's schedule */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {todayDow <= 5 ? "Heute" : "Montag (Demo)"}
                </CardTitle>
                {todayCancelled > 0 && (
                  <Badge variant="destructive" className="text-[10px]">
                    {todayCancelled} {todayCancelled === 1 ? "Ausfall" : "Ausfälle"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-1.5">
                {todayLessons.map((lesson, i) => {
                  const sub = todaySubs.find((s) => s.lessonNumber === lesson.lessonNumber);
                  const isCancelled = sub?.type === "cancelled";
                  const isSubstituted = sub?.type === "substituted";

                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                        isCancelled
                          ? "border-red-200 bg-red-50"
                          : isSubstituted
                          ? "border-orange-200 bg-orange-50"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="w-12 text-center">
                        <div className="text-xs font-medium text-muted-foreground">
                          {formatTime(lesson.startTime)}
                        </div>
                        <div className="text-[10px] text-muted-foreground/70">
                          {formatTime(lesson.endTime)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-medium text-sm ${isCancelled ? "text-red-600 line-through" : ""}`}>
                            {isSubstituted && sub?.newSubject ? sub.newSubject : lesson.subject}
                          </span>
                          {isCancelled && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Entfällt</Badge>
                          )}
                          {isSubstituted && (
                            <Badge className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0">Vertretung</Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {lesson.teacher || ""}{lesson.room ? ` · ${lesson.room}` : ""}
                        </div>
                        {sub?.infoText && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-orange-600">
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                            <span className="truncate">{sub.infoText}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">{lesson.lessonNumber}.</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Homework */}
          {openHomework.length > 0 && (
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <ClipboardList className="h-3.5 w-3.5" />
                    Hausaufgaben
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-1.5">
                  {openHomework.map((hw) => {
                    const isOverdue = hw.dueDate < todayDate;
                    const isDueToday = hw.dueDate === todayDate;
                    return (
                      <div
                        key={hw.id}
                        className={`flex items-center gap-3 rounded-lg border p-2.5 ${
                          isOverdue
                            ? "border-red-200 bg-red-50"
                            : isDueToday
                            ? "border-orange-200 bg-orange-50"
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
                              <Badge className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0">
                                Heute fällig
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{hw.description}</p>
                        </div>
                        <div className="text-[10px] text-muted-foreground shrink-0">
                          {new Date(hw.dueDate + "T00:00:00").toLocaleDateString("de-DE", { day: "numeric", month: "short" })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Messages */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                Nachrichten
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-1.5">
                {messages.slice(0, 3).map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-lg border p-2.5 ${!msg.read ? "border-primary/30 bg-primary/5" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-sm truncate ${!msg.read ? "font-semibold" : "font-medium"}`}>
                        {msg.title}
                      </span>
                      {!msg.read && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      {msg.sender && <span>{msg.sender}</span>}
                      {msg.sender && <span>&middot;</span>}
                      <span>{new Date(msg.date).toLocaleDateString("de-DE", { day: "numeric", month: "short" })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="py-6 text-center flex flex-col items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-semibold">Gefällt dir was du siehst?</p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Verbinde dein echtes Schulkonto und sieh die Daten deiner Kinder live.
                </p>
              </div>
              <Link href="/register">
                <Button className="gap-2">
                  Jetzt kostenlos starten
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
