"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStatsFallback } from "@/lib/services/atlas-client";

interface StatsData {
  totalEvents: number;
  platforms: number;
  organizers: string;
}

const CACHE_KEY = "atlas_stats";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const FALLBACK: StatsData = {
  totalEvents: 500,
  platforms: 3,
  organizers: "50+",
};

export function Stats() {
  const [stats, setStats] = useState<StatsData>(FALLBACK);
  const [usedFallback, setUsedFallback] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setStats(data);
          setUsedFallback(false);
          return;
        }
      } catch {
        // ignore invalid cache
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    getStatsFallback()
      .then((data) => {
        clearTimeout(timeout);
        if (data.totalEvents > 0) {
          const newStats: StatsData = {
            totalEvents: data.totalEvents,
            platforms: data.platforms || 3,
            organizers: "50+",
          };
          setStats(newStats);
          setUsedFallback(false);
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data: newStats, timestamp: Date.now() })
          );
        }
      })
      .catch(() => {
        clearTimeout(timeout);
        // Keep fallback values
      });
  }, []);

  const items = [
    {
      label: "Events",
      value: usedFallback
        ? `${FALLBACK.totalEvents}+`
        : stats.totalEvents.toLocaleString(),
    },
    { label: "Organizers", value: stats.organizers },
    { label: "Platforms", value: String(stats.platforms) },
  ];

  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <div className="grid grid-cols-3 gap-8 text-center">
          {items.map((item) => (
            <div key={item.label}>
              <div className="font-display text-3xl font-bold text-primary sm:text-4xl">
                {item.value}
              </div>
              <div className="mt-1 text-sm text-tertiary">{item.label}</div>
            </div>
          ))}
        </div>
        {usedFallback && (
          <p className="mt-4 text-center text-xs text-quaternary">
            Stats updated periodically
          </p>
        )}
        <div className="mt-8 text-center">
          <Link
            href="/leaderboard"
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            View Leaderboard
          </Link>
        </div>
      </div>
    </section>
  );
}
