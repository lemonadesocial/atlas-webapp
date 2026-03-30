"use client";

import { useCookieConsent } from "@/lib/hooks/useCookieConsent";
import { Button } from "@/components/ui/Button";
import { STRINGS } from "@/lib/utils/constants";
import Link from "next/link";

export function CookieConsent() {
  const { consent, loaded, accept, reject } = useCookieConsent();

  if (!loaded || consent !== "undecided") return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-divider bg-overlay-primary p-4 shadow-lg"
      role="alert"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-secondary">
          {STRINGS.cookieMessage}{" "}
          <Link
            href="/privacy"
            className="text-accent underline hover:text-accent-hover"
          >
            {STRINGS.privacyPolicy}
          </Link>
        </p>
        <div className="flex gap-2">
          <Button variant="tertiary" size="sm" onClick={reject}>
            {STRINGS.cookieReject}
          </Button>
          <Button variant="secondary" size="sm" onClick={accept}>
            {STRINGS.cookieAccept}
          </Button>
        </div>
      </div>
    </div>
  );
}
