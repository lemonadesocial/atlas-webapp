"use client";

import { EventCard } from "./EventCard";
import { EventGridSkeleton } from "./EventCardSkeleton";
import { Button } from "@/components/ui/Button";
import { STRINGS } from "@/lib/utils/constants";
import type { AtlasSearchResultItem } from "@/lib/types/atlas";

interface EventGridProps {
  results: AtlasSearchResultItem[];
  totalResults: number;
  loading: boolean;
  error: string | null;
  hasNext: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  onSuggestionClick?: (query: string) => void;
}

export function EventGrid({
  results,
  totalResults,
  loading,
  error,
  hasNext,
  onLoadMore,
  onRetry,
  onSuggestionClick,
}: EventGridProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-danger/20 bg-danger/5 p-8">
        <p className="text-sm text-danger">{STRINGS.errorLoadEvents}</p>
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {STRINGS.retry}
        </Button>
      </div>
    );
  }

  if (loading && results.length === 0) {
    return <EventGridSkeleton />;
  }

  if (!loading && results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-quaternary"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <p className="text-sm text-secondary">{STRINGS.noEventsFound}</p>
        <div className="flex gap-2">
          {["Music in Berlin", "Tech events", "Free this weekend"].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onSuggestionClick?.(q)}
              className="rounded-full bg-chip-bg px-3 py-1 text-xs text-tertiary transition-colors hover:bg-card-hover hover:text-secondary"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-tertiary">
        {STRINGS.showingResults(results.length, totalResults)}
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((item) => (
          <EventCard key={item.event.id || item.event.source_id} event={item.event} />
        ))}
      </div>

      {hasNext && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="tertiary"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? "Loading..." : STRINGS.loadMore}
          </Button>
        </div>
      )}
    </div>
  );
}
