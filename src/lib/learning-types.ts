import { STAGES, type LocalizedText, type StageKey } from "@/lib/stages";
import type { TrackKey } from "@/lib/tracks";

export interface AudienceContext {
  userType?: string;
  isGuest: boolean;
}

export interface LessonOutline {
  id: string;
  slug: string;
  title: LocalizedText;
  estimatedMinutes: number;
  completed: boolean;
}

export interface StepOutline {
  id: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  lessons: LessonOutline[];
  completedCount: number;
  totalMinutes: number;
  isComplete: boolean;
  isPreparing: boolean;
}

export interface PathOutline {
  id: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  stage: StageKey | null;
  tracks: TrackKey[];
  order: number;
  estimatedHours: number;
  outcomes: LocalizedText[];
  steps: StepOutline[];
  totalLessons: number;
  completedLessons: number;
  totalMinutes: number;
  percent: number;
  isStarted: boolean;
  isComplete: boolean;
  nextLesson: (LessonOutline & { stepIndex: number; lessonIndex: number }) | null;
}

export interface StageGroup {
  stage: StageKey;
  paths: PathOutline[];
}

export interface TrackGroups {
  curious: PathOutline[];
  new: StageGroup[];
  muslim: PathOutline[];
}

export interface PlacementSummary {
  stage: StageKey;
  answers: Record<string, string>;
  takenAt: string;
}

export interface LearnerState {
  track: TrackKey | null;
  placement: PlacementSummary | null;
  completedLessonIds: string[];
  currentPath: PathOutline | null;
  recommendedPath: PathOutline | null;
  recommendedIsFallback: boolean;
  startedPaths: PathOutline[];
}

export function pickRecommendedPath(
  outlines: PathOutline[],
  stage: StageKey
): { path: PathOutline | null; isFallback: boolean } {
  const inStage = outlines.filter((p) => p.stage === stage && p.totalLessons > 0);
  const open = inStage.find((p) => !p.isComplete) ?? inStage[0];
  if (open) return { path: open, isFallback: false };

  const stageIndex = STAGES.indexOf(stage);
  for (let i = stageIndex - 1; i >= 0; i--) {
    const earlier = outlines.filter((p) => p.stage === STAGES[i] && p.totalLessons > 0);
    const candidate = earlier.find((p) => !p.isComplete) ?? earlier[earlier.length - 1];
    if (candidate) return { path: candidate, isFallback: true };
  }
  return { path: null, isFallback: true };
}


export function pickTrackPath(outlines: PathOutline[]): PathOutline | null {
  const ready = outlines.filter((p) => p.totalLessons > 0);
  return (
    ready.find((p) => p.isStarted && !p.isComplete) ??
    ready.find((p) => !p.isComplete) ??
    ready[0] ??
    null
  );
}
