/**
 * Polls a check function at a fixed interval until it returns true or max attempts is reached.
 * Returns true if the check succeeded within the limit, false if it timed out.
 */
export async function pollUntil(
  checkFn: () => Promise<boolean>,
  intervalMs: number,
  maxAttempts: number
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await checkFn();
    if (result) return true;
    if (i < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }
  return false;
}
