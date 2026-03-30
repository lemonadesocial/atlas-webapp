"use client";

import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { STRINGS } from "@/lib/utils/constants";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Dynamic import to avoid pulling server-side Sentry into the client bundle
    import("@sentry/nextjs").then((Sentry) => {
      Sentry.captureException(error, {
        extra: { componentStack: errorInfo.componentStack },
      });
    }).catch(() => {
      // Sentry not available -- no-op
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8">
          <h2 className="text-xl font-semibold text-primary">
            {STRINGS.errorGeneric}
          </h2>
          <Button
            variant="secondary"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            {STRINGS.reload}
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
