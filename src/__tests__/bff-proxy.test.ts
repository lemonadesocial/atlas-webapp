import { describe, it, expect } from "vitest";
import { validatePathSegments } from "@/lib/utils/escape";

describe("BFF proxy path validation", () => {
  it("allows valid atlas paths", () => {
    expect(validatePathSegments(["events", "abc123"])).toBe(true);
    expect(validatePathSegments(["events", "abc123", "tickets"])).toBe(true);
    expect(validatePathSegments(["holds", "hold-123", "checkout"])).toBe(true);
    expect(validatePathSegments(["receipts", "by-hold", "hold-123"])).toBe(true);
    expect(validatePathSegments(["search"])).toBe(true);
  });

  it("blocks directory traversal attacks", () => {
    expect(validatePathSegments(["..", "admin", "users"])).toBe(false);
    expect(validatePathSegments(["events", "..", "..", "admin"])).toBe(false);
    expect(validatePathSegments(["events", "..%2f..%2fadmin"])).toBe(false);
  });

  it("blocks encoded dot attacks", () => {
    expect(validatePathSegments(["%2e%2e"])).toBe(false);
    expect(validatePathSegments(["events", "test.json"])).toBe(false);
  });

  it("blocks paths with slashes in segments", () => {
    expect(validatePathSegments(["events/../../admin"])).toBe(false);
  });

  it("blocks empty segments", () => {
    expect(validatePathSegments([""])).toBe(false);
    expect(validatePathSegments(["events", ""])).toBe(false);
  });

  it("blocks segments with special characters", () => {
    expect(validatePathSegments(["events", "<script>"])).toBe(false);
    expect(validatePathSegments(["events", "id;drop"])).toBe(false);
    expect(validatePathSegments(["events", "id&param=val"])).toBe(false);
  });
});
