import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAtlasSearch } from "@/lib/hooks/useAtlasSearch";

const mockSearchEvents = vi.fn();
vi.mock("@/lib/services/atlas-client", () => ({
  searchEvents: (...args: unknown[]) => mockSearchEvents(...args),
}));

const makeResult = (count: number, hasNext = false) => ({
  total_results: count,
  page: 1,
  per_page: 12,
  total_pages: 1,
  has_next: hasNext,
  results: Array.from({ length: count }, (_, i) => ({
    event: { id: String(i), title: `Event ${i}`, start: "2026-01-01", source_platform: "lemonade" },
  })),
});

describe("useAtlasSearch", () => {
  beforeEach(() => {
    mockSearchEvents.mockReset();
  });

  it("starts with empty results", () => {
    const { result } = renderHook(() => useAtlasSearch());
    expect(result.current.results).toEqual([]);
    expect(result.current.totalResults).toBe(0);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("search populates results", async () => {
    mockSearchEvents.mockResolvedValueOnce(makeResult(3));

    const { result } = renderHook(() => useAtlasSearch());

    await act(async () => {
      await result.current.search({ q: "test" });
    });

    expect(result.current.results).toHaveLength(3);
    expect(result.current.totalResults).toBe(3);
    expect(result.current.error).toBeNull();
  });

  it("retries once on failure before reporting error", async () => {
    mockSearchEvents
      .mockRejectedValueOnce(new Error("Network error"))
      .mockRejectedValueOnce(new Error("Network error again"));

    const { result } = renderHook(() => useAtlasSearch());

    await act(async () => {
      await result.current.search({ q: "fail" });
    });

    expect(mockSearchEvents).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBeTruthy();
    expect(result.current.results).toEqual([]);
  });

  it("retries and succeeds on second attempt", async () => {
    mockSearchEvents
      .mockRejectedValueOnce(new Error("Transient error"))
      .mockResolvedValueOnce(makeResult(2));

    const { result } = renderHook(() => useAtlasSearch());

    await act(async () => {
      await result.current.search({ q: "retry" });
    });

    expect(mockSearchEvents).toHaveBeenCalledTimes(2);
    expect(result.current.results).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it("loadMore appends results", async () => {
    mockSearchEvents.mockResolvedValueOnce({
      ...makeResult(3, true),
      page: 1,
    });

    const { result } = renderHook(() => useAtlasSearch());

    await act(async () => {
      await result.current.search({});
    });

    expect(result.current.results).toHaveLength(3);
    expect(result.current.hasNext).toBe(true);

    mockSearchEvents.mockResolvedValueOnce({
      ...makeResult(2, false),
      page: 2,
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.results).toHaveLength(5);
    expect(result.current.hasNext).toBe(false);
  });
});
