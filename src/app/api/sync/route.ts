import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncWebUntis } from "@/lib/webuntis/service";

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

  if (!child.webuntis_server || !child.webuntis_school) {
    return NextResponse.json(
      { error: "WebUntis ist für dieses Kind nicht konfiguriert" },
      { status: 400 }
    );
  }

  try {
    // Fetch data from WebUntis - credentials are ONLY used here and discarded after
    const result = await syncWebUntis(
      child.webuntis_server,
      child.webuntis_school,
      username,
      password
    );

    // Delete old data for this child
    await Promise.all([
      supabase.from("lessons").delete().eq("child_id", childId),
      supabase.from("substitutions").delete().eq("child_id", childId),
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

    // Update last_synced_at
    await supabase
      .from("children")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", childId);

    return NextResponse.json({
      success: true,
      lessonsCount: result.lessons.length,
      substitutionsCount: result.substitutions.length,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unbekannter Fehler";

    // Common WebUntis errors
    if (message.includes("401") || message.includes("auth")) {
      return NextResponse.json(
        { error: "WebUntis-Zugangsdaten sind ungültig" },
        { status: 401 }
      );
    }
    if (message.includes("ENOTFOUND") || message.includes("network")) {
      return NextResponse.json(
        { error: "WebUntis-Server nicht erreichbar. Prüfe den Servernamen." },
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
