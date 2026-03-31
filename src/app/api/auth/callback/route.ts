import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeCodeForTokens,
  isValidReturnPath,
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  OAUTH_STATE_COOKIE,
  PKCE_COOKIE,
} from "@/lib/server/auth";
import { SITE_URL } from "@/lib/utils/constants";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

function errorRedirect(message: string): NextResponse {
  return NextResponse.redirect(
    `${SITE_URL}/callback?error=${encodeURIComponent(message)}`
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const incomingState = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    const errorDesc = searchParams.get("error_description") || error;
    return errorRedirect(errorDesc);
  }

  if (!code) {
    return errorRedirect("Missing authorization code");
  }

  // H1: Validate CSRF state token
  const cookieStore = await cookies();
  const storedOAuthState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  if (!storedOAuthState || !incomingState) {
    return errorRedirect("Invalid state parameter");
  }

  // State cookie format: "stateToken:returnPath"
  const separatorIdx = storedOAuthState.indexOf(":");
  const expectedToken = separatorIdx >= 0
    ? storedOAuthState.slice(0, separatorIdx)
    : storedOAuthState;
  const returnPath = separatorIdx >= 0
    ? storedOAuthState.slice(separatorIdx + 1)
    : "/";

  if (incomingState !== expectedToken) {
    return errorRedirect("State mismatch - possible CSRF attack");
  }

  // C1: Retrieve PKCE code_verifier from cookie
  const codeVerifier = cookieStore.get(PKCE_COOKIE)?.value;
  if (!codeVerifier) {
    return errorRedirect("Missing PKCE verifier");
  }

  const redirectUri = `${SITE_URL}/api/auth/callback`;

  try {
    const tokens = await exchangeCodeForTokens(code, redirectUri, codeVerifier);

    // H2: Set cookies on the redirect response object directly
    const safeReturn = isValidReturnPath(returnPath) ? returnPath : "/";
    const response = NextResponse.redirect(`${SITE_URL}${safeReturn}`);

    response.cookies.set(AUTH_COOKIE_NAME, tokens.access_token, {
      ...COOKIE_OPTIONS,
      maxAge: tokens.expires_in,
    });
    response.cookies.set(REFRESH_COOKIE_NAME, tokens.refresh_token, {
      ...COOKIE_OPTIONS,
      // Refresh token lives 30 days. Server-controlled; Hydra may enforce a shorter lifetime.
      maxAge: 60 * 60 * 24 * 30,
    });

    // Clean up OAuth flow cookies
    response.cookies.delete(OAUTH_STATE_COOKIE);
    response.cookies.delete(PKCE_COOKIE);

    return response;
  } catch (err) {
    // H5: Sanitize error logging - only log message, not full error object
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Token exchange error:", message);
    return errorRedirect("Token exchange failed");
  }
}
