"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EventDetailSkeleton } from "./EventDetailSkeleton";
import { TicketSection } from "./TicketSection";
import { ShareButton } from "./ShareButton";
import { formatDate } from "@/lib/utils/format";
import { SITE_URL } from "@/lib/utils/constants";
import type { AtlasEventDetail, TicketType } from "@/lib/types/atlas";

interface Props {
  eventId: string;
}

export function EventDetailContent({ eventId }: Props) {
  const [event, setEvent] = useState<AtlasEventDetail | null>(null);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [eventRes, ticketsRes] = await Promise.allSettled([
          fetch(`/api/atlas/events/${eventId}`).then((r) => {
            if (!r.ok) throw new Error(`${r.status}`);
            return r.json();
          }),
          fetch(`/api/atlas/events/${eventId}/tickets`).then((r) => {
            if (!r.ok) return { ticket_types: [] };
            return r.json();
          }),
        ]);

        if (cancelled) return;

        if (eventRes.status === "rejected") {
          if (eventRes.reason?.message?.includes("404")) {
            setError("not_found");
          } else {
            setError("Failed to load event. Please try again.");
          }
          setLoading(false);
          return;
        }

        setEvent(eventRes.value);
        if (ticketsRes.status === "fulfilled") {
          setTickets(ticketsRes.value.ticket_types || []);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load event. Please try again.");
        }
      }
      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  if (loading) return <EventDetailSkeleton />;

  if (error === "not_found") {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-20">
        <h1 className="text-2xl font-bold text-primary">Event not found</h1>
        <Link href="/discover">
          <Button variant="secondary">Back to Explore</Button>
        </Link>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-20">
        <p className="text-sm text-danger">{error}</p>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  const isExternal = event.source_platform !== "lemonade";
  const canonicalUrl = `${SITE_URL}/events/${eventId}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Hero image */}
      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg bg-gradient-to-br from-accent/20 to-accent/5">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 896px) 100vw, 896px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-quaternary"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          <h1 className="font-display text-3xl font-bold text-primary">
            {event.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-secondary">
            <span className="flex items-center gap-1.5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-tertiary"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {formatDate(event.start)}
            </span>
            {event.location && (
              <span className="flex items-center gap-1.5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-tertiary"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {event.location}
                {event.city && `, ${event.city}`}
              </span>
            )}
          </div>

          {/* Organizer */}
          {event.organizer_name && (
            <div className="mt-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">
                {event.organizer_name[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-secondary">
                {event.organizer_name}
              </span>
            </div>
          )}

          {/* Source badge */}
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="platform">
              via {event.source_platform}
            </Badge>
            {event.source?.url && (
              <a
                href={event.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:text-accent-hover"
              >
                View original listing
              </a>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-primary">About</h2>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-secondary">
                {event.description}
              </div>
            </div>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          )}

          {/* Share */}
          <div className="mt-6">
            <ShareButton url={canonicalUrl} title={event.title} />
          </div>
        </div>

        {/* Sidebar: tickets */}
        <div>
          <TicketSection
            eventId={eventId}
            ticketTypes={tickets}
            isExternal={isExternal}
            externalUrl={event.source?.url || event.url}
            externalPlatform={event.source?.platform || event.source_platform}
          />
        </div>
      </div>
    </div>
  );
}
