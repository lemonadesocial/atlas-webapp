import type { Metadata } from "next";
import { SITE_URL, STRINGS, LEMONADE_BACKEND_URL } from "@/lib/utils/constants";
import { validateEventId } from "@/lib/utils/escape";
import { mapSchemaOrgEvent } from "@/lib/services/atlas-client";
import { EventDetailContent } from "@/components/event/EventDetailContent";
import { EventJsonLd } from "./EventJsonLd";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchEvent(id: string) {
  if (!validateEventId(id)) return null;
  try {
    const res = await fetch(`${LEMONADE_BACKEND_URL}/atlas/v1/events/${id}`, {
      headers: {
        "Atlas-Agent-Id": "web:atlas-webapp",
        "Atlas-Version": "1.0",
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const raw = await res.json();
    return mapSchemaOrgEvent(raw as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await fetchEvent(id);
  if (!event) return { title: "Event Not Found" };

  const canonicalUrl = `${SITE_URL}/events/${id}`;

  return {
    title: event.title,
    description:
      event.description?.slice(0, 160) ||
      `${event.title} on ${STRINGS.siteName}`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      title: event.title,
      description: event.description?.slice(0, 160) || event.title,
      url: canonicalUrl,
      images: event.image_url
        ? [{ url: event.image_url, width: 1200, height: 630 }]
        : [{ url: "/og-default.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description?.slice(0, 160) || event.title,
      images: event.image_url ? [event.image_url] : ["/og-default.png"],
    },
  };
}

export default async function EventPage({ params }: PageProps) {
  const { id } = await params;
  const event = await fetchEvent(id);

  return (
    <>
      {event && <EventJsonLd event={event} eventId={id} />}
      <EventDetailContent eventId={id} />
    </>
  );
}
