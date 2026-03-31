import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getRefreshToken,
  refreshAccessToken,
  clearAuthCookies,
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} from "@/lib/server/auth";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function POST() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  try {
    const tokens = await refreshAccessToken(refreshToken);
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, tokens.access_token, {
      ...COOKIE_OPTIONS,
      maxAge: tokens.expires_in,
    });
    cookieStore.set(REFRESH_COOKIE_NAME, tokens.refresh_token, {
      ...COOKIE_OPTIONS,
      // Refresh token lives 30 days (L1)
      maxAge: 60 * 60 * 24 * 30,
    });
    return NextResponse.json({ ok: true });
  } catch {
    await clearAuthCookies();
    return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
  }
}
