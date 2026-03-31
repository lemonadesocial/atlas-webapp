"use client";

import { STRINGS } from "@/lib/utils/constants";

const STEPS = [
  STRINGS.onboardStep1Title,
  STRINGS.onboardStep2Title,
  STRINGS.onboardStep3Title,
  STRINGS.onboardStep4Title,
];

interface ProgressIndicatorProps {
  currentStep: number;
}

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  return (
    <div className="mb-8" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={4} aria-label={`Step ${currentStep} of 4`}>
      <div className="flex items-center justify-between gap-2">
        {STEPS.map((label, i) => {
          const step = i + 1;
          const isCompleted = currentStep > step;
          const isCurrent = currentStep === step;
          return (
            <div key={step} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full items-center">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    isCompleted
                      ? "bg-success text-white"
                      : isCurrent
                        ? "bg-accent text-white"
                        : "bg-card text-tertiary"
                  }`}
                >
                  {isCompleted ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {step < 4 && (
                  <div
                    className={`mx-1 h-0.5 flex-1 transition-colors ${
                      isCompleted ? "bg-success" : "bg-divider"
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-xs ${
                  isCurrent ? "font-medium text-primary" : "text-tertiary"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
