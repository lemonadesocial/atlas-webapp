"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { STRINGS } from "@/lib/utils/constants";
import { useAuth } from "@/lib/hooks/useAuth";
import { Suspense } from "react";

function CallbackContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const { signIn } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      if (error === "access_denied" || error.includes("declined")) {
        setErrorMessage(STRINGS.signInDenied);
      } else if (error.includes("unreachable") || error.includes("connect")) {
        setErrorMessage(STRINGS.signInUnavailable);
      } else {
        setErrorMessage(STRINGS.signInFailed);
      }
    }
  }, [error]);

  if (errorMessage) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10"
          aria-hidden="true"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-danger"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-primary">{STRINGS.signInFailed}</h1>
        <p className="max-w-md text-center text-sm text-secondary">
          {errorMessage}
        </p>
        <button
          onClick={() => signIn()}
          className="rounded-md bg-btn-secondary px-6 py-2 text-sm font-medium text-btn-secondary-content transition-colors hover:bg-btn-secondary-hover"
        >
          {STRINGS.retry}
        </button>
      </div>
    );
  }

  // Loading state while the API route processes the code exchange
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent"
        role="status"
        aria-label={STRINGS.signingIn}
      />
      <p className="text-sm text-secondary">{STRINGS.signingIn}</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent"
            role="status"
            aria-label={STRINGS.signingIn}
          />
          <p className="text-sm text-secondary">{STRINGS.signingIn}</p>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
