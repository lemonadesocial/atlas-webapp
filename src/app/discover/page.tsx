import { Suspense } from "react";
import type { Metadata } from "next";
import { STRINGS, SITE_URL } from "@/lib/utils/constants";
import { DiscoverContent } from "./DiscoverContent";
import { EventGridSkeleton } from "@/components/discover/EventCardSkeleton";

export const metadata: Metadata = {
  title: "Explore Events",
  description: "Search and discover events across all platforms on Atlas.",
  alternates: { canonical: `${SITE_URL}/discover` },
  openGraph: {
    title: `Explore Events | ${STRINGS.siteName}`,
    description: "Search and discover events across all platforms on Atlas.",
  },
};

export default function DiscoverPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Suspense fallback={<EventGridSkeleton />}>
        <DiscoverContent />
      </Suspense>
    </div>
  );
}
