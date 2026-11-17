import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPublicStories } from "@/lib/data";
import {
  getPathsByTrack,
  pickTrackPath,
  type PathOutline,
  type TrackGroups,
} from "@/lib/learning";
import { routing } from "@/i18n/routing";
import {
  buildRecommendations,
  buildStartCandidates,
  toPathView,
} from "@/components/placement/recommendations";
import { HomeHero, HomeMentor } from "@/components/home/HomePersonal";
import { HomeHowItWorks, HomePaths } from "@/components/home/HomeMember";
import { Stories } from "@/components/home/Stories";
import { toStoryView, type StoryView } from "@/components/home/story-view";

export const revalidate = 300;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    title: { absolute: t("meta.title") },
    description: t("meta.description"),
  };
}

async function loadSafely<T>(label: string, task: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await task();
  } catch (error) {
    console.error(`[home] Failed to load ${label}:`, error);
    return fallback;
  }
}

function allOutlines(groups: TrackGroups | null): PathOutline[] {
  if (!groups) return [];
  const seen = new Map<string, PathOutline>();
  for (const path of [...groups.curious, ...groups.new.flatMap((g) => g.paths), ...groups.muslim]) {
    if (!seen.has(path.id)) seen.set(path.id, path);
  }
  return [...seen.values()];
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [groups, storyRecords] = await Promise.all([
    loadSafely<TrackGroups | null>("paths", () => getPathsByTrack({ isGuest: true }), null),
    loadSafely("stories", () => getPublicStories(6), []),
  ]);

  const outlines = allOutlines(groups);
  const candidates = buildStartCandidates(buildRecommendations(outlines, locale));
  const curiousPath = groups ? pickTrackPath(groups.curious) : null;
  const muslimPath = groups ? pickTrackPath(groups.muslim) : null;
  const views = {
    curious: curiousPath ? toPathView(curiousPath, locale) : null,
    muslim: muslimPath ? toPathView(muslimPath, locale) : null,
  };
  const stories = storyRecords
    .map((story) => toStoryView(story, locale))
    .filter((story): story is StoryView => story !== null);

  return (
    <>
      <HomeHero candidates={candidates} views={views} />
      <HomeHowItWorks />
      <HomePaths paths={outlines} />
      <HomeMentor />
      <Stories stories={stories} />
    </>
  );
}
