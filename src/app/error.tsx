"use client";

import { Button } from "@/components/ui/Button";
import { STRINGS } from "@/lib/utils/constants";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-6xl font-bold text-quaternary">500</h1>
      <h2 className="text-xl font-semibold text-primary">
        {STRINGS.serverError}
      </h2>
      <p className="text-secondary">An unexpected error occurred.</p>
      <Button variant="secondary" onClick={reset}>
        {STRINGS.retry}
      </Button>
    </div>
  );
}
