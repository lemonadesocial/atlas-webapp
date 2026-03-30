"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useOnboarding, getStepRedirect } from "@/lib/hooks/useOnboarding";
import { graphqlRequest } from "@/lib/services/graphql-client";
import { STRINGS, SITE_URL } from "@/lib/utils/constants";
import { OnboardLayout } from "@/components/onboard/OnboardLayout";
import { Suspense } from "react";

const STRIPE_LINK_MUTATION = `mutation($return_url: String!, $refresh_url: String!) {
  generateStripeAccountLink(return_url: $return_url, refresh_url: $refresh_url) { url expires_at }
}`;

const STRIPE_STATUS_QUERY = `query {
  aiGetMe { stripe_connected_account { account_id connected } }
}`;

function StripeContent() {
  const { user, loading: authLoading } = useAuth();
  const { state, updateState, goToStep } = useOnboarding();
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  const [checking, setChecking] = useState(false);
  const [stripeConnected, setStripeConnected] = useState(state.stripeConnected ?? false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/onboard");
      return;
    }
    // M4: Guard against skipping steps
    const redirect = getStepRedirect(3, state);
    if (redirect) {
      router.replace(redirect);
    }
  }, [user, authLoading, router, state]);

  // Check initial Stripe status
  useEffect(() => {
    if (!user) return;
    setChecking(true);
    graphqlRequest<{
      aiGetMe: { stripe_connected_account?: { account_id: string; connected: boolean } };
    }>(STRIPE_STATUS_QUERY)
      .then((res) => {
        const connected = res.data?.aiGetMe?.stripe_connected_account?.connected ?? false;
        setStripeConnected(connected);
        if (connected) {
          updateState({ stripeConnected: true });
        }
      })
      .catch(() => {
        setError("Failed to check Stripe status. Please try again.");
      })
      .finally(() => setChecking(false));
  }, [user, updateState]);

  // Poll after returning from Stripe with ?status=complete
  const pollStripeStatus = useCallback(() => {
    if (pollRef.current) return;
    pollCountRef.current = 0;
    pollRef.current = setInterval(async () => {
      pollCountRef.current += 1;
      if (pollCountRef.current > 10) {
        // 30s at 3s intervals
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
        setError(STRINGS.stripeNotCompleted);
        setConnecting(false);
        return;
      }
      try {
        const res = await graphqlRequest<{
          aiGetMe: { stripe_connected_account?: { connected: boolean } };
        }>(STRIPE_STATUS_QUERY);
        const connected = res.data?.aiGetMe?.stripe_connected_account?.connected ?? false;
        if (connected) {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setStripeConnected(true);
          setConnecting(false);
          updateState({ stripeConnected: true });
        }
      } catch {
        // continue polling
      }
    }, 3000);
  }, [updateState]);

  useEffect(() => {
    if (status === "complete") {
      setConnecting(true);
      pollStripeStatus();
    } else if (status === "refresh") {
      setError(STRINGS.stripeNotCompleted);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [status, pollStripeStatus]);

  const handleConnectStripe = async () => {
    setError(null);
    setConnecting(true);
    try {
      const returnUrl = `${SITE_URL}/onboard/stripe?status=complete`;
      const refreshUrl = `${SITE_URL}/onboard/stripe?status=refresh`;
      const res = await graphqlRequest<{
        generateStripeAccountLink: { url: string; expires_at: string };
      }>(STRIPE_LINK_MUTATION, {
        return_url: returnUrl,
        refresh_url: refreshUrl,
      });
      const url = res.data?.generateStripeAccountLink?.url;
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No Stripe URL returned");
      }
    } catch {
      setError("Failed to start Stripe connection. Please try again.");
      setConnecting(false);
    }
  };

  const handleContinue = () => {
    updateState({ currentStep: 4 });
    goToStep(4);
  };

  const handleSkip = () => {
    updateState({ currentStep: 4, stripeSkipped: true });
    goToStep(4);
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" role="status" aria-label="Loading" />
      </div>
    );
  }

  return (
    <OnboardLayout
      step={3}
      title={STRINGS.onboardStep3Title}
      description={STRINGS.onboardStep3Desc}
      onBack={() => goToStep(2)}
    >
      {checking ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" role="status" aria-label="Checking Stripe status" />
        </div>
      ) : stripeConnected ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-sm font-medium text-success">{STRINGS.stripeConnected}</p>
          <button
            onClick={handleContinue}
            className="mt-2 w-full rounded-md bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Continue
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-4">
          {connecting ? (
            <>
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" role="status" aria-label={STRINGS.verifyingStripe} />
              <p className="text-sm text-secondary">{STRINGS.verifyingStripe}</p>
            </>
          ) : (
            <>
              <p className="text-center text-sm text-secondary">
                Connect your Stripe account to accept payments for your events. You can skip this step if you only plan to host free events.
              </p>
              {error && (
                <p className="text-sm text-danger">{error}</p>
              )}
              <button
                onClick={handleConnectStripe}
                className="w-full rounded-md bg-btn-secondary px-6 py-3 text-sm font-medium text-btn-secondary-content transition-colors hover:bg-btn-secondary-hover sm:w-auto"
              >
                {STRINGS.connectStripe}
              </button>
              <button
                onClick={handleSkip}
                className="text-sm text-tertiary transition-colors hover:text-secondary"
              >
                {STRINGS.skipForNow}
              </button>
            </>
          )}
        </div>
      )}
    </OnboardLayout>
  );
}

export default function OnboardStep3() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" role="status" aria-label="Loading" />
        </div>
      }
    >
      <StripeContent />
    </Suspense>
  );
}
