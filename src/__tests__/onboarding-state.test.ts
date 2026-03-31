import { describe, it, expect, beforeEach } from "vitest";
import { loadState, saveState, getStepRedirect } from "@/lib/hooks/useOnboarding";
import type { OnboardingState } from "@/lib/types/atlas";

describe("Onboarding state persistence (via actual exports)", () => {
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
    localStorage.setItem("atlas_onboard_state", "not valid json {{{");
    const state = loadState();
    expect(state.currentStep).toBe(1);
  });

  it("rejects invalid shape (L2)", () => {
    localStorage.setItem("atlas_onboard_state", JSON.stringify({ foo: "bar" }));
    const state = loadState();
    expect(state.currentStep).toBe(1);
  });

  it("rejects currentStep < 1 (L2)", () => {
    localStorage.setItem("atlas_onboard_state", JSON.stringify({ currentStep: 0 }));
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

describe("getStepRedirect (M4 - step skipping guard)", () => {
  it("allows step 1 always", () => {
    expect(getStepRedirect(1, { currentStep: 1 })).toBeNull();
  });

  it("allows step 2 always", () => {
    expect(getStepRedirect(2, { currentStep: 1 })).toBeNull();
  });

  it("redirects step 3 to /onboard/space when no spaceId", () => {
    expect(getStepRedirect(3, { currentStep: 1 })).toBe("/onboard/space");
  });

  it("allows step 3 when spaceId exists", () => {
    expect(getStepRedirect(3, { currentStep: 2, spaceId: "sp1" })).toBeNull();
  });

  it("redirects step 4 to /onboard/space when no spaceId", () => {
    expect(getStepRedirect(4, { currentStep: 1 })).toBe("/onboard/space");
  });

  it("allows step 4 when spaceId exists", () => {
    expect(getStepRedirect(4, { currentStep: 3, spaceId: "sp1" })).toBeNull();
  });

  it("redirects step 5 (done) to /onboard/space when no spaceId", () => {
    expect(getStepRedirect(5, { currentStep: 1 })).toBe("/onboard/space");
  });

  it("allows step 5 (done) when spaceId exists", () => {
    expect(getStepRedirect(5, { currentStep: 4, spaceId: "sp1" })).toBeNull();
  });
});
