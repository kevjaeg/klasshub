import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateICalFeed } from "@/lib/calendar/ical";
import type { Lesson, Substitution } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ childId: string }> }
) {
  const { childId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  // Fetch child and verify ownership (RLS also enforces this, but be explicit)
  const { data: child } = await supabase
    .from("children")
    .select("*")
    .eq("id", childId)
    .eq("user_id", user.id)
    .single();

  if (!child) {
    return NextResponse.json({ error: "Kind nicht gefunden" }, { status: 404 });
  }

  // Fetch lessons and substitutions
  const [lessonsRes, subsRes] = await Promise.all([
    supabase.from("lessons").select("*").eq("child_id", childId),
    supabase.from("substitutions").select("*").eq("child_id", childId),
  ]);

  const lessons = (lessonsRes.data || []) as Lesson[];
  const substitutions = (subsRes.data || []) as Substitution[];

  const ical = generateICalFeed(child.name, lessons, substitutions);

  // Sanitize filename to prevent header injection
  const safeName = child.name.replace(/[^a-zA-Z0-9äöüÄÖÜß _-]/g, "").slice(0, 50) || "stundenplan";

  return new NextResponse(ical, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeName}-stundenplan.ics"`,
    },
  });
}
