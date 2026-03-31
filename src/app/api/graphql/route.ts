import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/server/auth";
import { LEMONADE_BACKEND_URL } from "@/lib/server/config";

// TODO: Add rate limiting (M3)
// TODO: Add query allowlisting - backend enforces authorization for now (M2)
const MAX_BODY_SIZE = 1024 * 1024; // 1MB

export async function POST(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  try {
    const body = await request.text();
    if (body.length > MAX_BODY_SIZE) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

    const res = await fetch(`${LEMONADE_BACKEND_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body,
      signal: AbortSignal.timeout(10000),
    });

    const responseBody = await res.text();
    return new NextResponse(responseBody, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Backend request failed" },
      { status: 502 }
    );
  }
}
