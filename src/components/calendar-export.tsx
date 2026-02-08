"use client";

import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";

interface CalendarExportProps {
  childId: string;
  childName: string;
  hasSynced: boolean;
}

export function CalendarExport({ childId, childName, hasSynced }: CalendarExportProps) {
  if (!hasSynced) return null;

  async function handleDownload() {
    try {
      const res = await fetch(`/api/calendar/${childId}`);
      if (!res.ok) {
        toast.error("Kalender konnte nicht erstellt werden.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${childName}-stundenplan.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Kalender heruntergeladen! Öffne die .ics Datei, um sie zu importieren.");
    } catch {
      toast.error("Download fehlgeschlagen.");
    }
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleDownload}>
      <CalendarPlus className="mr-2 h-4 w-4" />
      Stundenplan als Kalender exportieren
    </Button>
  );
}
