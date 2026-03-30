import type { MetadataRoute } from "next";
import { SITE_URL, ATLAS_REGISTRY_URL } from "@/lib/utils/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/discover`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
  ];

  // L8: Paginate to get more events for sitemap
  let eventPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(
      `${ATLAS_REGISTRY_URL}/atlas/v1/search?per_page=1000`,
      {
        headers: { "Atlas-Version": "1.0" },
        next: { revalidate: 86400 },
      }
    );

    if (res.ok) {
      const data = await res.json();
      const results = data["atlas:search_result"]?.results || data.results || [];
      eventPages = results
        .filter((item: { event?: { id?: string } }) => item.event?.id)
        .map((item: { event: { id: string } }) => ({
          url: `${SITE_URL}/events/${item.event.id}`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.7,
        }));
    }
  } catch {
    // Fall back to static pages only
  }

  return [...staticPages, ...eventPages];
}
