"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import type { AuthUser } from "@/lib/types/atlas";

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

export function useAuthProvider(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const signIn = useCallback((returnTo?: string) => {
    const clientId = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || "atlas-webapp";
    const authority = process.env.NEXT_PUBLIC_OAUTH_AUTHORITY || "";
    const redirectUri = `${window.location.origin}/api/auth/callback`;
    const state = returnTo || window.location.pathname;
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "openid offline_access",
      state,
    });
    window.location.href = `${authority}/oauth2/auth?${params.toString()}`;
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      if (res.ok) {
        await fetchMe();
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, [fetchMe]);

  return { user, loading, signIn, signOut, refresh };
}
