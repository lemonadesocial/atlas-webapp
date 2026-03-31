"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { useOnboarding, getStepRedirect } from "@/lib/hooks/useOnboarding";
import { trackEvent } from "@/lib/utils/analytics";
import { STRINGS, LEMONADE_APP_URL } from "@/lib/utils/constants";

export default function OnboardDone() {
  const { user, loading: authLoading } = useAuth();
  const { state, reset } = useOnboarding();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/onboard");
      return;
    }
    // M4: Guard against skipping steps
    const redirect = getStepRedirect(5, state);
    if (redirect) {
      router.replace(redirect);
      return;
    }
    // Track onboarding funnel completion (US-NF.20)
    if (user && !redirect) {
      trackEvent("onboarding_funnel_complete", {
        platforms: (state.connectedPlatforms ?? []).join(","),
        event_count: state.importedEventCount ?? 0,
        stripe_connected: !!state.stripeConnected,
      });
    }
  }, [user, authLoading, router, state]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" role="status" aria-label="Loading" />
      </div>
    );
  }

  const platforms = state.connectedPlatforms ?? [];
  const eventCount = state.importedEventCount ?? 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="flex flex-col items-center gap-6 rounded-lg border border-divider bg-card p-8 text-center">
        {/* TODO: Add CSS confetti animation (M13 - US-4.30) */}
        {/* Celebration icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10" aria-hidden="true">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-success"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-primary font-display">
          {STRINGS.onboardDoneTitle}
        </h1>

        {/* Summary */}
        <div className="flex flex-col gap-2 text-sm text-secondary">
          {state.spaceName && (
            <p>
              Space: <span className="font-medium text-primary">{state.spaceName}</span>
            </p>
          )}
          {state.stripeConnected && (
            <p className="flex items-center justify-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Stripe connected
            </p>
          )}
          {platforms.length > 0 && (
            <p>
              Platforms: <span className="font-medium text-primary">{platforms.join(", ")}</span>
            </p>
          )}
          {eventCount > 0 && (
            <p>
              Events imported: <span className="font-medium text-primary">{eventCount}</span>
            </p>
          )}
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={state.spaceId ? `/discover?space=${state.spaceId}` : "/discover"}
            onClick={() => reset()}
            className="rounded-md bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            {STRINGS.viewYourEvents}
          </Link>
          <a
            href={`${LEMONADE_APP_URL}/dashboard`}
            className="rounded-md border border-divider px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-btn-tertiary"
          >
            {STRINGS.goToDashboard}
          </a>
        </div>
      </div>
    </div>
  );
}
