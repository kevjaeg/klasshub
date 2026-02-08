"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Trash2, Clock, School, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { SyncDialog } from "@/components/sync-dialog";
import { DemoButton } from "@/components/demo-button";
import { CalendarExport } from "@/components/calendar-export";
import { PLATFORMS } from "@/lib/platforms/registry";
import type { Child } from "@/lib/types";
import type { PlatformId } from "@/lib/platforms/types";

export default function ChildDetailPage() {
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const childId = params.id as string;

  useEffect(() => {
    fetchChild();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  async function fetchChild() {
    const { data } = await supabase
      .from("children")
      .select("*")
      .eq("id", childId)
      .single();

    setChild(data as Child | null);
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm(`${child?.name} wirklich entfernen? Alle Stundenplandaten gehen verloren.`)) {
      return;
    }

    setDeleting(true);
    const { error } = await supabase.from("children").delete().eq("id", childId);

    if (error) {
      toast.error("Konnte nicht gelöscht werden.");
      setDeleting(false);
      return;
    }

    toast.success(`${child?.name} wurde entfernt.`);
    router.push("/children");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!child) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Kind nicht gefunden.
      </div>
    );
  }

  // Determine platform – support legacy webuntis_* fields
  const platformId: PlatformId | null =
    (child.platform as PlatformId) ||
    (child.webuntis_server && child.webuntis_school ? "webuntis" : null);

  const platformInfo = platformId ? PLATFORMS[platformId] : null;
  const hasPlatform = !!platformId;

  return (
    <div className="space-y-4">
      <Link
        href="/children"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-semibold">
              {child.name[0].toUpperCase()}
            </div>
            <div>
              <CardTitle>{child.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <School className="h-3 w-3" />
                {child.school_name}
                {child.class_name && ` · ${child.class_name}`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Platform Connection Info */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Plattform-Verbindung</h3>
              {platformInfo && (
                <Badge variant="secondary" className={platformInfo.color}>
                  {platformInfo.name}
                </Badge>
              )}
            </div>
            {hasPlatform ? (
              <div className="space-y-1 text-sm text-muted-foreground">
                {child.platform_config &&
                  Object.entries(child.platform_config).map(([key, value]) =>
                    value ? (
                      <p key={key}>
                        {key}: {value}
                      </p>
                    ) : null
                  )}
                {/* Legacy WebUntis info */}
                {!child.platform_config && child.webuntis_server && (
                  <>
                    <p>Server: {child.webuntis_server}</p>
                    <p>Schule: {child.webuntis_school}</p>
                  </>
                )}
                {child.last_synced_at && (
                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Zuletzt: {new Date(child.last_synced_at).toLocaleString("de-DE")}
                    </Badge>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Keine Plattform konfiguriert. Du kannst Demo-Daten laden oder
                eine Plattform beim Bearbeiten auswählen.
              </p>
            )}
          </div>

          {/* Sync Actions */}
          <div className="space-y-2">
            <SyncDialog
              childId={child.id}
              childName={child.name}
              platformId={platformId}
            />
            <DemoButton childId={child.id} />
            <CalendarExport
              childId={child.id}
              childName={child.name}
              hasSynced={!!child.last_synced_at}
            />
          </div>

          <Separator />

          {/* Danger Zone */}
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleting ? "Wird entfernt..." : "Kind entfernen"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
