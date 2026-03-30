import { NextRequest, NextResponse } from "next/server";
import { validatePathSegments } from "@/lib/utils/escape";

const BACKEND_URL = process.env.LEMONADE_BACKEND_URL || process.env.NEXT_PUBLIC_LEMONADE_BACKEND_URL || "";
const MAX_BODY_SIZE = 1024 * 1024; // 1MB

function reject(reason: string, status: number = 400) {
  return NextResponse.json({ error: reason }, { status });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  if (!validatePathSegments(segments)) {
    return reject("Invalid path");
  }

  const path = segments.join("/");
  const constructed = `/atlas/v1/${path}`;

  if (!constructed.startsWith("/atlas/v1/")) {
    return reject("Invalid path");
  }

  const url = `${BACKEND_URL}${constructed}${request.nextUrl.search}`;

  // TODO: Add rate limiting middleware or WAF for production (M3)
  try {
    const res = await fetch(url, {
      headers: {
        "Atlas-Agent-Id": "web:atlas-webapp",
        "Atlas-Version": "1.0",
      },
      signal: AbortSignal.timeout(10000),
    });

    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
      },
    });
  } catch {
    return reject("Backend request failed", 502);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  if (!validatePathSegments(segments)) {
    return reject("Invalid path");
  }

  const path = segments.join("/");
  const constructed = `/atlas/v1/${path}`;

  if (!constructed.startsWith("/atlas/v1/")) {
    return reject("Invalid path");
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    return reject("Request body too large", 413);
  }

  const url = `${BACKEND_URL}${constructed}`;

  try {
    const body = await request.text();
    if (body.length > MAX_BODY_SIZE) {
      return reject("Request body too large", 413);
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Atlas-Agent-Id": "web:atlas-webapp",
        "Atlas-Version": "1.0",
        "Content-Type": "application/json",
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
    return reject("Backend request failed", 502);
  }
}
