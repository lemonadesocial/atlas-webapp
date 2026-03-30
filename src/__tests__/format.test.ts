import { describe, it, expect } from "vitest";
import {
  formatPrice,
  formatDate,
  formatPriceRange,
  getDateRange,
  timeUntil,
} from "@/lib/utils/format";

describe("formatPrice", () => {
  it("returns Free for undefined", () => {
    expect(formatPrice(undefined)).toBe("Free");
  });

  it("returns Free for 0", () => {
    expect(formatPrice(0)).toBe("Free");
  });

  it("formats USD amount", () => {
    expect(formatPrice(25, "USD")).toBe("$25");
  });

  it("formats EUR amount", () => {
    const result = formatPrice(10.5, "EUR");
    expect(result).toContain("10.5");
  });

  it("formats fractional amounts", () => {
    expect(formatPrice(9.99, "USD")).toBe("$9.99");
  });
});

describe("formatDate", () => {
  it("formats ISO date string", () => {
    const result = formatDate("2026-06-15T20:00:00Z");
    expect(result).toContain("Jun");
    // Date may vary by timezone
    expect(result).toMatch(/\d+/);
  });

  it("includes time component", () => {
    const result = formatDate("2026-06-15T20:00:00Z");
    // Should contain some time representation
    expect(result.length).toBeGreaterThan(5);
  });
});

describe("formatPriceRange", () => {
  it("returns Free when both undefined", () => {
    expect(formatPriceRange(undefined, undefined)).toBe("Free");
  });

  it("returns Free when both zero", () => {
    expect(formatPriceRange(0, 0)).toBe("Free");
  });

  it("returns single price when min equals max", () => {
    expect(formatPriceRange(25, 25, "USD")).toBe("$25");
  });

  it("returns range when min differs from max", () => {
    const result = formatPriceRange(10, 50, "USD");
    expect(result).toContain("$10");
    expect(result).toContain("$50");
    expect(result).toContain("-");
  });
});

describe("getDateRange", () => {
  it("returns empty object for empty filter", () => {
    expect(getDateRange("")).toEqual({});
  });

  it("returns today range", () => {
    const result = getDateRange("today");
    expect(result.date_from).toBeDefined();
    expect(result.date_to).toBeDefined();
    const from = new Date(result.date_from!);
    const to = new Date(result.date_to!);
    expect(to.getTime() - from.getTime()).toBe(86400000);
  });

  it("returns week range", () => {
    const result = getDateRange("week");
    expect(result.date_from).toBeDefined();
    expect(result.date_to).toBeDefined();
    const from = new Date(result.date_from!);
    const to = new Date(result.date_to!);
    expect(to.getTime() - from.getTime()).toBe(7 * 86400000);
  });

  it("returns month range", () => {
    const result = getDateRange("month");
    expect(result.date_from).toBeDefined();
    expect(result.date_to).toBeDefined();
  });

  it("returns weekend range", () => {
    const result = getDateRange("weekend");
    expect(result.date_from).toBeDefined();
    expect(result.date_to).toBeDefined();
  });
});

describe("timeUntil", () => {
  it("returns Expired for past dates", () => {
    expect(timeUntil("2020-01-01T00:00:00Z")).toBe("Expired");
  });

  it("returns formatted time for future dates", () => {
    const future = new Date(Date.now() + 120000).toISOString();
    const result = timeUntil(future);
    expect(result).toMatch(/\d+:\d{2}/);
  });
});
