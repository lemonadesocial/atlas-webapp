"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchBar } from "@/components/discover/SearchBar";
import { FilterBar, type FilterValues } from "@/components/discover/FilterBar";
import { EventGrid } from "@/components/discover/EventGrid";
import { EventCard } from "@/components/discover/EventCard";
import { EventGridSkeleton } from "@/components/discover/EventCardSkeleton";
import { MapView } from "@/components/discover/MapView";
import { ViewToggle } from "@/components/discover/ViewToggle";
import { useAtlasSearch } from "@/lib/hooks/useAtlasSearch";
import { searchEvents } from "@/lib/services/atlas-client";
import { getDateRange } from "@/lib/utils/format";
import { STRINGS, RECENTLY_HAPPENED_LIMIT } from "@/lib/utils/constants";
import type { AtlasSearchParams, AtlasSearchResultItem } from "@/lib/types/atlas";

const DEFAULT_FILTERS: FilterValues = {
  dateFilter: "",
  city: "",
  categories: [],
  source_platform: "",
  priceMode: "",
  sort: "",
};

function isDefaultState(q: string, f: FilterValues): boolean {
  return (
    !q &&
    !f.dateFilter && !f.city && !f.lat && !f.lng &&
    f.categories.length === 0 && !f.source_platform &&
    !f.priceMode && !f.sort
  );
}

