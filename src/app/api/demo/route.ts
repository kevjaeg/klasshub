import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_LESSONS, generateDemoSubstitutions } from "@/lib/webuntis/demo-data";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  let body: { childId: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }

  const { childId } = body;

  // Verify child exists and belongs to user
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

  // Delete old data
  await Promise.all([
    supabase.from("lessons").delete().eq("child_id", childId),
    supabase.from("substitutions").delete().eq("child_id", childId),
  ]);

  // Insert demo lessons
  const lessonsToInsert = DEMO_LESSONS.map((l) => ({
    child_id: childId,
    subject: l.subject,
    teacher: l.teacher,
    room: l.room,
    day_of_week: l.dayOfWeek,
    lesson_number: l.lessonNumber,
    start_time: l.startTime,
    end_time: l.endTime,
  }));

  await supabase.from("lessons").insert(lessonsToInsert);

  // Insert demo substitutions
  const demoSubs = generateDemoSubstitutions();
  const subsToInsert = demoSubs.map((s) => ({
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

  await supabase.from("substitutions").insert(subsToInsert);

  // Update last_synced_at and fill in demo school info
  await supabase
    .from("children")
    .update({
      last_synced_at: new Date().toISOString(),
      webuntis_server: child.webuntis_server || "demo.webuntis.com",
      webuntis_school: child.webuntis_school || "demo-gymnasium",
    })
    .eq("id", childId);

  return NextResponse.json({
    success: true,
    lessonsCount: DEMO_LESSONS.length,
    substitutionsCount: demoSubs.length,
    demo: true,
  });
}
