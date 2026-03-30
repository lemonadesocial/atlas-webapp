"use client";

import { useEffect, useCallback, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchBar } from "@/components/discover/SearchBar";
import { FilterBar, type FilterValues } from "@/components/discover/FilterBar";
import { EventGrid } from "@/components/discover/EventGrid";
import { MapView } from "@/components/discover/MapView";
import { ViewToggle } from "@/components/discover/ViewToggle";
import { useAtlasSearch } from "@/lib/hooks/useAtlasSearch";
import { getDateRange } from "@/lib/utils/format";
import type { AtlasSearchParams } from "@/lib/types/atlas";

const DEFAULT_FILTERS: FilterValues = {
  dateFilter: "",
  city: "",
  category: "",
  source_platform: "",
  free_only: false,
  sort: "",
};

export function DiscoverContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { results, totalResults, loading, error, hasNext, search, loadMore } =
    useAtlasSearch();
  const [view, setView] = useState<"grid" | "map">("grid");
  const [filters, setFilters] = useState<FilterValues>(() => ({
    dateFilter: searchParams.get("date") || "",
    city: searchParams.get("city") || "",
    lat: searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : undefined,
    lng: searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : undefined,
    category: searchParams.get("category") || "",
    source_platform: searchParams.get("source") || "",
    free_only: searchParams.get("free") === "true",
    sort: searchParams.get("sort") || "",
  }));

  const buildSearchParams = useCallback(
    (query: string, f: FilterValues): AtlasSearchParams => {
      const dateRange = getDateRange(f.dateFilter);
      return {
        q: query || undefined,
        lat: f.lat,
        lng: f.lng,
        radius_km: f.lat ? 50 : undefined,
        date_from: dateRange.date_from,
        date_to: dateRange.date_to,
        categories: f.category || undefined,
        free_only: f.free_only || undefined,
        source_platform: f.source_platform || undefined,
        sort: f.sort || undefined,
      };
    },
    []
  );

  const doSearch = useCallback(
    (query?: string) => {
      const q = query ?? searchParams.get("q") ?? "";
      const params = buildSearchParams(q, filters);
      search(params);

      // Update URL
      const urlParams = new URLSearchParams();
      if (q) urlParams.set("q", q);
      if (filters.city) urlParams.set("city", filters.city);
      if (filters.dateFilter) urlParams.set("date", filters.dateFilter);
      if (filters.category) urlParams.set("category", filters.category);
      if (filters.source_platform)
        urlParams.set("source", filters.source_platform);
      if (filters.free_only) urlParams.set("free", "true");
      if (filters.sort) urlParams.set("sort", filters.sort);
      const qs = urlParams.toString();
      router.replace(`/discover${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, filters, buildSearchParams, search, router]
  );

  // Initial search on mount
  useEffect(() => {
    doSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-search when filters change
  useEffect(() => {
    doSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const mapCenter =
    filters.lat && filters.lng
      ? { lat: filters.lat, lng: filters.lng }
      : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <SearchBar
            defaultValue={searchParams.get("q") || ""}
            onSearch={(q) => doSearch(q)}
          />
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>

      <FilterBar
        values={filters}
        onChange={setFilters}
        onClear={() => setFilters(DEFAULT_FILTERS)}
      />

      {view === "grid" ? (
        <EventGrid
          results={results}
          totalResults={totalResults}
          loading={loading}
          error={error}
          hasNext={hasNext}
          onLoadMore={loadMore}
          onRetry={() => doSearch()}
        />
      ) : (
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="md:w-1/2">
            <MapView results={results} center={mapCenter} />
          </div>
          <div className="md:w-1/2">
            <EventGrid
              results={results}
              totalResults={totalResults}
              loading={loading}
              error={error}
              hasNext={hasNext}
              onLoadMore={loadMore}
              onRetry={() => doSearch()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
