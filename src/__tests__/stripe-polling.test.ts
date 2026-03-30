import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Stripe status polling logic", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("polls at 3s intervals and resolves when connected", async () => {
    let callCount = 0;
    const checkStripe = vi.fn().mockImplementation(() => {
      callCount++;
      return Promise.resolve(callCount >= 3);
    });

    let resolved = false;
    const poll = async () => {
      for (let i = 0; i < 10; i++) {
        const connected = await checkStripe();
        if (connected) {
          resolved = true;
          return;
        }
        await new Promise((r) => setTimeout(r, 3000));
      }
    };

    const promise = poll();
    // Advance past first two checks (not connected) and third (connected)
    await vi.advanceTimersByTimeAsync(0); // first check
    await vi.advanceTimersByTimeAsync(3000); // second check
    await vi.advanceTimersByTimeAsync(3000); // third check
    await promise;

    expect(resolved).toBe(true);
    expect(checkStripe).toHaveBeenCalledTimes(3);
  });

  it("gives up after 10 attempts (30 seconds)", async () => {
    const checkStripe = vi.fn().mockResolvedValue(false);

    let timedOut = false;
    const poll = async () => {
      for (let i = 0; i < 10; i++) {
        const connected = await checkStripe();
        if (connected) return;
        await new Promise((r) => setTimeout(r, 3000));
      }
      timedOut = true;
    };

    const promise = poll();
    for (let i = 0; i < 10; i++) {
      await vi.advanceTimersByTimeAsync(3000);
    }
    await promise;

    expect(timedOut).toBe(true);
    expect(checkStripe).toHaveBeenCalledTimes(10);
  });
});
