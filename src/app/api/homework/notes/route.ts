import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const notesSchema = z.object({
  homeworkId: z.string().uuid(),
  notes: z.string().max(2000).default(""),
});

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  let parsed;
  try {
    parsed = notesSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }

  const { homeworkId, notes } = parsed;

  // Verify ownership: homework → child → user (RLS also enforces this, but be explicit)
  const { data: hw } = await supabase
    .from("homework")
    .select("child_id")
    .eq("id", homeworkId)
    .single();

  if (!hw) {
    return NextResponse.json({ error: "Hausaufgabe nicht gefunden" }, { status: 404 });
  }

  const { data: child } = await supabase
    .from("children")
    .select("id")
    .eq("id", hw.child_id)
    .single();

  if (!child) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  // Now safe to update
  const { error } = await supabase
    .from("homework")
    .update({ notes: notes || null })
    .eq("id", homeworkId);

  if (error) {
    return NextResponse.json(
      { error: "Speichern fehlgeschlagen" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
