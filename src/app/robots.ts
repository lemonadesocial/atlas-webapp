import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://atlas.lemonade.social";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/onboard/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
