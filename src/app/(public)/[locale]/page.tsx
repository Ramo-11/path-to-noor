import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth-config";
import { getPublicStories } from "@/lib/data";
import { getLearnerState, getPathsByStage, type LearnerState, type StageGroup } from "@/lib/learning";
import {
  buildRecommendations,
  buildStartCandidates,
  toPathView,
} from "@/components/placement/recommendations";
import { DefaultHero, ReadyHero, WelcomeHero } from "@/components/home/Hero";
import { FinalCall } from "@/components/home/FinalCall";
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
    loadSafely<StageGroup[] | null>("paths", () => getPathsByStage(ctx, completed), null),
    loadSafely("stories", () => getPublicStories(6), []),
  ]);

  const outlines = groups ? groups.flatMap((group) => group.paths) : [];
  const candidates = buildStartCandidates(buildRecommendations(outlines, locale));
  const stories = storyRecords
    .map((story) => toStoryView(story, locale))
    .filter((story): story is StoryView => story !== null);

  const firstName = firstNameOf(session?.user?.name);
  const current = state?.currentPath ?? null;
  const recommended = state?.recommendedPath ?? null;

  let hero: React.ReactNode;
  if (current && current.isStarted && current.nextLesson) {
    hero = (
      <WelcomeHero
        path={toPathView(current, locale)}
        stage={state?.placement?.stage ?? null}
        firstName={firstName}
      />
    );
  } else if (state?.placement && recommended && recommended.nextLesson && !recommended.isComplete) {
    hero = (
      <ReadyHero
        path={toPathView(recommended, locale)}
        stage={state.placement.stage}
        isFallback={state.recommendedIsFallback}
        firstName={firstName}
      />
    );
  } else {
    hero = <DefaultHero candidates={candidates} reflectStored={!state?.placement} />;
  }

  const isGuest = !session?.user;
  const showMentor = session?.user?.userType !== "mentor";

  return (
    <>
      {hero}
      {current ? null : <HowItWorks />}
      {groups ? <PathsByStage groups={groups} locale={locale} /> : null}
      {showMentor ? <MentorBlock /> : null}
      <Stories stories={stories} />
      {isGuest ? <FinalCall /> : null}
    </>
  );
}
