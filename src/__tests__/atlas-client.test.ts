import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Set env before importing
process.env.NEXT_PUBLIC_ATLAS_REGISTRY_URL = "https://registry.test";

import { searchEvents, getStatsFallback } from "@/lib/services/atlas-client";

describe("searchEvents", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("serializes params into query string", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          "atlas:search_result": {
            total_results: 0,
            page: 1,
            per_page: 12,
            total_pages: 0,
            has_next: false,
            results: [],
          },
        }),
    });

    await searchEvents({ q: "techno", page: 1, per_page: 12 });

    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain("q=techno");
    expect(url).toContain("page=1");
    expect(url).toContain("per_page=12");
  });

  it("unwraps atlas:search_result envelope", async () => {
    const data = {
      total_results: 5,
      page: 1,
      per_page: 12,
      total_pages: 1,
      has_next: false,
      results: [{ event: { id: "1", title: "Test" } }],
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ "atlas:search_result": data }),
    });

    const result = await searchEvents({});
    expect(result.total_results).toBe(5);
    expect(result.results).toHaveLength(1);
  });

  it("skips undefined/empty params", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          "atlas:search_result": {
            total_results: 0,
            page: 1,
            per_page: 12,
            total_pages: 0,
            has_next: false,
            results: [],
          },
        }),
    });

    await searchEvents({ q: undefined, page: 1, categories: "" });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).not.toContain("q=");
    expect(url).not.toContain("categories=");
    expect(url).toContain("page=1");
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    await expect(searchEvents({})).rejects.toThrow("Registry API error: 500");
  });
});

describe("getStatsFallback", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("returns stats from search response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          "atlas:search_result": {
            total_results: 100,
            page: 1,
            per_page: 1,
            total_pages: 100,
            has_next: true,
            results: [],
            facets: {
              source_platforms: [
                { name: "lemonade", count: 50 },
                { name: "eventbrite", count: 50 },
              ],
            },
          },
        }),
    });

    const result = await getStatsFallback();
    expect(result.totalEvents).toBe(100);
    expect(result.platforms).toBe(2);
  });

  it("returns zeros on failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    const result = await getStatsFallback();
    expect(result.totalEvents).toBe(0);
    expect(result.platforms).toBe(0);
  });
});
