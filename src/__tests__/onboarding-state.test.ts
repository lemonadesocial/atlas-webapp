import { describe, it, expect, beforeEach } from "vitest";
import type { OnboardingState } from "@/lib/types/atlas";

const STORAGE_KEY = "atlas_onboard_state";

function loadState(): OnboardingState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { currentStep: 1 };
  try {
    return JSON.parse(raw) as OnboardingState;
  } catch {
    return { currentStep: 1 };
  }
}

function saveState(state: OnboardingState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

describe("Onboarding state persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns default state when nothing is stored", () => {
    const state = loadState();
    expect(state.currentStep).toBe(1);
    expect(state.spaceId).toBeUndefined();
  });

  it("persists and retrieves state", () => {
    const state: OnboardingState = {
      currentStep: 3,
      spaceId: "space123",
      spaceName: "My Space",
      stripeConnected: true,
    };
    saveState(state);
    const loaded = loadState();
    expect(loaded.currentStep).toBe(3);
    expect(loaded.spaceId).toBe("space123");
    expect(loaded.spaceName).toBe("My Space");
    expect(loaded.stripeConnected).toBe(true);
  });

  it("handles corrupted localStorage data", () => {
    localStorage.setItem(STORAGE_KEY, "not valid json {{{");
    const state = loadState();
    expect(state.currentStep).toBe(1);
  });

  it("preserves all fields on round-trip", () => {
    const state: OnboardingState = {
      currentStep: 5,
      spaceId: "sp_1",
      spaceName: "Test Space",
      stripeConnected: true,
      stripeSkipped: false,
      connectedPlatforms: ["Eventbrite", "Lu.ma"],
      importedEventCount: 42,
    };
    saveState(state);
    const loaded = loadState();
    expect(loaded).toEqual(state);
  });

  it("overwrites previous state", () => {
    saveState({ currentStep: 2, spaceId: "old" });
    saveState({ currentStep: 4, spaceId: "new", stripeConnected: true });
    const loaded = loadState();
    expect(loaded.spaceId).toBe("new");
    expect(loaded.currentStep).toBe(4);
  });
});
