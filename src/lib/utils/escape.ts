const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (ch) => HTML_ENTITIES[ch]);
}

export function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

const SAFE_PATH_SEGMENT = /^[a-zA-Z0-9_-]+$/;

export function validatePathSegments(segments: string[]): boolean {
  return segments.every(
    (seg) => SAFE_PATH_SEGMENT.test(seg) && !seg.includes(".")
  );
}

export function validateEventId(id: string): boolean {
  return SAFE_PATH_SEGMENT.test(id);
}
