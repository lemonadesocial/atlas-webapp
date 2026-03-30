"use client";

import { useState, useCallback } from "react";
import { searchEvents } from "@/lib/services/atlas-client";
import type {
  AtlasSearchParams,
  AtlasSearchResultItem,
} from "@/lib/types/atlas";

export function useAtlasSearch() {
  const [results, setResults] = useState<AtlasSearchResultItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentParams, setCurrentParams] = useState<AtlasSearchParams>({});

  const search = useCallback(async (params: AtlasSearchParams) => {
    setLoading(true);
    setError(null);
    setCurrentParams(params);

    const searchWithRetry = async (attempt: number): Promise<void> => {
      try {
        const data = await searchEvents({ ...params, page: 1, per_page: 12 });
        setResults(data.results);
        setTotalResults(data.total_results);
        setPage(data.page);
        setHasNext(data.has_next);
      } catch (err) {
        if (attempt < 1) {
          return searchWithRetry(attempt + 1);
        }
        setError(
          err instanceof Error ? err.message : "Failed to load events"
        );
        setResults([]);
        setTotalResults(0);
        setHasNext(false);
      }
    };

    await searchWithRetry(0);
    setLoading(false);
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || !hasNext) return;
    setLoading(true);
    setError(null);

    try {
      const nextPage = page + 1;
      const data = await searchEvents({
        ...currentParams,
        page: nextPage,
        per_page: 12,
      });
      setResults((prev) => [...prev, ...data.results]);
      setPage(data.page);
      setHasNext(data.has_next);
      setTotalResults(data.total_results);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load more events"
      );
    } finally {
      setLoading(false);
    }
  }, [loading, hasNext, page, currentParams]);

  return {
    results,
    totalResults,
    loading,
    error,
    hasNext,
    search,
    loadMore,
  };
}
