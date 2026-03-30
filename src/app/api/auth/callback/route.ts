import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  setAuthCookies,
} from "@/lib/server/auth";
import { SITE_URL } from "@/lib/utils/constants";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    const errorDesc = searchParams.get("error_description") || error;
    return NextResponse.redirect(
      `${SITE_URL}/callback?error=${encodeURIComponent(errorDesc)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${SITE_URL}/callback?error=${encodeURIComponent("Missing authorization code")}`
    );
  }

  const redirectUri = `${SITE_URL}/api/auth/callback`;

  try {
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    await setAuthCookies(
      tokens.access_token,
      tokens.refresh_token,
      tokens.expires_in
    );

    // Redirect to the page the user came from, or home
    const returnTo = state || "/";
    return NextResponse.redirect(`${SITE_URL}${returnTo}`);
  } catch (err) {
    console.error("Token exchange error:", err);
    return NextResponse.redirect(
      `${SITE_URL}/callback?error=${encodeURIComponent("Token exchange failed")}`
    );
  }
}
