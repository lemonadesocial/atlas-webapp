import { NextRequest, NextResponse } from "next/server";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateStateToken,
  isValidReturnPath,
  OAUTH_STATE_COOKIE,
  PKCE_COOKIE,
} from "@/lib/server/auth";
import { OAUTH_CLIENT_ID, OAUTH_AUTHORITY } from "@/lib/server/config";
import { SITE_URL } from "@/lib/utils/constants";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 600, // 10 minutes - OAuth flow should complete within this
};

export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get("return_to") || "/";
  const safeReturn = isValidReturnPath(returnTo) ? returnTo : "/";

  // C1: Generate PKCE pair
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // H1: Generate CSRF state token
  const stateToken = generateStateToken();

  const redirectUri = `${SITE_URL}/api/auth/callback`;
  const params = new URLSearchParams({
    response_type: "code",
    client_id: OAUTH_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "openid offline_access",
    state: stateToken,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const authorizeUrl = `${OAUTH_AUTHORITY}/oauth2/auth?${params.toString()}`;
  const response = NextResponse.redirect(authorizeUrl);

  // Store state token + return path, and PKCE verifier in httpOnly cookies
  response.cookies.set(OAUTH_STATE_COOKIE, `${stateToken}:${safeReturn}`, COOKIE_OPTIONS);
  response.cookies.set(PKCE_COOKIE, codeVerifier, COOKIE_OPTIONS);

  return response;
}
