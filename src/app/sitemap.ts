import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/env";
import { getPublicTopics, getPublicLearningPaths } from "@/lib/data";

const STATIC_ROUTES = ["", "/topics", "/paths", "/contact", "/privacy", "/terms"];
const LOCALES = ["en", "ar", "es"] as const;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticEntries = LOCALES.flatMap((locale) =>
    STATIC_ROUTES.map((route) => ({
      url: `${siteUrl}/${locale}${route}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    }))
  );

  // Dynamic entries — best-effort. If DB is unreachable, fall back to static only.
  try {
    const [topics, paths] = await Promise.all([
      getPublicTopics(),
      getPublicLearningPaths(),
    ]);

    const dynamicEntries = LOCALES.flatMap((locale) => [
      ...topics.map((topic) => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        url: `${siteUrl}/${locale}/topics/${(topic as any).slug}`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lastModified: (topic as any).updatedAt || now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...paths.map((path) => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        url: `${siteUrl}/${locale}/paths/${(path as any).slug}`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lastModified: (path as any).updatedAt || now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ]);

    return [...staticEntries, ...dynamicEntries];
  } catch (err) {
    console.error("[sitemap] failed to load dynamic entries:", err);
    return staticEntries;
  }
}
