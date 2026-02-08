import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, School, Clock } from "lucide-react";
import Link from "next/link";
import type { Child } from "@/lib/types";

export default async function ChildrenPage() {
  const supabase = await createClient();

  const { data: children } = await supabase
    .from("children")
    .select("*")
    .order("created_at");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kinder</h1>
        <Link href="/children/add">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Hinzufügen
          </Button>
        </Link>
      </div>

      {(!children || children.length === 0) ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <School className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">Noch keine Kinder hinzugefügt</p>
              <p className="text-sm text-muted-foreground">
                Füge dein erstes Kind hinzu und verbinde seine Schul-Plattform.
              </p>
            </div>
            <Link href="/children/add">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Kind hinzufügen
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(children as Child[]).map((child) => (
            <Link key={child.id} href={`/children/${child.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    {child.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{child.name}</span>
                      {child.class_name && (
                        <Badge variant="secondary">{child.class_name}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {child.school_name}
                    </p>
                  </div>
                  <div className="text-right">
                    {child.last_synced_at ? (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(child.last_synced_at).toLocaleDateString("de-DE")}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Nicht verbunden
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
