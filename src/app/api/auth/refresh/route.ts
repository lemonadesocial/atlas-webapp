import { NextResponse } from "next/server";
import {
  getRefreshToken,
  refreshAccessToken,
  setAuthCookies,
  clearAuthCookies,
} from "@/lib/server/auth";

export async function POST() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  try {
    const tokens = await refreshAccessToken(refreshToken);
    await setAuthCookies(
      tokens.access_token,
      tokens.refresh_token,
      tokens.expires_in
    );
    return NextResponse.json({ ok: true });
  } catch {
    await clearAuthCookies();
    return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
  }
}
