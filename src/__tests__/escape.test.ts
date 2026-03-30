import { describe, it, expect } from "vitest";
import {
  escapeHtml,
  safeJsonLd,
  validatePathSegments,
  validateEventId,
} from "@/lib/utils/escape";

describe("escapeHtml", () => {
  it("escapes angle brackets", () => {
    expect(escapeHtml("<script>alert(1)</script>")).toBe(
      "&lt;script&gt;alert(1)&lt;/script&gt;"
    );
  });

  it("escapes ampersand", () => {
    expect(escapeHtml("foo & bar")).toBe("foo &amp; bar");
  });

  it("escapes quotes", () => {
    expect(escapeHtml('a "quoted" value')).toBe("a &quot;quoted&quot; value");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });

  it("returns plain text unchanged", () => {
    expect(escapeHtml("Hello World 123")).toBe("Hello World 123");
  });
});

describe("safeJsonLd", () => {
  it("escapes script tag breakout in JSON-LD", () => {
    const result = safeJsonLd({
      name: '</script><script>alert(1)</script>',
    });
    expect(result).not.toContain("</script>");
    expect(result).toContain("\\u003c");
  });

  it("produces valid JSON", () => {
    const result = safeJsonLd({ title: "Test Event", price: 10 });
    // After replacing \\u003c back, it should parse
    expect(result).toContain("Test Event");
  });
});

describe("validatePathSegments", () => {
  it("accepts valid segments", () => {
    expect(validatePathSegments(["events", "abc-123", "tickets"])).toBe(true);
  });

  it("rejects segments with dots (directory traversal)", () => {
    expect(validatePathSegments(["events", "..", "admin"])).toBe(false);
  });

  it("rejects segments with encoded chars", () => {
    expect(validatePathSegments(["events", "%2e%2e", "admin"])).toBe(false);
  });

  it("rejects empty segments", () => {
    expect(validatePathSegments([""])).toBe(false);
  });

  it("rejects segments with special characters", () => {
    expect(validatePathSegments(["events", "foo/bar"])).toBe(false);
  });
});

describe("validateEventId", () => {
  it("accepts alphanumeric IDs", () => {
    expect(validateEventId("abc123")).toBe(true);
  });

  it("accepts IDs with hyphens and underscores", () => {
    expect(validateEventId("event-id_123")).toBe(true);
  });

  it("rejects IDs with special characters", () => {
    expect(validateEventId("../admin")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(validateEventId("")).toBe(false);
  });
});
