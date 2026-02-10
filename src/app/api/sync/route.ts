import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdapter } from "@/lib/platforms/registry";
import type { PlatformId } from "@/lib/platforms/types";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Verify authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  let body: {
    childId: string;
    username: string;
    password: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }

  let { childId, username, password } = body;

  if (!childId || !username || !password) {
    return NextResponse.json(
      { error: "Alle Felder müssen ausgefüllt sein" },
      { status: 400 }
    );
  }

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

  // Legacy support: populate config from old webuntis_* columns if needed
  if (platformId === "webuntis" && !platformConfig.server) {
    if (child.webuntis_server) platformConfig.server = child.webuntis_server;
    if (child.webuntis_school) platformConfig.school = child.webuntis_school;
  }

  try {
    const adapter = getAdapter(platformId);

    // Fetch data – credentials used once then explicitly overwritten in finally block
    let result;
    try {
      result = await adapter.sync(platformConfig, { username, password });
    } finally {
      // Explicitly overwrite credentials before GC
      username = "\0".repeat(username.length);
      password = "\0".repeat(password.length);
      body.username = "\0".repeat(body.username.length);
      body.password = "\0".repeat(body.password.length);
    }

    // Count old data BEFORE deleting (for notification diff)
    // Also preserve user notes from homework (keyed by external_id)
    const [oldSubs, oldMsgs, oldHw, existingHomework] = await Promise.all([
      supabase.from("substitutions").select("id", { count: "exact", head: true }).eq("child_id", childId),
      supabase.from("messages").select("id", { count: "exact", head: true }).eq("child_id", childId),
      supabase.from("homework").select("id", { count: "exact", head: true }).eq("child_id", childId),
      supabase.from("homework").select("external_id, notes, completed").eq("child_id", childId),
    ]);

    // Build lookup for preserving user-set notes and completed status
    const hwNotesMap = new Map<string, { notes: string | null; completed: boolean }>();
    for (const hw of existingHomework.data || []) {
      if (hw.external_id) {
        hwNotesMap.set(hw.external_id, { notes: hw.notes, completed: hw.completed });
      }
    }

    // Delete old data for this child
    await Promise.all([
      supabase.from("lessons").delete().eq("child_id", childId),
      supabase.from("substitutions").delete().eq("child_id", childId),
      supabase.from("messages").delete().eq("child_id", childId),
      supabase.from("homework").delete().eq("child_id", childId),
    ]);

    // Track partial failures
    const errors: { category: string; message: string }[] = [];

    // Insert new lessons
    if (result.lessons.length > 0) {
      const lessonsToInsert = result.lessons.map((l) => ({
        child_id: childId,
        subject: l.subject,
        teacher: l.teacher,
        room: l.room,
        day_of_week: l.dayOfWeek,
        lesson_number: l.lessonNumber,
        start_time: l.startTime,
        end_time: l.endTime,
      }));

      const { error: insertError } = await supabase
        .from("lessons")
        .insert(lessonsToInsert);

      if (insertError) {
        console.error("Lesson insert error:", insertError);
        errors.push({ category: "Stunden", message: insertError.message });
      }
    }

    // Insert new substitutions
    if (result.substitutions.length > 0) {
      const subsToInsert = result.substitutions.map((s) => ({
        child_id: childId,
        date: s.date,
        lesson_number: s.lessonNumber,
        original_subject: s.originalSubject,
        new_subject: s.newSubject,
        original_teacher: s.originalTeacher,
        new_teacher: s.newTeacher,
        new_room: s.newRoom,
        type: s.type,
        info_text: s.infoText,
      }));

      const { error: insertError } = await supabase
        .from("substitutions")
        .insert(subsToInsert);

      if (insertError) {
        console.error("Substitution insert error:", insertError);
        errors.push({ category: "Vertretungen", message: insertError.message });
      }
    }

    // Insert new messages
    if (result.messages && result.messages.length > 0) {
      const messagesToInsert = result.messages.map((m) => ({
        child_id: childId,
        external_id: m.id,
        title: m.title,
        body: m.body,
        sender: m.sender,
        date: m.date,
        read: m.read,
      }));

      const { error: insertError } = await supabase
        .from("messages")
        .insert(messagesToInsert);

      if (insertError) {
        console.error("Message insert error:", insertError);
        errors.push({ category: "Nachrichten", message: insertError.message });
      }
    }

    // Insert new homework (preserve user notes and completed status from previous sync)
    if (result.homework && result.homework.length > 0) {
      const homeworkToInsert = result.homework.map((h) => {
        const existing = h.id ? hwNotesMap.get(h.id) : undefined;
        return {
          child_id: childId,
          external_id: h.id,
          subject: h.subject,
          description: h.description,
          due_date: h.dueDate,
          completed: existing ? existing.completed : h.completed,
          notes: existing?.notes ?? null,
        };
      });

      const { error: insertError } = await supabase
        .from("homework")
        .insert(homeworkToInsert);

      if (insertError) {
        console.error("Homework insert error:", insertError);
        errors.push({ category: "Hausaufgaben", message: insertError.message });
      }
    }

    // Update last_synced_at
    await supabase
      .from("children")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", childId);

    const newSubstitutions = result.substitutions.length;
    const newMessages = result.messages?.length || 0;
    const newHomework = result.homework?.length || 0;

    return NextResponse.json({
      success: errors.length === 0,
      partialSuccess: errors.length > 0,
      lessonsCount: result.lessons.length,
      substitutionsCount: newSubstitutions,
      messagesCount: newMessages,
      homeworkCount: newHomework,
      oldSubstitutionsCount: oldSubs.count || 0,
      oldMessagesCount: oldMsgs.count || 0,
      oldHomeworkCount: oldHw.count || 0,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unbekannter Fehler";

    // Common auth errors
    if (message.includes("401") || message.includes("auth") || message.includes("fehlgeschlagen")) {
      return NextResponse.json(
        { error: message.includes("fehlgeschlagen") ? message : "Zugangsdaten sind ungültig" },
        { status: 401 }
      );
    }
    if (message.includes("ENOTFOUND") || message.includes("network") || message.includes("erreichbar")) {
      return NextResponse.json(
        { error: message.includes("erreichbar") ? message : "Server nicht erreichbar. Prüfe die Verbindungsdaten." },
        { status: 502 }
      );
    }

    console.error("Sync error:", message);
    return NextResponse.json(
      { error: "Sync fehlgeschlagen: " + message },
      { status: 500 }
    );
  }
}
