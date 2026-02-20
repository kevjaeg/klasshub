import { POST } from "./route";

// ── Mock Supabase ──────────────────────────────────────────────────
const mockFrom = jest.fn();
const mockGetUser = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}));

// ── Mock platform registry ────────────────────────────────────────
const mockSync = jest.fn();

jest.mock("@/lib/platforms/registry", () => ({
  getAdapter: () => ({ sync: mockSync }),
}));

// ── Helpers ────────────────────────────────────────────────────────
function makeRequest(body: unknown) {
  return new Request("http://localhost/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  childId: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  username: "testuser",
  password: "testpass",
};

const CHILD_ROW = {
  id: VALID_BODY.childId,
  platform: "webuntis",
  platform_config: { server: "demo.webuntis.com", school: "demo" },
  last_synced_at: null,
};

function setupAuthenticatedUser() {
  mockGetUser.mockResolvedValue({
    data: { user: { id: "user-1" } },
  });
}

function setupChildQuery(child: typeof CHILD_ROW | null = CHILD_ROW) {
  mockFrom.mockImplementation((table: string) => {
    if (table === "children") {
      return {
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve(
                child
                  ? { data: child, error: null }
                  : { data: null, error: { message: "not found" } }
              ),
          }),
        }),
        update: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      };
    }
    // For lessons, substitutions, messages, homework tables
    return {
      select: () => ({
        eq: () => Promise.resolve({ data: [], error: null }),
      }),
      insert: () => ({
        select: () =>
          Promise.resolve({
            data: [{ id: "new-1" }],
            error: null,
          }),
      }),
      delete: () => ({
        in: () => Promise.resolve({ error: null }),
      }),
    };
  });
}

// ── Tests ──────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/sync", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.error).toMatch(/nicht angemeldet/i);
  });

  it("returns 400 for invalid body (missing childId)", async () => {
    setupAuthenticatedUser();

    const res = await POST(makeRequest({ username: "u", password: "p" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid body (empty username)", async () => {
    setupAuthenticatedUser();

    const res = await POST(
      makeRequest({ childId: VALID_BODY.childId, username: "", password: "p" })
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when child not found", async () => {
    setupAuthenticatedUser();
    setupChildQuery(null);

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(404);
  });

  it("returns 429 when sync rate limited", async () => {
    setupAuthenticatedUser();
    setupChildQuery({
      ...CHILD_ROW,
      last_synced_at: new Date().toISOString(), // just synced
    });

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(429);

    const json = await res.json();
    expect(json.error).toMatch(/warte/i);
  });

  it("returns success on valid sync", async () => {
    setupAuthenticatedUser();
    setupChildQuery();
    mockSync.mockResolvedValue({
      lessons: [
        {
          subject: "Mathe",
          teacher: "Müller",
          room: "101",
          dayOfWeek: 1,
          lessonNumber: 1,
          startTime: "08:00",
          endTime: "08:45",
        },
      ],
      substitutions: [],
    });

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.lessonsCount).toBe(1);
    expect(json.success).toBe(true);
  });

  it("returns 401 for invalid credentials error from adapter", async () => {
    setupAuthenticatedUser();
    setupChildQuery();
    mockSync.mockRejectedValue(new Error("401 Unauthorized"));

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.error).toMatch(/ungültig/i);
  });

  it("returns 502 for network error from adapter", async () => {
    setupAuthenticatedUser();
    setupChildQuery();
    mockSync.mockRejectedValue(new Error("ENOTFOUND demo.webuntis.com"));

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(502);
  });
});
