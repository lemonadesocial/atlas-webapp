import {
  ATLAS_REGISTRY_URL,
  LEMONADE_BACKEND_URL,
} from "@/lib/utils/constants";
import type {
  AtlasSearchParams,
  AtlasSearchResult,
  AtlasEventDetail,
  TicketType,
} from "@/lib/types/atlas";

async function registryFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${ATLAS_REGISTRY_URL}${path}`, {
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

async function backendFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${LEMONADE_BACKEND_URL}${path}`, {
    ...init,
    headers: {
      "Atlas-Agent-Id": "web:atlas-webapp",
      "Atlas-Version": "1.0",
      "Content-Type": "application/json",
      ...init?.headers,
    },
    signal: init?.signal ?? AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Backend API error: ${res.status} ${res.statusText} ${body}`
    );
  }
  return res.json();
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

  return registryFetch<AtlasSearchResult>(
    `/atlas/v1/search?${searchParams.toString()}`
  );
}

export async function getEvent(id: string): Promise<AtlasEventDetail> {
  return backendFetch<AtlasEventDetail>(`/atlas/v1/events/${id}`);
}

export async function getEventTickets(
  eventId: string
): Promise<{ ticket_types: TicketType[] }> {
  return backendFetch<{ ticket_types: TicketType[] }>(
    `/atlas/v1/events/${eventId}/tickets`
  );
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
