"use client";

import { useAuth } from "@/lib/hooks/useAuth";

export function AuthPrompt() {
  const { signIn } = useAuth();

  return (
    <div className="mx-4 rounded-lg border border-divider bg-card p-4 text-center">
      <p className="text-sm text-secondary">
        Sign in to manage events, view ticket sales, and more.
      </p>
      <button
        onClick={() => signIn("/chat")}
        className="mt-3 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        aria-label="Sign in for full chat access"
      >
        Sign In
      </button>
    </div>
  );
}
