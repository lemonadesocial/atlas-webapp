import "server-only";

import { cookies } from "next/headers";
import crypto from "crypto";
import {
  OAUTH_AUTHORITY,
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
} from "@/lib/server/config";

export const AUTH_COOKIE_NAME = "atlas_session";
export const REFRESH_COOKIE_NAME = "atlas_refresh";
export const OAUTH_STATE_COOKIE = "atlas_oauth_state";
export const PKCE_COOKIE = "atlas_pkce";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

// --- PKCE helpers (C1) ---

function base64urlEncode(buffer: Buffer): string {
  return buffer.toString("base64url");
}

export function generateCodeVerifier(): string {
  return base64urlEncode(crypto.randomBytes(32));
}

export function generateCodeChallenge(verifier: string): string {
  const hash = crypto.createHash("sha256").update(verifier).digest();
  return base64urlEncode(hash);
}

// --- CSRF state (H1) ---

export function generateStateToken(): string {
  return base64urlEncode(crypto.randomBytes(32));
}

/**
 * Validates that a return path is safe (no open redirect).
 * Must start with "/" and must not contain "://" or "//".
 */
export function isValidReturnPath(path: string): boolean {
  if (!path.startsWith("/")) return false;
  if (path.includes("://")) return false;
  if (path.startsWith("//")) return false;
  return true;
}

// --- Cookie management ---

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_COOKIE_NAME)?.value ?? null;
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);
}

// --- Token exchange ---

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
  codeVerifier: string
) {
  const tokenUrl = `${OAUTH_AUTHORITY}/oauth2/token`;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: OAUTH_CLIENT_ID,
    client_secret: OAUTH_CLIENT_SECRET,
    code_verifier: codeVerifier,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  }>;
}

export async function refreshAccessToken(refreshToken: string) {
  const tokenUrl = `${OAUTH_AUTHORITY}/oauth2/token`;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: OAUTH_CLIENT_ID,
    client_secret: OAUTH_CLIENT_SECRET,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`Token refresh failed: ${res.status}`);
  }

  return res.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }>;
}
