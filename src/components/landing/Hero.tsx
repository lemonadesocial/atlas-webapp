"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { STRINGS } from "@/lib/utils/constants";

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <section className="relative overflow-hidden px-4 py-20 sm:py-32">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl">
          {STRINGS.heroHeadline}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-secondary">
          {STRINGS.heroSubheadline}
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/discover">
            <Button variant="primary" size="lg">
              {STRINGS.exploreEvents}
            </Button>
          </Link>
          <Link href="/onboard">
            <Button variant="tertiary" size="lg">
              {STRINGS.listYourEvents}
            </Button>
          </Link>
        </div>

        {/* Inline search for attendees (US-1.11) */}
        <form
          className="mx-auto mt-12 max-w-xl"
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) {
              router.push(`/discover?q=${encodeURIComponent(query.trim())}`);
            }
          }}
        >
          <div className="flex rounded-lg border border-card-border bg-card backdrop-blur-lg">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={STRINGS.searchPlaceholder}
              className="flex-1 rounded-l-lg bg-transparent px-4 py-3 text-sm text-primary placeholder:text-quaternary focus:outline-none"
              aria-label="Search events"
            />
            <button
              type="submit"
              className="rounded-r-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
