import { safeString, safeSyncResult } from "./sanitize";

describe("safeString", () => {
  it("returns null for null/undefined/empty", () => {
    expect(safeString(null)).toBeNull();
    expect(safeString(undefined)).toBeNull();
    expect(safeString("")).toBeNull();
    expect(safeString("   ")).toBeNull();
  });

  it("returns trimmed string within limit", () => {
    expect(safeString("  hello  ")).toBe("hello");
    expect(safeString("abc", 10)).toBe("abc");
  });

  it("truncates long strings with ellipsis", () => {
    const result = safeString("abcdef", 5);
    expect(result).toBe("abcd\u2026");
    expect(Array.from(result!).length).toBe(5);
  });

  it("handles emoji correctly (grapheme count)", () => {
    // Each emoji is 1 grapheme but multiple code units
    const emoji = "👨‍👩‍👧‍👦hello";
    const result = safeString(emoji, 3);
    expect(result).not.toBeNull();
    expect(Array.from(result!).length).toBe(3);
  });

  it("returns string as-is when exactly at limit", () => {
    expect(safeString("abcde", 5)).toBe("abcde");
  });
});

describe("safeSyncResult", () => {
  it("returns empty arrays for null/undefined/non-object", () => {
    const result = safeSyncResult(null);
    expect(result).toEqual({
      lessons: [],
      substitutions: [],
      messages: [],
      homework: [],
    });

    expect(safeSyncResult(undefined)).toEqual(result);
    expect(safeSyncResult("string")).toEqual(result);
    expect(safeSyncResult(42)).toEqual(result);
  });

  it("preserves valid arrays", () => {
    const input = {
      lessons: [{ id: 1 }],
      substitutions: [{ id: 2 }],
      messages: [{ id: 3 }],
      homework: [{ id: 4 }],
    };
    expect(safeSyncResult(input)).toEqual(input);
  });

  it("replaces non-array fields with empty arrays", () => {
    const input = {
      lessons: "not an array",
      substitutions: null,
      messages: 42,
      homework: { wrong: true },
    };
    expect(safeSyncResult(input)).toEqual({
      lessons: [],
      substitutions: [],
      messages: [],
      homework: [],
    });
  });

  it("handles partial data", () => {
    const input = { lessons: [1, 2] };
    const result = safeSyncResult(input);
    expect(result.lessons).toEqual([1, 2]);
    expect(result.substitutions).toEqual([]);
    expect(result.messages).toEqual([]);
    expect(result.homework).toEqual([]);
  });
});
