import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";
import type { Child, Message } from "@/lib/types";
import { MessageList } from "./message-list";

export default async function MessagesPage() {
  const supabase = await createClient();

  const { data: children } = await supabase
    .from("children")
    .select("*")
    .order("created_at");

  if (!children || children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <Mail className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">Keine Kinder angelegt.</p>
      </div>
    );
  }

  const childIds = children.map((c: Child) => c.id);

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .in("child_id", childIds)
    .order("date", { ascending: false });

  const allMessages = (messages || []) as Message[];

  if (allMessages.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Nachrichten</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Noch keine Nachrichten vorhanden. Synchronisiere die Daten, um Nachrichten zu laden.
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
      <h1 className="text-2xl font-bold">Nachrichten</h1>
      <MessageList messages={allMessages} childMap={childMap} />
    </div>
  );
}
