import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdapter } from "@/lib/platforms/registry";
import type { PlatformId, SyncDiagnostic } from "@/lib/platforms/types";
import { dowBerlin } from "@/lib/date-utils";
import { safeString, safeSyncResult } from "@/lib/sanitize";
import { z } from "zod";

const syncSchema = z.object({
  childId: z.string().uuid(),
  username: z.string().min(1).max(200),
  password: z.string().min(1).max(500),
});

export async function POST(request: Request) {
  const supabase = await createClient();

  // Verify authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  let parsed;
  try {
    parsed = syncSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }

  const { childId } = parsed;
  let { username, password } = parsed;

  // Fetch child and verify ownership (RLS does this too, but let's be explicit)
  const { data: child, error: childError } = await supabase
    .from("children")
    .select("*")
    .eq("id", childId)
    .single();

  if (childError || !child) {
    return NextResponse.json(
      { error: "Kind nicht gefunden" },
      { status: 404 }
    );
  }

  // Rate limit: 5 minutes between syncs per child
  if (child.last_synced_at) {
    const minutesSinceLastSync =
      (Date.now() - new Date(child.last_synced_at).getTime()) / 60000;

    if (minutesSinceLastSync < 5) {
      const waitMinutes = Math.ceil(5 - minutesSinceLastSync);
      return NextResponse.json(
        { error: `Bitte warte noch ${waitMinutes} ${waitMinutes === 1 ? "Minute" : "Minuten"} bis zum nächsten Sync.` },
        { status: 429 }
      );
    }
  }

  // Determine platform – fall back to webuntis for legacy children
  const platformId: PlatformId = (child.platform as PlatformId) || "webuntis";
  const platformConfig: Record<string, string> = child.platform_config || {};

  // Strict config validation for WebUntis (including legacy column fallback)
  if (platformId === "webuntis") {
    const server = platformConfig.server || child.webuntis_server;
    const school = platformConfig.school || child.webuntis_school;

    if (!server || !school) {
      return NextResponse.json(
        { error: "WebUntis Konfiguration unvollständig. Bitte Kind bearbeiten und Server/Schulkürzel eintragen." },
        { status: 400 }
      );
    }

    platformConfig.server = server;
    platformConfig.school = school;
  }

  try {
    const adapter = getAdapter(platformId);

    // Fetch data – credentials used once then explicitly overwritten in finally block
    let rawResult;
    try {
      rawResult = await adapter.sync(platformConfig, { username, password });
    } finally {
      // Explicitly overwrite credentials before GC
      username = "\0".repeat(username.length);
      password = "\0".repeat(password.length);
    }

    // Defensive: ensure arrays even if adapter returns malformed data
    const result = safeSyncResult(rawResult) as typeof rawResult;

    // ── Diagnostics: log + build fetchWarnings for client ──
    const fetchWarnings: string[] = [];
    if (result.diagnostics && Array.isArray(result.diagnostics)) {
      const categoryLabels: Record<string, string> = {
        lessons: "Stundenplan",
        substitutions: "Vertretungen",
        messages: "Nachrichten",
        homework: "Hausaufgaben",
      };

      for (const d of result.diagnostics as SyncDiagnostic[]) {
        const label = categoryLabels[d.category] || d.category;
        console.warn(
          `[sync] ${platformId}/${d.category}: ${d.code}${d.httpStatus ? ` (HTTP ${d.httpStatus})` : ""}${d.detail ? ` – ${d.detail}` : ""}`
        );

        switch (d.code) {
          case "http_error":
            fetchWarnings.push(`${label} konnte nicht abgerufen werden (Fehler ${d.httpStatus || "unbekannt"})`);
            break;
          case "shape_mismatch":
            fetchWarnings.push(`${label}: Unerwartetes Datenformat`);
            break;
          case "network_error":
            fetchWarnings.push(`${label}: Verbindungsfehler`);
            break;
          // ok + not_supported → no warning
        }
      }
    }

    // ── Phase 1: Snapshot old data IDs + preserve user edits ──
    const [oldLessons, oldSubs, oldMsgs, oldHw, existingHomework] = await Promise.all([
      supabase.from("lessons").select("id").eq("child_id", childId),
      supabase.from("substitutions").select("id").eq("child_id", childId),
      supabase.from("messages").select("id").eq("child_id", childId),
      supabase.from("homework").select("id").eq("child_id", childId),
      supabase.from("homework").select("external_id, notes, completed").eq("child_id", childId),
    ]);

    const oldLessonIds = (oldLessons.data || []).map((r) => r.id);
    const oldSubIds = (oldSubs.data || []).map((r) => r.id);
    const oldMsgIds = (oldMsgs.data || []).map((r) => r.id);
    const oldHwIds = (oldHw.data || []).map((r) => r.id);

    // Build lookup for preserving user-set notes and completed status
    const hwNotesMap = new Map<string, { notes: string | null; completed: boolean }>();
    for (const hw of existingHomework.data || []) {
      if (hw.external_id) {
        hwNotesMap.set(hw.external_id, { notes: hw.notes, completed: hw.completed });
      }
    }

    // ── Phase 2: Insert new data FIRST (old data still intact as safety net) ──
    const errors: { category: string; message: string }[] = [];
    const newInsertedIds: { lessons: string[]; substitutions: string[]; messages: string[]; homework: string[] } = {
      lessons: [], substitutions: [], messages: [], homework: [],
    };

    // Insert new lessons
    if (result.lessons.length > 0) {
      const lessonsToInsert = result.lessons.map((l) => ({
        child_id: childId,
        subject: safeString(l.subject, 100) || "–",
        teacher: safeString(l.teacher, 100),
        room: safeString(l.room, 50),
        day_of_week: l.dayOfWeek,
        lesson_number: l.lessonNumber,
        start_time: l.startTime,
        end_time: l.endTime,
      }));

      const { data: inserted, error: insertError } = await supabase
        .from("lessons")
        .insert(lessonsToInsert)
        .select("id");

      if (insertError) {
        console.error("Lesson insert error:", insertError);
        errors.push({ category: "Stunden", message: "Speichern fehlgeschlagen" });
      } else {
        newInsertedIds.lessons = (inserted || []).map((r) => r.id);
      }
    }

    // Insert new substitutions
    if (result.substitutions.length > 0) {
      const subsToInsert = result.substitutions.map((s) => ({
        child_id: childId,
        date: s.date,
        lesson_number: s.lessonNumber,
        original_subject: safeString(s.originalSubject, 100),
        new_subject: safeString(s.newSubject, 100),
        original_teacher: safeString(s.originalTeacher, 100),
        new_teacher: safeString(s.newTeacher, 100),
        new_room: safeString(s.newRoom, 50),
        type: s.type,
        info_text: safeString(s.infoText, 500),
      }));

      const { data: inserted, error: insertError } = await supabase
        .from("substitutions")
        .insert(subsToInsert)
        .select("id");

      if (insertError) {
        console.error("Substitution insert error:", insertError);
        errors.push({ category: "Vertretungen", message: "Speichern fehlgeschlagen" });
      } else {
        newInsertedIds.substitutions = (inserted || []).map((r) => r.id);
      }
    }

    // Insert new messages
    if (result.messages && result.messages.length > 0) {
      const messagesToInsert = result.messages.map((m) => ({
        child_id: childId,
        external_id: m.id,
        title: safeString(m.title, 200) || "–",
        body: safeString(m.body, 5000),
        sender: safeString(m.sender, 100),
        date: m.date,
        read: m.read,
      }));

      const { data: inserted, error: insertError } = await supabase
        .from("messages")
        .insert(messagesToInsert)
        .select("id");

      if (insertError) {
        console.error("Message insert error:", insertError);
        errors.push({ category: "Nachrichten", message: "Speichern fehlgeschlagen" });
      } else {
        newInsertedIds.messages = (inserted || []).map((r) => r.id);
      }
    }

    // Insert new homework (preserve user notes and completed status from previous sync)
    if (result.homework && result.homework.length > 0) {
      const homeworkToInsert = result.homework.map((h) => {
        const existing = h.id ? hwNotesMap.get(h.id) : undefined;
        return {
          child_id: childId,
          external_id: h.id,
          subject: safeString(h.subject, 100) || "–",
          description: safeString(h.description, 2000) || "",
          due_date: h.dueDate,
          completed: existing ? existing.completed : h.completed,
          notes: existing?.notes ?? null,
        };
      });

      const { data: inserted, error: insertError } = await supabase
        .from("homework")
        .insert(homeworkToInsert)
        .select("id");

      if (insertError) {
        console.error("Homework insert error:", insertError);
        errors.push({ category: "Hausaufgaben", message: "Speichern fehlgeschlagen" });
      } else {
        newInsertedIds.homework = (inserted || []).map((r) => r.id);
      }
    }

    // ── Phase 3: Check if critical inserts failed ──
    // Lessons are required — if they failed, rollback all new inserts and keep old data
    const lessonsFailed = result.lessons.length > 0 && newInsertedIds.lessons.length === 0;

    if (lessonsFailed) {
      console.error("Critical sync failure: lesson insert failed, rolling back new inserts");

      // Delete any new data that was inserted
      await Promise.all([
        newInsertedIds.substitutions.length > 0
          ? supabase.from("substitutions").delete().in("id", newInsertedIds.substitutions)
          : Promise.resolve(),
        newInsertedIds.messages.length > 0
          ? supabase.from("messages").delete().in("id", newInsertedIds.messages)
          : Promise.resolve(),
        newInsertedIds.homework.length > 0
          ? supabase.from("homework").delete().in("id", newInsertedIds.homework)
          : Promise.resolve(),
      ]);

      return NextResponse.json(
        {
          error: "Sync fehlgeschlagen – deine bisherigen Daten wurden beibehalten.",
          errors,
        },
        { status: 500 }
      );
    }

    // ── Phase 4: Inserts succeeded — now safe to delete old data ──
    await Promise.all([
      oldLessonIds.length > 0
        ? supabase.from("lessons").delete().in("id", oldLessonIds)
        : Promise.resolve(),
      oldSubIds.length > 0
        ? supabase.from("substitutions").delete().in("id", oldSubIds)
        : Promise.resolve(),
      oldMsgIds.length > 0
        ? supabase.from("messages").delete().in("id", oldMsgIds)
        : Promise.resolve(),
      oldHwIds.length > 0
        ? supabase.from("homework").delete().in("id", oldHwIds)
        : Promise.resolve(),
    ]);

    // Update last_synced_at
    await supabase
      .from("children")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", childId);

    const newSubstitutions = result.substitutions.length;
    const newMessages = result.messages?.length || 0;
    const newHomework = result.homework?.length || 0;

    // Warn if no lessons returned on a weekday
    let warning: string | null = null;
    if (result.lessons.length === 0) {
      const dow = dowBerlin();
      if (dow >= 1 && dow <= 5) {
        console.warn(`No lessons returned from sync for child ${childId}`);
        warning = "Keine Stunden gefunden – ist heute schulfrei?";
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      partialSuccess: errors.length > 0,
      lessonsCount: result.lessons.length,
      substitutionsCount: newSubstitutions,
      messagesCount: newMessages,
      homeworkCount: newHomework,
      oldSubstitutionsCount: oldSubIds.length,
      oldMessagesCount: oldMsgIds.length,
      oldHomeworkCount: oldHwIds.length,
      warning,
      errors: errors.length > 0 ? errors : undefined,
      fetchWarnings: fetchWarnings.length > 0 ? fetchWarnings : undefined,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "";

    console.error("Sync error:", error);

    // Surface known user-facing errors with safe messages
    if (message.includes("401") || message.includes("auth") || message.includes("fehlgeschlagen")) {
      return NextResponse.json(
        { error: "Zugangsdaten sind ungültig" },
        { status: 401 }
      );
    }
    if (message.includes("ENOTFOUND") || message.includes("network") || message.includes("erreichbar")) {
      return NextResponse.json(
        { error: "Server nicht erreichbar. Prüfe die Verbindungsdaten." },
        { status: 502 }
      );
    }
    if (message.includes("TLS-Zertifikat")) {
      return NextResponse.json(
        { error: message },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "Sync fehlgeschlagen. Bitte versuche es später erneut." },
      { status: 500 }
    );
  }
}
