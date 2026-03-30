import { getRegistryUrl } from "@/lib/utils/constants";
import type { AtlasSearchParams, AtlasSearchResult } from "@/lib/types/atlas";

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
