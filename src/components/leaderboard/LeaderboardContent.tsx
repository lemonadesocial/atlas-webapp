"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { STRINGS, CATEGORIES } from "@/lib/utils/constants";
import type { LeaderboardEntry, LeaderboardResponse } from "@/lib/types/atlas";

const PERIODS = [
  { value: "", label: STRINGS.allTime },
  { value: "month", label: STRINGS.thisMonth },
  { value: "week", label: STRINGS.thisWeek },
] as const;

async function fetchLeaderboard(
  period: string,
  category: string
): Promise<LeaderboardResponse> {
  const params = new URLSearchParams();
  if (period) params.set("period", period);
  if (category) params.set("category", category);
  const url = `/api/atlas/leaderboard${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  // M12: Backend endpoint may not exist yet - return empty on 404
  if (res.status === 404) {
    return { entries: [], period: period || "", category: category || undefined };
  }
  if (!res.ok) throw new Error(`Leaderboard fetch failed: ${res.status}`);
  return res.json();
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500/20 text-xs font-bold text-yellow-400">1</span>;
  if (rank === 2) return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-300/20 text-xs font-bold text-gray-300">2</span>;
  if (rank === 3) return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-600/20 text-xs font-bold text-amber-500">3</span>;
  return <span className="inline-flex h-7 w-7 items-center justify-center text-xs text-tertiary">{rank}</span>;
}

function TrendArrow({ percent }: { percent: number }) {
  if (percent === 0) return null;
  const isUp = percent > 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs ${isUp ? "text-success" : "text-danger"}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isUp ? "" : "rotate-180"} aria-hidden="true">
        <polyline points="18 15 12 9 6 15" />
      </svg>
      {Math.abs(percent)}%
    </span>
  );
}

function LeaderboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const period = searchParams.get("period") || "";
  const category = searchParams.get("category") || "";

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [trending, setTrending] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<keyof LeaderboardEntry>("total_attendees");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLeaderboard(period, category);
      setEntries(data.entries || []);
      // Trending: entries with trend_percent, sorted by absolute change
      const trendingEntries = (data.entries || [])
        .filter((e) => e.trend_percent && e.trend_percent !== 0)
        .sort((a, b) => Math.abs(b.trend_percent || 0) - Math.abs(a.trend_percent || 0))
        .slice(0, 5);
      setTrending(trendingEntries);
    } catch {
      setError(STRINGS.leaderboardError);
    } finally {
      setLoading(false);
    }
  }, [period, category]);

  useEffect(() => {
    load();
  }, [load]);

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/leaderboard?${params.toString()}`);
  };

  const handleSort = (key: keyof LeaderboardEntry) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortedEntries = useMemo(() => [...entries].sort((a, b) => {
    const aVal = a[sortKey] ?? 0;
    const bVal = b[sortKey] ?? 0;
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    }
    return 0;
  }), [entries, sortKey, sortDir]);

  const SortHeader = ({
    label,
    field,
    className,
  }: {
    label: string;
    field: keyof LeaderboardEntry;
    className?: string;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-1 text-xs font-medium text-tertiary hover:text-primary ${className || ""}`}
      aria-label={`Sort by ${label}`}
    >
      {label}
      {sortKey === field && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={sortDir === "asc" ? "rotate-180" : ""}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary font-display">
          {STRINGS.leaderboardTitle}
        </h1>
        <p className="mt-1 text-sm text-secondary">{STRINGS.leaderboardDesc}</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {/* Time period */}
        <div className="flex rounded-md border border-divider" role="radiogroup" aria-label="Time period">
          {PERIODS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter("period", value)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors first:rounded-l-md last:rounded-r-md ${
                period === value
                  ? "bg-accent text-white"
                  : "text-secondary hover:bg-btn-tertiary"
              }`}
              role="radio"
              aria-checked={period === value}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <select
          value={category}
          onChange={(e) => setFilter("category", e.target.value)}
          className="rounded-md border border-divider bg-background px-3 py-1.5 text-xs text-primary focus:border-accent focus:outline-none"
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat.toLowerCase()}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="skeleton h-14 rounded-md" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <p className="text-sm text-danger">{error}</p>
          <button
            onClick={load}
            className="rounded-md bg-btn-tertiary px-4 py-2 text-sm text-btn-tertiary-content hover:bg-btn-tertiary-hover"
          >
            {STRINGS.retry}
          </button>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <p className="text-sm text-secondary">{STRINGS.noLeaderboardData}</p>
        </div>
      ) : (
        <>
          {/* Trending section */}
          {trending.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-3 text-sm font-semibold text-primary">
                {STRINGS.trendingThisWeek}
              </h2>
              <div className="flex flex-wrap gap-3">
                {trending.map((entry) => (
                  <Link
                    key={entry.space_id}
                    href={`/discover?space=${entry.space_id}`}
                    className="flex items-center gap-2 rounded-md border border-divider bg-card px-4 py-2 transition-colors hover:border-card-border-hover"
                  >
                    <span className="text-sm font-medium text-primary">
                      {entry.space_name}
                    </span>
                    {entry.trend_percent !== undefined && (
                      <TrendArrow percent={entry.trend_percent} />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* TODO (L9): /discover?space=[id] links depend on discover page supporting `space` filter param */}
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-divider">
                  <th className="pb-2 pr-4 text-xs font-medium text-tertiary w-12">
                    {STRINGS.rank}
                  </th>
                  <th className="pb-2 pr-4 text-xs font-medium text-tertiary">
                    {STRINGS.spaceName}
                  </th>
                  <th className="pb-2 pr-4">
                    <SortHeader label={STRINGS.totalEvents} field="total_events" />
                  </th>
                  <th className="pb-2 pr-4">
                    <SortHeader label={STRINGS.totalAttendees} field="total_attendees" />
                  </th>
                  <th className="pb-2 pr-4">
                    <SortHeader label={STRINGS.avgRating} field="average_rating" />
                  </th>
                  <th className="pb-2 pr-4 text-xs font-medium text-tertiary">
                    {STRINGS.connectedPlatforms}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedEntries.map((entry, i) => (
                  <tr
                    key={entry.space_id}
                    className={`border-b border-divider transition-colors hover:bg-card-hover ${
                      i < 3 ? "bg-card" : ""
                    }`}
                  >
                    <td className="py-3 pr-4">
                      <RankBadge rank={entry.rank} />
                    </td>
                    <td className="py-3 pr-4">
                      <Link
                        href={`/discover?space=${entry.space_id}`}
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-accent"
                      >
                        {entry.space_name}
                        {entry.verified && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-accent" role="img" aria-label="Verified">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-sm text-secondary">
                      {entry.total_events.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-sm text-secondary">
                      {entry.total_attendees.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-sm text-secondary">
                      {entry.average_rating > 0
                        ? entry.average_rating.toFixed(1)
                        : "-"}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-1">
                        {entry.connected_platforms.map((p) => (
                          <span
                            key={p}
                            className="rounded-sm bg-chip-bg px-2 py-0.5 text-xs text-tertiary"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {sortedEntries.map((entry) => (
              <Link
                key={entry.space_id}
                href={`/discover?space=${entry.space_id}`}
                className="rounded-md border border-divider bg-card p-4 transition-colors hover:border-card-border-hover"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <RankBadge rank={entry.rank} />
                    <div>
                      <p className="flex items-center gap-1 text-sm font-medium text-primary">
                        {entry.space_name}
                        {entry.verified && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-accent" role="img" aria-label="Verified">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </p>
                      <div className="mt-1 flex gap-1">
                        {entry.connected_platforms.map((p) => (
                          <span key={p} className="rounded-sm bg-chip-bg px-1.5 py-0.5 text-[10px] text-tertiary">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {entry.trend_percent !== undefined && entry.trend_percent !== 0 && (
                    <TrendArrow percent={entry.trend_percent} />
                  )}
                </div>
                <div className="mt-3 flex gap-4 text-xs text-secondary">
                  <span>{entry.total_events} events</span>
                  <span>{entry.total_attendees.toLocaleString()} attendees</span>
                  {entry.average_rating > 0 && (
                    <span>{entry.average_rating.toFixed(1)} rating</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function LeaderboardContent() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="skeleton mb-4 h-8 w-48 rounded-md" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-md" />
            ))}
          </div>
        </div>
      }
    >
      <LeaderboardInner />
    </Suspense>
  );
}
