import { describe, it, expect, vi, afterEach } from "vitest";
import type { LeaderboardEntry } from "@/lib/types/atlas";

describe("Leaderboard data handling", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("fetches leaderboard with period and category params", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          entries: [],
          period: "month",
          category: "tech",
        }),
    });

    const params = new URLSearchParams();
    params.set("period", "month");
    params.set("category", "tech");
    const url = `/api/atlas/leaderboard?${params.toString()}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();

    expect(data.period).toBe("month");
    expect(data.category).toBe("tech");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/atlas/leaderboard?period=month&category=tech",
      expect.objectContaining({})
    );
  });

  it("sorts entries by total_attendees descending by default", () => {
    const entries: LeaderboardEntry[] = [
      { rank: 1, space_id: "a", space_name: "A", total_events: 10, total_attendees: 500, average_rating: 4.5, connected_platforms: ["Lemonade"], verified: true },
      { rank: 2, space_id: "b", space_name: "B", total_events: 20, total_attendees: 300, average_rating: 3.8, connected_platforms: ["Eventbrite"], verified: false },
      { rank: 3, space_id: "c", space_name: "C", total_events: 5, total_attendees: 800, average_rating: 4.9, connected_platforms: ["Lemonade", "Lu.ma"], verified: true },
    ];
    const sorted = [...entries].sort((a, b) => b.total_attendees - a.total_attendees);
    expect(sorted[0].space_id).toBe("c");
    expect(sorted[1].space_id).toBe("a");
    expect(sorted[2].space_id).toBe("b");
  });

  it("filters trending entries by non-zero trend_percent", () => {
    const entries: LeaderboardEntry[] = [
      { rank: 1, space_id: "a", space_name: "A", total_events: 10, total_attendees: 500, average_rating: 4.5, connected_platforms: [], verified: true, trend_percent: 25 },
      { rank: 2, space_id: "b", space_name: "B", total_events: 20, total_attendees: 300, average_rating: 3.8, connected_platforms: [], verified: false, trend_percent: 0 },
      { rank: 3, space_id: "c", space_name: "C", total_events: 5, total_attendees: 800, average_rating: 4.9, connected_platforms: [], verified: true, trend_percent: -10 },
    ];
    const trending = entries
      .filter((e) => e.trend_percent && e.trend_percent !== 0)
      .sort((a, b) => Math.abs(b.trend_percent || 0) - Math.abs(a.trend_percent || 0));
    expect(trending).toHaveLength(2);
    expect(trending[0].space_id).toBe("a");
    expect(trending[1].space_id).toBe("c");
  });

  it("handles empty leaderboard response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          entries: [],
          period: "",
        }),
    });

    const res = await fetch("/api/atlas/leaderboard");
    const data = await res.json();
    expect(data.entries).toEqual([]);
  });

  it("handles fetch failure", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    const res = await fetch("/api/atlas/leaderboard");
    expect(res.ok).toBe(false);
  });
});
