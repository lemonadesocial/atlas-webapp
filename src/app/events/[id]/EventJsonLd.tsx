import { SITE_URL } from "@/lib/utils/constants";

interface EventJsonLdProps {
  event: {
    title: string;
    description?: string;
    start: string;
    end?: string;
    location?: string;
    city?: string;
    country?: string;
    image_url?: string;
    organizer_name?: string;
    min_price?: number;
    max_price?: number;
    currency?: string;
    availability?: string;
  };
  eventId: string;
}

export function EventJsonLd({ event, eventId }: EventJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.start,
    endDate: event.end,
    url: `${SITE_URL}/events/${eventId}`,
    image: event.image_url,
    location: event.location
      ? {
          "@type": "Place",
          name: event.location,
          address: {
            "@type": "PostalAddress",
            addressLocality: event.city,
            addressCountry: event.country,
          },
        }
      : undefined,
    organizer: event.organizer_name
      ? { "@type": "Organization", name: event.organizer_name }
      : undefined,
    offers:
      event.min_price !== undefined
        ? {
            "@type": "Offer",
            price: event.min_price,
            priceCurrency: event.currency || "USD",
            availability:
              event.availability === "sold_out"
                ? "https://schema.org/SoldOut"
                : "https://schema.org/InStock",
            url: `${SITE_URL}/events/${eventId}`,
          }
        : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
