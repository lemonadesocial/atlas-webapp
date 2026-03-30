import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_LEMONADE_BACKEND_URL || "";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const url = `${BACKEND_URL}/atlas/v1/${path}${request.nextUrl.search}`;

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
    return NextResponse.json(
      { error: "Backend request failed" },
      { status: 502 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const url = `${BACKEND_URL}/atlas/v1/${path}`;

  try {
    const body = await request.text();
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
    return NextResponse.json(
      { error: "Backend request failed" },
      { status: 502 }
    );
  }
}
