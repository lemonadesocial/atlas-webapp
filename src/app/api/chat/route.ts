import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/server/auth";
import { LEMONADE_AI_URL } from "@/lib/server/config";

const MAX_BODY_SIZE = 64 * 1024; // 64KB for chat messages
const CHAT_TIMEOUT = 60_000; // 60s for streaming responses

export async function POST(request: NextRequest) {
  if (!LEMONADE_AI_URL) {
    return NextResponse.json(
      { error: "Chat service not configured" },
      { status: 503 }
    );
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (body.length > MAX_BODY_SIZE) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  let parsed: { message?: string; session_id?: string };
  try {
    parsed = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!parsed.message || typeof parsed.message !== "string") {
    return NextResponse.json(
      { error: "Missing required field: message" },
      { status: 400 }
    );
  }

  const token = await getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${LEMONADE_AI_URL}/api/chat`, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(CHAT_TIMEOUT),
    });

    if (!res.ok && !res.body) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: errorText || "Chat service error" },
        { status: res.status }
      );
    }

    // Stream the response back to the client
    if (res.body) {
      return new NextResponse(res.body, {
        status: res.status,
        headers: {
          "Content-Type": res.headers.get("Content-Type") || "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const responseBody = await res.text();
    return new NextResponse(responseBody, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      return NextResponse.json(
        { error: "Chat service timeout" },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "Chat service unavailable" },
      { status: 502 }
    );
  }
}
