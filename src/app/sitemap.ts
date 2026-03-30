import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://atlas.lemonade.social";
const REGISTRY_URL = process.env.NEXT_PUBLIC_ATLAS_REGISTRY_URL || "";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/discover`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/docs`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];

  // Fetch event IDs for dynamic pages
  let eventPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${REGISTRY_URL}/atlas/v1/search?per_page=100`, {
      headers: { "Atlas-Version": "1.0" },
      next: { revalidate: 86400 }, // rebuild daily
    });

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
