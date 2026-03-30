import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/server/auth";
import { LEMONADE_BACKEND_URL } from "@/lib/utils/constants";

const ME_QUERY = `query {
  getMe {
    _id
    username
    display_name
    image_avatar
    stripe_connected_account {
      account_id
      connected
    }
  }
}`;

export async function GET() {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  try {
    const res = await fetch(`${LEMONADE_BACKEND_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: ME_QUERY }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json({ user: null }, { status: 200 });
      }
      throw new Error(`GraphQL error: ${res.status}`);
    }

    const json = await res.json();
    const user = json?.data?.getMe ?? null;
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
