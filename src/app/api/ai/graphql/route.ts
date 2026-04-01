import { NextRequest } from "next/server";

const AI_API_URL = process.env.AI_API_HTTP || process.env.NEXT_PUBLIC_AI_API_HTTP;

export async function POST(request: NextRequest) {
  if (!AI_API_URL) {
    return Response.json({ error: "AI API URL is not configured." }, { status: 500 });
  }

  try {
    const body = await request.text();
    const headers = new Headers();

    for (const name of ["authorization", "content-type", "accept"]) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }

    const res = await fetch(AI_API_URL, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    const contentType = res.headers.get("content-type");
    if (contentType) responseHeaders.set("content-type", contentType);

    return new Response(res.body, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch {
    return Response.json({ error: "AI proxy request failed." }, { status: 502 });
  }
}
