import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { pollUntil } from "@/lib/utils/poll";

describe("pollUntil (Stripe status polling)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("resolves true when check succeeds on first attempt", async () => {
    const check = vi.fn().mockResolvedValue(true);
    const promise = pollUntil(check, 3000, 10);
    const result = await promise;
    expect(result).toBe(true);
    expect(check).toHaveBeenCalledTimes(1);
  });

  it("polls at intervals and resolves when check succeeds", async () => {
    let callCount = 0;
    const check = vi.fn().mockImplementation(() => {
      callCount++;
      return Promise.resolve(callCount >= 3);
    });

    const promise = pollUntil(check, 3000, 10);
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(3000);
    await vi.advanceTimersByTimeAsync(3000);
    const result = await promise;

    expect(result).toBe(true);
    expect(check).toHaveBeenCalledTimes(3);
  });

  it("returns false after max attempts", async () => {
    const check = vi.fn().mockResolvedValue(false);

    const promise = pollUntil(check, 3000, 10);
    for (let i = 0; i < 10; i++) {
      await vi.advanceTimersByTimeAsync(3000);
    }
    const result = await promise;

    expect(result).toBe(false);
    expect(check).toHaveBeenCalledTimes(10);
  });

  it("handles check function errors gracefully", async () => {
    let callCount = 0;
    const check = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.reject(new Error("network"));
      return Promise.resolve(true);
    });

    // pollUntil does not catch errors - they propagate
    const promise = pollUntil(check, 3000, 10);
    await expect(promise).rejects.toThrow("network");
  });
});
