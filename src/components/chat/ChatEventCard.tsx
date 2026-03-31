"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { AtlasEvent } from "@/lib/types/atlas";
import { formatDateShort, formatPriceRange } from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";
import { escapeHtml } from "@/lib/utils/escape";

interface ChatEventCardProps {
  event: AtlasEvent;
}

export const ChatEventCard = memo(function ChatEventCard({ event }: ChatEventCardProps) {
  const href = event.source_platform === "lemonade" || !event.url
    ? `/events/${event.id}`
    : event.url;
  const isExternal = href.startsWith("http");

  const card = (
    <div className="flex gap-3 rounded-md border border-divider bg-card p-3 transition-colors hover:bg-card-hover">
      {event.image_url ? (
        <Image
          src={event.image_url}
          alt=""
          width={80}
          height={80}
          className="h-20 w-20 shrink-0 rounded object-cover"
          unoptimized
        />
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded bg-gradient-to-br from-accent/20 to-accent/5">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-secondary"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
      )}
      <div className="flex min-w-0 flex-col gap-1">
        <p className="truncate text-sm font-medium text-primary">
          {escapeHtml(event.title)}
        </p>
        {event.start && (
          <p className="text-xs text-secondary">{formatDateShort(event.start)}</p>
        )}
        {event.city && (
          <p className="text-xs text-secondary">{escapeHtml(event.city)}</p>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-accent">
            {formatPriceRange(event.min_price, event.max_price, event.currency)}
          </span>
          <Badge variant="platform">{event.source_platform}</Badge>
        </div>
      </div>
    </div>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        aria-label={`View ${event.title} on ${event.source_platform}`}
      >
        {card}
      </a>
    );
  }

  return (
    <Link href={href} className="block" aria-label={`View ${event.title}`}>
      {card}
    </Link>
  );
});
