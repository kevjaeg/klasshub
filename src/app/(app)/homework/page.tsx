import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import type { Child, Homework } from "@/lib/types";
import { HomeworkList } from "./homework-list";

export default async function HomeworkPage() {
  const supabase = await createClient();

  const { data: children } = await supabase
    .from("children")
    .select("*")
    .order("created_at");

  if (!children || children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <ClipboardList className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">Keine Kinder angelegt.</p>
      </div>
    );
  }

  const childIds = children.map((c: Child) => c.id);

  const { data: homework } = await supabase
    .from("homework")
    .select("*")
    .in("child_id", childIds)
    .order("due_date");

  const allHomework = (homework || []) as Homework[];

  if (allHomework.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Hausaufgaben</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Noch keine Hausaufgaben vorhanden. Synchronisiere die Daten, um Hausaufgaben zu laden.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const childMap = Object.fromEntries(
    (children as Child[]).map((c) => [c.id, c.name])
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Hausaufgaben</h1>
      <HomeworkList homework={allHomework} childMap={childMap} />
    </div>
  );
}
