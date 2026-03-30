import { NOMINATIM_URL } from "@/lib/utils/constants";

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

let lastRequestTime = 0;

export async function searchCities(
  query: string
): Promise<NominatimResult[]> {
  // Enforce max 1 request/second per Nominatim usage policy
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < 1000) {
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 - timeSinceLastRequest)
    );
  }
  lastRequestTime = Date.now();

  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: "5",
    addressdetails: "1",
    featuretype: "city",
  });

  const res = await fetch(`${NOMINATIM_URL}/search?${params.toString()}`, {
    headers: {
      "User-Agent": "atlas-webapp",
    },
  });

  if (!res.ok) return [];
  return res.json();
}

export function getCityName(result: NominatimResult): string {
  const addr = result.address;
  if (!addr) return result.display_name.split(",")[0];
  return addr.city || addr.town || addr.village || result.display_name.split(",")[0];
}
