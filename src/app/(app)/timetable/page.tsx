import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Child, Lesson } from "@/lib/types";

const DAYS = [
  { num: 1, short: "Mo", long: "Montag" },
  { num: 2, short: "Di", long: "Dienstag" },
  { num: 3, short: "Mi", long: "Mittwoch" },
  { num: 4, short: "Do", long: "Donnerstag" },
  { num: 5, short: "Fr", long: "Freitag" },
];

function formatTime(time: string): string {
  return time.slice(0, 5);
}

// Subject color mapping
const SUBJECT_COLORS: Record<string, string> = {
  Mathematik: "bg-blue-100 text-blue-800",
  Mathe: "bg-blue-100 text-blue-800",
  Deutsch: "bg-red-100 text-red-800",
  Englisch: "bg-purple-100 text-purple-800",
  Physik: "bg-cyan-100 text-cyan-800",
  Chemie: "bg-green-100 text-green-800",
  Biologie: "bg-emerald-100 text-emerald-800",
  Bio: "bg-emerald-100 text-emerald-800",
  Geschichte: "bg-amber-100 text-amber-800",
  Sport: "bg-orange-100 text-orange-800",
  Kunst: "bg-pink-100 text-pink-800",
  Musik: "bg-violet-100 text-violet-800",
  Informatik: "bg-slate-100 text-slate-800",
  Erdkunde: "bg-lime-100 text-lime-800",
  Geographie: "bg-lime-100 text-lime-800",
  Religion: "bg-yellow-100 text-yellow-800",
  Ethik: "bg-yellow-100 text-yellow-800",
  Französisch: "bg-indigo-100 text-indigo-800",
  Latein: "bg-stone-100 text-stone-800",
  Spanisch: "bg-rose-100 text-rose-800",
};

function getSubjectColor(subject: string): string {
  return SUBJECT_COLORS[subject] || "bg-gray-100 text-gray-800";
}

export default async function TimetablePage() {
  const supabase = await createClient();

  const { data: children } = await supabase
    .from("children")
    .select("*")
    .order("created_at");

  if (!children || children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <CalendarDays className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">
          Füge zuerst ein Kind hinzu.
        </p>
        <Link href="/children/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Kind hinzufügen
          </Button>
        </Link>
      </div>
    );
  }

  const childIds = children.map((c: Child) => c.id);
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .in("child_id", childIds)
    .order("lesson_number");

  const allLessons = (lessons || []) as Lesson[];

  const todayDow = new Date().getDay();
  const defaultDay = todayDow >= 1 && todayDow <= 5 ? todayDow.toString() : "1";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Stundenplan</h1>

      {(children as Child[]).map((child) => {
        const childLessons = allLessons.filter((l) => l.child_id === child.id);

        return (
          <Card key={child.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{child.name}</CardTitle>
                <Badge variant="secondary">
                  {child.class_name || child.school_name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {childLessons.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {child.last_synced_at
                    ? "Kein Stundenplan vorhanden."
                    : "Noch nicht synchronisiert."}
                </p>
              ) : (
                <Tabs defaultValue={defaultDay}>
                  <TabsList className="w-full">
                    {DAYS.map((day) => (
                      <TabsTrigger key={day.num} value={day.num.toString()} className="flex-1">
                        {day.short}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {DAYS.map((day) => {
                    const dayLessons = childLessons
                      .filter((l) => l.day_of_week === day.num)
                      .sort((a, b) => a.lesson_number - b.lesson_number);

                    return (
                      <TabsContent key={day.num} value={day.num.toString()}>
                        {dayLessons.length === 0 ? (
                          <p className="py-6 text-center text-sm text-muted-foreground">
                            Kein Unterricht am {day.long}.
                          </p>
                        ) : (
                          <div className="space-y-2 pt-2">
                            {dayLessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-3 rounded-lg border p-3"
                              >
                                <div className="w-12 text-center text-xs text-muted-foreground">
                                  <div className="font-medium">
                                    {formatTime(lesson.start_time)}
                                  </div>
                                  <div>{formatTime(lesson.end_time)}</div>
                                </div>
                                <div
                                  className={`rounded-md px-2 py-1 text-xs font-medium ${getSubjectColor(lesson.subject)}`}
                                >
                                  {lesson.subject}
                                </div>
                                <div className="flex-1 text-xs text-muted-foreground">
                                  {[lesson.teacher, lesson.room]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    );
                  })}
                </Tabs>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
