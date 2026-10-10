import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL ?? "https://travel-lab.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The admin area and upload APIs must never be indexed.
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}