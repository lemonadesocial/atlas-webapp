import { cookies } from "next/headers";
import {
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  OAUTH_AUTHORITY,
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  LEMONADE_BACKEND_URL,
} from "@/lib/utils/constants";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  expiresIn: number
) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: expiresIn,
  });
  cookieStore.set(REFRESH_COOKIE_NAME, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_COOKIE_NAME)?.value ?? null;
}

export async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const tokenUrl = `${OAUTH_AUTHORITY}/oauth2/token`;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
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

export async function proxyGraphQL(
  query: string,
  variables?: Record<string, unknown>
) {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${LEMONADE_BACKEND_URL}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`GraphQL proxy error: ${res.status}`);
  }

  return res.json();
}

export function buildAuthorizeUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: OAUTH_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "openid offline_access",
    state,
  });
  return `${OAUTH_AUTHORITY}/oauth2/auth?${params.toString()}`;
}
