import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth-config";
import { getPublicStories } from "@/lib/data";
import {
  getLearnerState,
  getPathsByTrack,
  pickTrackPath,
  type LearnerState,
  type PathOutline,
  type TrackGroups,
} from "@/lib/learning";
import { sessionTrack } from "@/lib/tracks";
import {
  buildRecommendations,
  buildStartCandidates,
  toPathView,
} from "@/components/placement/recommendations";
import { NewStartHero, ReadyHero, TrackReadyHero, WelcomeHero } from "@/components/home/Hero";
import { GuestHero } from "@/components/home/GuestHero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { MentorBlock } from "@/components/home/MentorBlock";
import { PathsByStage } from "@/components/home/PathsByStage";
import { Stories } from "@/components/home/Stories";
import { toStoryView, type StoryView } from "@/components/home/story-view";

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

function firstNameOf(name: string | null | undefined): string | null {
  const first = name?.trim().split(/\s+/)[0];
  return first ? first : null;
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
  const session = await auth();
  const userId = session?.user?.id;
  const ctx = { userType: session?.user?.userType, isGuest: !session?.user };

  const state = userId
    ? await loadSafely<LearnerState | null>("learner state", () => getLearnerState(userId, ctx), null)
    : null;
  const completed = new Set(state?.completedLessonIds ?? []);

  const [groups, storyRecords] = await Promise.all([
    loadSafely<TrackGroups | null>("paths", () => getPathsByTrack(ctx, completed), null),
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

  const firstName = firstNameOf(session?.user?.name);
  const track = state?.track ?? sessionTrack(session?.user);
  const current = state?.currentPath ?? null;
  const recommended = state?.recommendedPath ?? null;

  let hero: React.ReactNode;
  if (current && current.isStarted && current.nextLesson) {
    hero = (
      <WelcomeHero
        path={toPathView(current, locale)}
        stage={state?.placement?.stage ?? null}
        firstName={firstName}
        showChange={track !== null}
      />
    );
  } else if (track === "new") {
    hero =
      state?.placement && recommended && recommended.nextLesson && !recommended.isComplete ? (
        <ReadyHero
          path={toPathView(recommended, locale)}
          stage={state.placement.stage}
          isFallback={state.recommendedIsFallback}
          firstName={firstName}
        />
      ) : (
        <NewStartHero candidates={candidates} reflectStored={!state?.placement} />
      );
  } else if (track === "curious" || track === "muslim") {
    hero = <TrackReadyHero track={track} path={views[track]} firstName={firstName} />;
  } else {
    hero = <GuestHero candidates={candidates} views={views} firstName={firstName} />;
  }

  const mentorChoice =
    track === "muslim" ? "volunteer" : track === "new" && session?.user ? "request" : "contact";
  const showMentor = session?.user?.userType !== "mentor";

  return (
    <>
      {hero}
      {current ? null : <HowItWorks />}
      {outlines.length > 0 ? <PathsByStage paths={outlines} locale={locale} /> : null}
      {showMentor ? <MentorBlock mentorChoice={mentorChoice} /> : null}
      <Stories stories={stories} />
    </>
  );
}
