import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/env";
import { connectDB } from "@/db/connection";
import { Lesson } from "@/db/models/Lesson";
import { getPublicTopics, getPublicLearningPaths } from "@/lib/data";

const STATIC_ROUTES = ["", "/start", "/paths", "/library", "/mentor", "/contact", "/privacy", "/terms"];
const LOCALES = ["en", "ar", "es"] as const;

export const revalidate = 3600;

async function getIndexableLessons() {
  await connectDB();
  return Lesson.find({ published: true, guestAccessible: true, audience: { $ne: "mentor" } })
    .select("slug updatedAt")
    .lean();
}

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

  try {
    const [topics, paths, lessons] = await Promise.all([
      getPublicTopics(),
      getPublicLearningPaths(),
      getIndexableLessons(),
    ]);

    const dynamicEntries = LOCALES.flatMap((locale) => [
      ...topics.map((topic) => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        url: `${siteUrl}/${locale}/library/${(topic as any).slug}`,
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

    const lessonEntries = lessons.flatMap((lesson) =>
      LOCALES.map((locale) => ({
        url: `${siteUrl}/${locale}/learn/${lesson.slug}`,
        lastModified: lesson.updatedAt || now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((alt) => [alt, `${siteUrl}/${alt}/learn/${lesson.slug}`])
          ),
        },
      }))
    );

    return [...staticEntries, ...dynamicEntries, ...lessonEntries];
  } catch (err) {
    console.error("[sitemap] failed to load dynamic entries:", err);
    return staticEntries;
  }
}
