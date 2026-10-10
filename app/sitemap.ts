import type { MetadataRoute } from "next";
import { destinations, stays, experiences } from "@/lib/data";

/**
 * Sitemap.
 *
 * Every page that actually exists is listed. The earlier version of this site
 * linked to /plan and /flights from four places without either existing, so this
 * doubles as a cheap regression check on dead routes.
 *
 * Static now — slugs come from the editorial data layer rather than a database
 * query, so the sitemap is prerendered and cannot fail at request time.
 */

const base = process.env.SITE_URL ?? "https://travel-lab.vercel.app";

const staticRoutes: {
  path: string;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
}[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/discover", priority: 0.9, changeFrequency: "weekly" },
  { path: "/places", priority: 0.9, changeFrequency: "weekly" },
  { path: "/experiences", priority: 0.9, changeFrequency: "weekly" },
  { path: "/hotels", priority: 0.9, changeFrequency: "weekly" },
  { path: "/plan", priority: 0.9, changeFrequency: "weekly" },
  { path: "/flights", priority: 0.8, changeFrequency: "monthly" },
  { path: "/guide", priority: 0.8, changeFrequency: "monthly" },
  { path: "/map", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.4, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${base}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  for (const destination of destinations) {
    entries.push({
      url: `${base}/places/${destination.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  for (const stay of stays) {
    entries.push({
      url: `${base}/hotels/${stay.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const experience of experiences) {
    entries.push({
      url: `${base}/experiences/${experience.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}