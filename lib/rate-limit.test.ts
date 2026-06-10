import { describe, it, expect, beforeEach, vi } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    // reset the global in-memory store between tests
    (globalThis as { __rateLimitStore?: unknown }).__rateLimitStore = undefined;
  });

  it("allows requests up to the max within the window", () => {
    for (let i = 0; i < 5; i++) {
      expect(rateLimit("a", 60_000, 5).ok).toBe(true);
    }
  });

  it("blocks the request that exceeds the max and reports retry-after", () => {
    for (let i = 0; i < 5; i++) rateLimit("b", 60_000, 5);
    const blocked = rateLimit("b", 60_000, 5);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after the window elapses", () => {
    vi.useFakeTimers();
    try {
      for (let i = 0; i < 5; i++) rateLimit("c", 1_000, 5);
      expect(rateLimit("c", 1_000, 5).ok).toBe(false);
      vi.advanceTimersByTime(1_001);
      expect(rateLimit("c", 1_000, 5).ok).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("isolates different keys", () => {
    for (let i = 0; i < 5; i++) rateLimit("x", 60_000, 5);
    expect(rateLimit("x", 60_000, 5).ok).toBe(false);
    expect(rateLimit("y", 60_000, 5).ok).toBe(true);
  });
});
