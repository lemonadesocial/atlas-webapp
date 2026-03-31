import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock server-side modules before any imports that use them
vi.mock("@/lib/server/auth", () => ({
  getAccessToken: vi.fn(),
}));

vi.mock("@/lib/server/config", () => ({
  LEMONADE_AI_URL: "http://ai.test:4001",
}));

import { POST } from "@/app/api/chat/route";
import { NextRequest } from "next/server";
import { getAccessToken } from "@/lib/server/auth";

const mockedGetAccessToken = vi.mocked(getAccessToken);

function makeRequest(body: unknown, headers?: Record<string, string>): NextRequest {
  return new NextRequest("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
  mockedGetAccessToken.mockResolvedValue(null);
});

describe("POST /api/chat", () => {
  it("rejects requests without message field", async () => {
    const res = await POST(makeRequest({ session_id: "abc" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Missing required field: message");
  });

  it("rejects invalid JSON", async () => {
    const req = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid JSON");
  });

  it("rejects oversized requests", async () => {
    const bigMessage = "a".repeat(65 * 1024);
    const res = await POST(makeRequest({ message: bigMessage }));
    expect(res.status).toBe(413);
  });

  it("forwards auth token when present", async () => {
    mockedGetAccessToken.mockResolvedValue("test-token");

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ text: "hello" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    await POST(makeRequest({ message: "test" }));

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://ai.test:4001/api/chat",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      })
    );
  });

  it("proxies without auth when not authenticated", async () => {
    mockedGetAccessToken.mockResolvedValue(null);

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ text: "hello" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    await POST(makeRequest({ message: "find events" }));

    const calledHeaders = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(calledHeaders).not.toHaveProperty("Authorization");
  });

  it("streams response body through to client", async () => {
    mockedGetAccessToken.mockResolvedValue(null);

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"type":"text_delta","text":"hi"}\n\n'));
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(stream, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      })
    );

    const res = await POST(makeRequest({ message: "hello" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/event-stream");
  });

  it("returns 502 on fetch failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network error"));
    const res = await POST(makeRequest({ message: "test" }));
    expect(res.status).toBe(502);
  });

  it("returns 504 on timeout", async () => {
    const err = new DOMException("Timeout", "TimeoutError");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(err);
    const res = await POST(makeRequest({ message: "test" }));
    expect(res.status).toBe(504);
  });
});
