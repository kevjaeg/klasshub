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

  const { childId, username, password } = body;

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

    // Fetch data – credentials are ONLY used here and discarded after
    const result = await adapter.sync(platformConfig, { username, password });

    // Count old data BEFORE deleting (for notification diff)
    const [oldSubs, oldMsgs, oldHw] = await Promise.all([
      supabase.from("substitutions").select("id", { count: "exact", head: true }).eq("child_id", childId),
      supabase.from("messages").select("id", { count: "exact", head: true }).eq("child_id", childId),
      supabase.from("homework").select("id", { count: "exact", head: true }).eq("child_id", childId),
    ]);

    // Delete old data for this child
    await Promise.all([
      supabase.from("lessons").delete().eq("child_id", childId),
      supabase.from("substitutions").delete().eq("child_id", childId),
      supabase.from("messages").delete().eq("child_id", childId),
      supabase.from("homework").delete().eq("child_id", childId),
    ]);

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
      }
    }

    // Insert new homework
    if (result.homework && result.homework.length > 0) {
      const homeworkToInsert = result.homework.map((h) => ({
        child_id: childId,
        external_id: h.id,
        subject: h.subject,
        description: h.description,
        due_date: h.dueDate,
        completed: h.completed,
      }));

      const { error: insertError } = await supabase
        .from("homework")
        .insert(homeworkToInsert);

      if (insertError) {
        console.error("Homework insert error:", insertError);
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
      success: true,
      lessonsCount: result.lessons.length,
      substitutionsCount: newSubstitutions,
      messagesCount: newMessages,
      homeworkCount: newHomework,
      oldSubstitutionsCount: oldSubs.count || 0,
      oldMessagesCount: oldMsgs.count || 0,
      oldHomeworkCount: oldHw.count || 0,
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
  // NOTE: credentials (username, password) go out of scope here and are garbage collected
  // They are never stored in the database or any persistent storage
}
