import { pickRecommendedPath, type PathOutline } from "@/lib/learning-types";
import { STAGES, localized, type StageKey } from "@/lib/stages";

export interface StepView {
  title: string;
  lessonCount: number;
  completedCount: number;
  isPreparing: boolean;
  isComplete: boolean;
  isNext: boolean;
}

export interface NextLessonView {
  slug: string;
  title: string;
  stepNumber: number;
  lessonNumber: number;
}

export interface PathView {
  slug: string;
  title: string;
  description: string;
  stage: StageKey;
  steps: StepView[];
  totalLessons: number;
  completedLessons: number;
  isStarted: boolean;
  isComplete: boolean;
  next: NextLessonView | null;
  startHref: string;
  pathHref: string;
}

export interface Recommendation {
  path: PathView | null;
  isFallback: boolean;
}

export type Recommendations = Record<StageKey, Recommendation>;

export interface StartCandidate {
  title: string;
  href: string;
}

export type StartCandidates = Partial<Record<StageKey, StartCandidate>>;

export function toPathView(outline: PathOutline, locale: string): PathView {
  const next = outline.nextLesson;
  const pathHref = `/paths/${outline.slug}`;
  return {
    slug: outline.slug,
    title: localized(outline.title, locale),
    description: localized(outline.description, locale),
    stage: outline.stage,
    steps: outline.steps.map((step, index) => ({
      title: localized(step.title, locale),
      lessonCount: step.lessons.length,
      completedCount: step.completedCount,
      isPreparing: step.isPreparing,
      isComplete: step.isComplete,
      isNext: next ? next.stepIndex === index : false,
    })),
    totalLessons: outline.totalLessons,
    completedLessons: outline.completedLessons,
    isStarted: outline.isStarted,
    isComplete: outline.isComplete,
    next: next
      ? {
          slug: next.slug,
          title: localized(next.title, locale),
          stepNumber: next.stepIndex + 1,
          lessonNumber: next.lessonIndex + 1,
        }
      : null,
    startHref: next && !outline.isComplete ? `/learn/${next.slug}` : pathHref,
    pathHref,
  };
}

export function buildRecommendations(outlines: PathOutline[], locale: string): Recommendations {
  const entries = STAGES.map((stage) => {
    const { path, isFallback } = pickRecommendedPath(outlines, stage);
    return [stage, { path: path ? toPathView(path, locale) : null, isFallback }] as const;
  });
  return Object.fromEntries(entries) as Recommendations;
}

export function buildStartCandidates(recommendations: Recommendations): StartCandidates {
  const candidates: StartCandidates = {};
  for (const stage of STAGES) {
    const path = recommendations[stage].path;
    if (path) candidates[stage] = { title: path.title, href: path.startHref };
  }
  return candidates;
}