export function DiscoverContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { results, totalResults, loading, error, hasNext, search, loadMore } =
    useAtlasSearch();
  const [view, setView] = useState<"grid" | "map">("grid");
  const initializedRef = useRef(false);
  const [recentPast, setRecentPast] = useState<AtlasSearchResultItem[]>([]);
  const [recentPastLoading, setRecentPastLoading] = useState(false);
  const spaceFilter = searchParams.get("space") || "";
  const spaceFilterName =
    searchParams.get("space_name") ||
    results.find((item) => item.source_space_id === spaceFilter)?.source_space_name ||
    results[0]?.source_space_name ||
    "this Atlas space";
  const [filters, setFilters] = useState<FilterValues>(() => ({
    dateFilter: searchParams.get("date") || "",
    city: searchParams.get("city") || "",
    lat: searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : undefined,
    lng: searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : undefined,
    categories: searchParams.get("category")
      ? searchParams.get("category")!.split(",")
      : [],
    source_platform: searchParams.get("source") || "",
    priceMode: searchParams.get("free") === "true"
      ? "free"
      : searchParams.get("price_min") || searchParams.get("price_max")
        ? "range"
        : "",
    price_min: searchParams.get("price_min")
      ? Number(searchParams.get("price_min"))
      : undefined,
    price_max: searchParams.get("price_max")
      ? Number(searchParams.get("price_max"))
      : undefined,
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
        categories:
          f.categories.length > 0 ? f.categories.join(",") : undefined,
        free_only: f.priceMode === "free" || undefined,
        price_min: f.priceMode === "range" ? f.price_min : undefined,
        price_max: f.priceMode === "range" ? f.price_max : undefined,
        source_platform: f.source_platform || undefined,
        sort: f.sort || undefined,
      };
    },
    []
  );

  const doSearch = useCallback(
    (query?: string) => {
      const q = query ?? searchParams.get("q") ?? "";
      const params = {
        ...buildSearchParams(q, filters),
        space: spaceFilter || undefined,
      };
      search(params);

      // Update URL
      const urlParams = new URLSearchParams();
      if (spaceFilter) urlParams.set("space", spaceFilter);
      if (spaceFilter && searchParams.get("space_name")) {
        urlParams.set("space_name", searchParams.get("space_name")!);
      }
      if (q) urlParams.set("q", q);
      if (filters.city) urlParams.set("city", filters.city);
      if (filters.dateFilter) urlParams.set("date", filters.dateFilter);
      if (filters.categories.length > 0)
        urlParams.set("category", filters.categories.join(","));
      if (filters.source_platform)
        urlParams.set("source", filters.source_platform);
      if (filters.priceMode === "free") urlParams.set("free", "true");
      if (filters.priceMode === "range") {
        if (filters.price_min !== undefined)
          urlParams.set("price_min", String(filters.price_min));
        if (filters.price_max !== undefined)
          urlParams.set("price_max", String(filters.price_max));
      }
      if (filters.sort) urlParams.set("sort", filters.sort);
      const qs = urlParams.toString();
      router.replace(`/discover${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, filters, buildSearchParams, search, router, spaceFilter]
  );

  const clearSpaceFilter = useCallback(() => {
    const q = searchParams.get("q") ?? "";
    const params = buildSearchParams(q, filters);
    search(params);

    const urlParams = new URLSearchParams();
    if (q) urlParams.set("q", q);
    if (filters.city) urlParams.set("city", filters.city);
    if (filters.dateFilter) urlParams.set("date", filters.dateFilter);
    if (filters.categories.length > 0) {
      urlParams.set("category", filters.categories.join(","));
    }
    if (filters.source_platform) {
      urlParams.set("source", filters.source_platform);
    }
    if (filters.priceMode === "free") {
      urlParams.set("free", "true");
    }
    if (filters.priceMode === "range") {
      if (filters.price_min !== undefined) {
        urlParams.set("price_min", String(filters.price_min));
      }
      if (filters.price_max !== undefined) {
        urlParams.set("price_max", String(filters.price_max));
      }
    }
    if (filters.sort) {
      urlParams.set("sort", filters.sort);
    }
    const qs = urlParams.toString();
    router.replace(`/discover${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [searchParams, filters, buildSearchParams, search, router]);

  // M7: Single effect handles both initial load and filter changes
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
    }
    doSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Fetch recently-happened events only when in the fully default state (no query, no filters)
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    if (spaceFilter || !isDefaultState(q, filters)) {
      setRecentPast([]);
      return;
    }
    setRecentPastLoading(true);
    const now = new Date();
    const twoYearsAgo = new Date(now);
    twoYearsAgo.setFullYear(now.getFullYear() - 2);
    searchEvents({
      date_from: twoYearsAgo.toISOString(),
      date_to: now.toISOString(),
      sort: "date_desc",
      per_page: RECENTLY_HAPPENED_LIMIT,
    })
      .then((data) => {
          const seen = new Set<string>();
          const unique = data.results.filter((item) => {
            const id = item.event.id || item.event.source_id;
            if (!id || seen.has(id)) return false;
            seen.add(id);
            return true;
          });
          setRecentPast(unique);
        })
      .catch(() => setRecentPast([]))
      .finally(() => setRecentPastLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, searchParams, spaceFilter]);

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

      {spaceFilter && (
        <div className="flex items-center justify-between gap-4 rounded-md border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-primary">
          <p>
            Showing events from <span className="font-medium">{spaceFilterName}</span>.
          </p>
          <button
            type="button"
            onClick={clearSpaceFilter}
            className="rounded-md p-1 text-primary/70 transition-colors hover:bg-accent/10 hover:text-primary"
            aria-label="Clear Atlas space filter"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {view === "grid" ? (
        <EventGrid
          results={results}
          totalResults={totalResults}
          loading={loading}
          error={error}
          hasNext={hasNext}
          onLoadMore={loadMore}
          onRetry={() => doSearch()}
          onSuggestionClick={(q) => doSearch(q)}
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
              onSuggestionClick={(q) => doSearch(q)}
            />
          </div>
        </div>
      )}

      {/* Recently happened — only shown in the default (no filter, no query) state */}
      {recentPastLoading && recentPast.length === 0 && (
        <EventGridSkeleton />
      )}
      {recentPast.length > 0 && (
        <section aria-label="Recently happened events">
          <h2 className="mb-4 text-lg font-semibold text-primary">
            {STRINGS.recentlyHappened}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentPast.map((item) => (
              <EventCard
                key={item.event.id || item.event.source_id}
                event={item.event}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
