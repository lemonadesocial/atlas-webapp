"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { STRINGS } from "@/lib/utils/constants";
import { OnboardLayout } from "@/components/onboard/OnboardLayout";

export default function OnboardStep1() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/onboard/space");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (user) {
    return null; // will redirect
  }

  return (
    <OnboardLayout
      step={1}
      title={STRINGS.onboardStep1Title}
      description={STRINGS.onboardStep1Desc}
    >
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => signIn("/onboard/space")}
          className="w-full rounded-md bg-btn-secondary px-6 py-3 text-sm font-medium text-btn-secondary-content transition-colors hover:bg-btn-secondary-hover sm:w-auto"
        >
          {STRINGS.signInWithLemonade}
        </button>
        <p className="text-xs text-tertiary">
          New to Lemonade? You can create an account during sign in.
        </p>
      </div>
    </OnboardLayout>
  );
}
