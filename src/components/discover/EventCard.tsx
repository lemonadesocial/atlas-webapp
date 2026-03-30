"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatPriceRange } from "@/lib/utils/format";
import type { AtlasEvent } from "@/lib/types/atlas";

interface EventCardProps {
  event: AtlasEvent;
}

export const EventCard = memo(function EventCard({ event }: EventCardProps) {
  const isExternal =
    event.source_platform !== "lemonade" && event.url && !event.id;
  const href = isExternal ? event.url! : `/events/${event.id}`;
  const target = isExternal ? "_blank" : undefined;
  const rel = isExternal ? "noopener noreferrer" : undefined;

  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className="group flex flex-col overflow-hidden rounded-lg border border-card-border bg-card backdrop-blur-lg transition-colors hover:border-card-border-hover hover:bg-card-hover"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-accent/20 to-accent/5">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-quaternary">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-primary">
          {event.title}
        </h3>
        <p className="text-xs text-tertiary">{formatDate(event.start)}</p>
        {event.city && (
          <p className="text-xs text-tertiary">
            {event.city}
            {event.country ? `, ${event.country}` : ""}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-medium text-primary">
            {formatPriceRange(event.min_price, event.max_price, event.currency)}
          </span>
          <Badge variant="platform">{event.source_platform}</Badge>
        </div>
      </div>
    </Link>
  );
});
