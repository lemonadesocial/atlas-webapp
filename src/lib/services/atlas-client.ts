import { getRegistryUrl } from "@/lib/utils/constants";
import type { AtlasEvent, AtlasSearchParams, AtlasSearchResult } from "@/lib/types/atlas";

async function registryFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${getRegistryUrl()}${path}`, {
    ...init,
    headers: {
      "Atlas-Version": "1.0",
      ...init?.headers,
    },
    signal: init?.signal ?? AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    throw new Error(`Registry API error: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return json["atlas:search_result"] ?? json;
}

// Map Schema.org event format from the API to the flat AtlasEvent format the UI expects
export function mapSchemaOrgEvent(raw: Record<string, unknown>): AtlasEvent {
  const location = raw.location as Record<string, unknown> | undefined;
  const organizer = raw.organizer as Record<string, unknown> | undefined;
  const priceRange = raw["atlas:price_range"] as Record<string, unknown> | undefined;

  return {
    id: (raw["atlas:source_event_id"] as string) ?? (raw["@id"] as string) ?? "",
    title: (raw.name as string) ?? "",
    description: (raw.description as string) ?? "",
    start: (raw.startDate as string) ?? "",
    end: (raw.endDate as string) ?? undefined,
    location: location?.name as string | undefined,
    city: location?.["address"] ? (location["address"] as Record<string, unknown>)?.["addressLocality"] as string : undefined,
    country: location?.["address"] ? (location["address"] as Record<string, unknown>)?.["addressCountry"] as string : undefined,
    latitude: location?.["geo"] ? (location["geo"] as Record<string, unknown>)?.["latitude"] as number : undefined,
    longitude: location?.["geo"] ? (location["geo"] as Record<string, unknown>)?.["longitude"] as number : undefined,
    url: raw.url as string | undefined,
    source_platform: (raw["atlas:source_platform"] as string) ?? "lemonade",
    source_id: raw["atlas:source_event_id"] as string | undefined,
    category: (raw["atlas:categories"] as string[] | undefined)?.[0],
    tags: raw["atlas:tags"] as string[] | undefined,
    min_price: priceRange?.min_price as number | undefined,
    max_price: priceRange?.max_price as number | undefined,
    currency: priceRange?.currency as string | undefined,
    availability: raw["atlas:availability"] as AtlasEvent["availability"],
    organizer_name: organizer?.name as string | undefined,
  };
}

// Map Atlas ticket type format to flat TicketType format the UI expects
export function mapAtlasTicketType(raw: Record<string, unknown>): import("@/lib/types/atlas").TicketType {
  const pricing = raw["atlas:pricing"] as Record<string, unknown> | undefined;
  const availability = raw["atlas:availability"] as Record<string, unknown> | undefined;

  return {
    id: (raw["atlas:ticket_type_id"] as string) ?? (raw.id as string) ?? "",
    name: (raw.name as string) ?? "",
    price: (pricing?.base_price as number) ?? (pricing?.total_price as number) ?? 0,
    currency: (pricing?.currency as string) ?? "USD",
    description: raw.description as string | undefined,
    remaining: availability?.remaining_quantity as number | undefined,
    max_per_order: availability?.max_per_order as number | undefined,
  };
}

export async function searchEvents(
  params: AtlasSearchParams
): Promise<AtlasSearchResult> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const result = await registryFetch<AtlasSearchResult>(
    `/atlas/v1/search?${searchParams.toString()}`
  );

  // Map Schema.org events to flat AtlasEvent format
  if (result.results) {
    result.results = result.results.map((item) => ({
      ...item,
      event: mapSchemaOrgEvent(item.event as unknown as Record<string, unknown>),
    }));
  }

  return result;
}

export async function getStatsFallback(): Promise<{
  totalEvents: number;
  platforms: number;
}> {
  try {
    const result = await searchEvents({ per_page: 1 });
    return {
      totalEvents: result.total_results || 0,
      platforms: result.facets?.source_platforms?.length || 0,
    };
  } catch {
    return { totalEvents: 0, platforms: 0 };
  }
}
