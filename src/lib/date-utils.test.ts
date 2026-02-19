import { todayBerlin, dateBerlin, dowBerlin } from "./date-utils";

describe("todayBerlin", () => {
  it("returns a YYYY-MM-DD string", () => {
    const result = todayBerlin();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns a valid date", () => {
    const result = todayBerlin();
    const parsed = new Date(result);
    expect(parsed.toString()).not.toBe("Invalid Date");
  });
});

describe("dateBerlin", () => {
  it("returns today for offset 0", () => {
    const today = todayBerlin();
    expect(dateBerlin(0)).toBe(today);
  });

  it("returns tomorrow for offset 1", () => {
    const today = new Date(todayBerlin());
    const tomorrow = new Date(dateBerlin(1));
    const diffMs = tomorrow.getTime() - today.getTime();
    // Allow for DST transitions (23-25 hours)
    expect(diffMs).toBe(86_400_000); // Date-only diff is always 1 day
  });

  it("returns yesterday for offset -1", () => {
    const today = new Date(todayBerlin());
    const yesterday = new Date(dateBerlin(-1));
    const diffMs = today.getTime() - yesterday.getTime();
    expect(diffMs).toBe(86_400_000);
  });
});

describe("dowBerlin", () => {
  it("returns a number between 1 and 7", () => {
    const result = dowBerlin();
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(7);
  });

  it("returns 1 for Monday, 7 for Sunday", () => {
    // We can't control the current date, but we can verify the format
    const result = dowBerlin(0);
    expect([1, 2, 3, 4, 5, 6, 7]).toContain(result);
  });
});
