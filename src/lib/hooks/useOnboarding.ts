"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getItem, setItem } from "@/lib/utils/storage";
import type { OnboardingState } from "@/lib/types/atlas";

const STORAGE_KEY = "atlas_onboard_state";

const DEFAULT_STATE: OnboardingState = {
  currentStep: 1,
};

function loadState(): OnboardingState {
  const raw = getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_STATE;
  try {
    return JSON.parse(raw) as OnboardingState;
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: OnboardingState): void {
  try {
    setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable
  }
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
      updateState({ currentStep: step });
      const paths = ["/onboard", "/onboard/space", "/onboard/stripe", "/onboard/connect", "/onboard/done"];
      router.push(paths[step - 1] || "/onboard");
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
