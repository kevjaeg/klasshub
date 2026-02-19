import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("allows requests within the limit", () => {
    const result = rateLimit("test-user-1", 3, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks after limit is reached", () => {
    for (let i = 0; i < 5; i++) {
      rateLimit("test-user-2", 5, 60_000);
    }
    const result = rateLimit("test-user-2", 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    for (let i = 0; i < 3; i++) {
      rateLimit("test-user-3", 3, 10_000);
    }
    expect(rateLimit("test-user-3", 3, 10_000).allowed).toBe(false);

    // Advance past the window
    jest.advanceTimersByTime(11_000);

    const result = rateLimit("test-user-3", 3, 10_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("tracks keys independently", () => {
    for (let i = 0; i < 2; i++) {
      rateLimit("user-a", 2, 60_000);
    }
    expect(rateLimit("user-a", 2, 60_000).allowed).toBe(false);
    expect(rateLimit("user-b", 2, 60_000).allowed).toBe(true);
  });

  it("counts remaining correctly", () => {
    expect(rateLimit("test-user-5", 5, 60_000).remaining).toBe(4);
    expect(rateLimit("test-user-5", 5, 60_000).remaining).toBe(3);
    expect(rateLimit("test-user-5", 5, 60_000).remaining).toBe(2);
    expect(rateLimit("test-user-5", 5, 60_000).remaining).toBe(1);
    expect(rateLimit("test-user-5", 5, 60_000).remaining).toBe(0);
  });
});
