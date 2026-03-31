"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getItem, setItem } from "@/lib/utils/storage";
import { trackEvent } from "@/lib/utils/analytics";
import type { OnboardingState } from "@/lib/types/atlas";

const STORAGE_KEY = "atlas_onboard_state";

const DEFAULT_STATE: OnboardingState = {
  currentStep: 1,
};

// L2: Basic shape validation after parse
function isValidState(obj: unknown): obj is OnboardingState {
  if (typeof obj !== "object" || obj === null) return false;
  const record = obj as Record<string, unknown>;
  return typeof record.currentStep === "number" && record.currentStep >= 1;
}

export function loadState(): OnboardingState {
  const raw = getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_STATE;
  try {
    const parsed = JSON.parse(raw);
    return isValidState(parsed) ? parsed : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: OnboardingState): void {
  try {
    setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable
  }
}

// M4: Step prerequisite checks. Returns the correct redirect path
// if the user tries to skip ahead, or null if the current step is valid.
const STEP_PATHS = ["/onboard", "/onboard/space", "/onboard/stripe", "/onboard/connect", "/onboard/done"];

export function getStepRedirect(targetStep: number, state: OnboardingState): string | null {
  // Step 1: always allowed (sign in)
  if (targetStep <= 1) return null;
  // Step 2: needs auth (checked by component), always reachable
  if (targetStep === 2) return null;
  // Step 3: needs spaceId from step 2
  if (targetStep === 3 && !state.spaceId) return "/onboard/space";
  // Step 4: needs spaceId (step 3 can be skipped)
  if (targetStep === 4 && !state.spaceId) return "/onboard/space";
  // Step 5 (done): needs spaceId
  if (targetStep === 5 && !state.spaceId) return "/onboard/space";
  return null;
}

export function useOnboarding() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const updateState = useCallback(
    (updates: Partial<OnboardingState>) => {
      setState((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const goToStep = useCallback(
    (step: number) => {
      trackEvent("onboarding_step_complete", { step: step - 1 });
      updateState({ currentStep: step });
      router.push(STEP_PATHS[step - 1] || "/onboard");
    },
    [updateState, router]
  );

  const reset = useCallback(() => {
    setState(DEFAULT_STATE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { state, updateState, goToStep, reset };
}
