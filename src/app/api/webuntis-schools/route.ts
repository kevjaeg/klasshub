import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

// Cache school search results for 5 minutes to reduce load on WebUntis API
const CACHE_TTL = 5 * 60_000;
const searchCache = new Map<string, { data: unknown; expires: number }>();

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const { allowed } = rateLimit(`schools:${user.id}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Zu viele Anfragen. Bitte warte kurz." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 3) {
    return NextResponse.json([]);
  }

  const cacheKey = query.toLowerCase();
  const cached = searchCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(cached.data);
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

    if (data.error?.code === -6003) {
      return NextResponse.json({ error: "Zu viele Ergebnisse. Bitte gib einen genaueren Schulnamen ein." }, { status: 422 });
    }

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

    searchCache.set(cacheKey, { data: mapped, expires: Date.now() + CACHE_TTL });
    return NextResponse.json(mapped);
  } catch {
    return NextResponse.json(
      { error: "WebUntis-Suche fehlgeschlagen" },
      { status: 502 }
    );
  }
}
