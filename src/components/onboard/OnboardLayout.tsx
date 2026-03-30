"use client";

import { ProgressIndicator } from "./ProgressIndicator";
import { STRINGS } from "@/lib/utils/constants";

interface OnboardLayoutProps {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
  onBack?: () => void;
}

export function OnboardLayout({
  step,
  title,
  description,
  children,
  onBack,
}: OnboardLayoutProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 text-center text-2xl font-bold text-primary font-display">
        {STRINGS.onboardTitle}
      </h1>
      <ProgressIndicator currentStep={step} />
      <div className="rounded-lg border border-divider bg-card p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-primary">{title}</h2>
          <p className="mt-1 text-sm text-secondary">{description}</p>
        </div>
        {children}
        {onBack && (
          <button
            onClick={onBack}
            className="mt-6 text-sm text-tertiary transition-colors hover:text-primary"
            aria-label="Go to previous step"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
