import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 3) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch("https://mobile.webuntis.com/ms/schoolquery2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "req",
        method: "searchSchool",
        params: [{ search: query }],
        jsonrpc: "2.0",
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "WebUntis-Suche fehlgeschlagen" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const schools = data.result?.schools ?? [];

    const mapped = schools.map(
      (s: {
        server: string;
        loginName: string;
        displayName: string;
        address: string;
      }) => ({
        server: s.server,
        loginName: s.loginName,
        displayName: s.displayName,
        address: s.address,
      })
    );

    return NextResponse.json(mapped);
  } catch {
    return NextResponse.json(
      { error: "WebUntis-Suche fehlgeschlagen" },
      { status: 502 }
    );
  }
}
