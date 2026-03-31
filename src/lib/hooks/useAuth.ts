"use client";

import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import type { AuthUser } from "@/lib/types/atlas";
import { LEMONADE_BACKEND_URL } from "@/lib/utils/constants";

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  signIn: (returnTo?: string) => void;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  signIn: () => {},
  signOut: async () => {},
  refresh: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext };

// L10: Simple cache to avoid fetching me on every navigation
const ME_CACHE_TTL = 60_000; // 1 minute
let meCache: { user: AuthUser | null; ts: number } | null = null;

const ME_QUERY = `query { aiGetMe { _id username display_name image_avatar stripe_connected_account { account_id connected } } }`;

export function useAuthProvider(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);

  const fetchMe = useCallback(async (skipCache = false) => {
    if (fetchingRef.current) return;
    if (!skipCache && meCache && Date.now() - meCache.ts < ME_CACHE_TTL) {
      setUser(meCache.user);
      setLoading(false);
      return;
    }
    fetchingRef.current = true;
    try {
      const res = await fetch(`${LEMONADE_BACKEND_URL}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ query: ME_QUERY }),
      });
      if (!res.ok) {
        setUser(null);
        meCache = { user: null, ts: Date.now() };
        return;
      }
      const json = await res.json();
      const fetched = json?.data?.aiGetMe ?? null;
      meCache = { user: fetched, ts: Date.now() };
      setUser(fetched);
    } catch {
      setUser(null);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // C1 + H1: Redirect to server-side /api/auth/start which generates PKCE + CSRF
  const signIn = useCallback((returnTo?: string) => {
    const path = returnTo || window.location.pathname;
    window.location.href = `/api/auth/start?return_to=${encodeURIComponent(path)}`;
  }, []);

  const signOut = useCallback(async () => {
    meCache = null;
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      if (res.ok) {
        await fetchMe(true);
      } else {
        meCache = null;
        setUser(null);
      }
    } catch {
      meCache = null;
      setUser(null);
    }
  }, [fetchMe]);

  return { user, loading, signIn, signOut, refresh };
}
