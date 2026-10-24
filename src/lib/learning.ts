import "server-only";

import { connectDB } from "@/db/connection";
import { LearningPath } from "@/db/models/LearningPath";
import { Lesson } from "@/db/models/Lesson";
import "@/db/models/Module";
import { User } from "@/db/models/User";
import { STAGES, isStageKey, type LocalizedText, type StageKey } from "@/lib/stages";
import {
  TRACK_PATH_SLUGS,
  isTrackKey,
  normalizeTracks,
  type TrackKey,
} from "@/lib/tracks";
import {
  pickRecommendedPath,
  pickTrackPath,
  type AudienceContext,
  type LearnerState,
  type LessonOutline,
  type PathOutline,
  type PlacementSummary,
  type StageGroup,
  type StepOutline,
  type TrackGroups,
} from "@/lib/learning-types";

export * from "@/lib/learning-types";

function audienceFilter(ctx: AudienceContext) {
  const filter: Record<string, unknown> = { published: true };
  if (ctx.isGuest) {
    filter.guestAccessible = true;
    filter.audience = { $in: ["all", "revert"] };
  } else if (ctx.userType === "revert") {
    filter.audience = { $in: ["all", "revert"] };
  }
  return filter;
}

function toText(value: unknown): LocalizedText {
  const v = (value ?? {}) as Record<string, unknown>;
  return {
    en: typeof v.en === "string" ? v.en : "",
    ar: typeof v.ar === "string" ? v.ar : "",
    es: typeof v.es === "string" ? v.es : "",
  };
}

const PATH_POPULATE = {
  path: "modules.moduleId",
  select: "title slug description lessons published",
  match: { published: true },
  populate: {
    path: "lessons.lessonId",
    select: "title slug estimatedMinutes published",
    match: { published: true },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildOutline(path: any, completed: Set<string>): PathOutline {
  const steps: StepOutline[] = (path.modules || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((entry: any) => entry.moduleId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((entry: any) => {
      const mod = entry.moduleId;
      const lessons: LessonOutline[] = (mod.lessons || [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((l: any) => l.lessonId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((l: any) => {
          const id = l.lessonId._id.toString();
          return {
            id,
            slug: l.lessonId.slug,
            title: toText(l.lessonId.title),
            estimatedMinutes: l.lessonId.estimatedMinutes || 0,
            completed: completed.has(id),
          };
        });
      const completedCount = lessons.filter((l) => l.completed).length;
      return {
        id: mod._id.toString(),
        slug: mod.slug,
        title: toText(mod.title),
        description: toText(mod.description),
        lessons,
        completedCount,
        totalMinutes: lessons.reduce((sum, l) => sum + l.estimatedMinutes, 0),
        isComplete: lessons.length > 0 && completedCount === lessons.length,
        isPreparing: lessons.length === 0,
      };
    });

  const totalLessons = steps.reduce((sum, s) => sum + s.lessons.length, 0);
  const completedLessons = steps.reduce((sum, s) => sum + s.completedCount, 0);

  let nextLesson: PathOutline["nextLesson"] = null;
  outer: for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
    const lessons = steps[stepIndex].lessons;
    for (let lessonIndex = 0; lessonIndex < lessons.length; lessonIndex++) {
      if (!lessons[lessonIndex].completed) {
        nextLesson = { ...lessons[lessonIndex], stepIndex, lessonIndex };
        break outer;
      }
    }
  }

  const tracks = normalizeTracks(path.tracks);
  const stage: StageKey | null = tracks.includes("new")
    ? isStageKey(path.stage)
      ? path.stage
      : "beginning"
    : null;

  return {
    id: path._id.toString(),
    slug: path.slug,
    title: toText(path.title),
    description: toText(path.description),
    stage,
    tracks,
    order: typeof path.order === "number" ? path.order : 1,
    estimatedHours: path.estimatedHours || 0,
    outcomes: Array.isArray(path.outcomes)
      ? path.outcomes.map(toText).filter((o: LocalizedText) => o.en.trim().length > 0)
      : [],
    steps,
    totalLessons,
    completedLessons,
    totalMinutes: steps.reduce((sum, s) => sum + s.totalMinutes, 0),
    percent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    isStarted: completedLessons > 0,
    isComplete: totalLessons > 0 && completedLessons === totalLessons,
    nextLesson,
  };
}

function stageIndex(stage: StageKey | null): number {
  return stage ? STAGES.indexOf(stage) : STAGES.length;
}

function sortOutlines(outlines: PathOutline[]): PathOutline[] {
  return [...outlines].sort(
    (a, b) =>
      Number(b.stage !== null) - Number(a.stage !== null) ||
      stageIndex(a.stage) - stageIndex(b.stage) ||
      a.order - b.order
  );
}

function bySlugOrder(outlines: PathOutline[], slugs: string[]): PathOutline[] {
  return [...outlines].sort((a, b) => {
    const ai = slugs.indexOf(a.slug);
    const bi = slugs.indexOf(b.slug);
    return (ai === -1 ? slugs.length : ai) - (bi === -1 ? slugs.length : bi) || a.order - b.order;
  });
}

function groupByStage(outlines: PathOutline[]): StageGroup[] {
  return STAGES.map((stage) => ({
    stage,
    paths: outlines.filter((p) => p.stage === stage),
  }));
}

export function groupByTrack(outlines: PathOutline[]): TrackGroups {
  return {
    curious: bySlugOrder(
      outlines.filter((p) => p.tracks.includes("curious")),
      TRACK_PATH_SLUGS.curious
    ),
    new: groupByStage(outlines),
    muslim: bySlugOrder(
      outlines.filter((p) => p.tracks.includes("muslim")),
      TRACK_PATH_SLUGS.muslim
    ),
  };
}

export async function getCompletedLessonIds(userId: string | undefined): Promise<Set<string>> {
  if (!userId) return new Set();
  await connectDB();
  const user = await User.findById(userId).select("progress").lean();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const progress = ((user as any)?.progress || []) as Array<{ lessonId: unknown }>;
  return new Set(progress.map((p) => String(p.lessonId)));
}

export async function getPathOutlines(
  ctx: AudienceContext,
  completed: Set<string> = new Set()
): Promise<PathOutline[]> {
  await connectDB();
  const paths = await LearningPath.find(audienceFilter(ctx)).populate(PATH_POPULATE).lean();
  return sortOutlines(paths.map((p) => buildOutline(p, completed)));
}

export async function getPathsByStage(
  ctx: AudienceContext,
  completed: Set<string> = new Set()
): Promise<StageGroup[]> {
  return groupByStage(await getPathOutlines(ctx, completed));
}

export async function getPathsByTrack(
  ctx: AudienceContext,
  completed: Set<string> = new Set()
): Promise<TrackGroups> {
  return groupByTrack(await getPathOutlines(ctx, completed));
}

export async function getTrackPathOutlines(
  track: Exclude<TrackKey, "new">,
  ctx: AudienceContext,
  completed: Set<string> = new Set()
): Promise<Array<{ slug: string; path: PathOutline | null }>> {
  await connectDB();
  const slugs = TRACK_PATH_SLUGS[track];
  const paths = await LearningPath.find({ ...audienceFilter(ctx), slug: { $in: slugs } })
    .populate(PATH_POPULATE)
    .lean();
  const outlines = paths.map((p) => buildOutline(p, completed));
  return slugs.map((slug) => ({ slug, path: outlines.find((p) => p.slug === slug) ?? null }));
}

export async function getPathOutlineBySlug(
  slug: string,
  completed: Set<string> = new Set(),
  ctx: AudienceContext = { isGuest: false }
): Promise<PathOutline | null> {
  await connectDB();
  const path = await LearningPath.findOne({ ...audienceFilter(ctx), slug })
    .populate(PATH_POPULATE)
    .lean();
  return path ? buildOutline(path, completed) : null;
}

export async function getPathForLesson(
  lessonId: string,
  completed: Set<string> = new Set(),
  ctx: AudienceContext = { isGuest: false }
): Promise<PathOutline | null> {
  await connectDB();
  const lesson = await Lesson.findById(lessonId).select("moduleId").lean();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const moduleId = (lesson as any)?.moduleId;
  if (!moduleId) return null;
  const path = await LearningPath.findOne({ ...audienceFilter(ctx), "modules.moduleId": moduleId })
    .populate(PATH_POPULATE)
    .lean();
  return path ? buildOutline(path, completed) : null;
}

export async function getLearnerState(
  userId: string | undefined,
  ctx: AudienceContext
): Promise<LearnerState> {
  let placement: PlacementSummary | null = null;
  let track: TrackKey | null = null;
  let progress: Array<{ lessonId: string; completedAt: Date }> = [];

  if (userId) {
    await connectDB();
    const user = await User.findById(userId).select("progress placement track").lean();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const u = user as any;
    progress = (u?.progress || []).map((p: { lessonId: unknown; completedAt: Date }) => ({
      lessonId: String(p.lessonId),
      completedAt: p.completedAt,
    }));
    track = isTrackKey(u?.track) ? u.track : null;
    if (u?.placement && isStageKey(u.placement.stage)) {
      const answers =
        u.placement.answers instanceof Map
          ? Object.fromEntries(u.placement.answers)
          : (u.placement.answers ?? {});
      placement = {
        stage: u.placement.stage,
        answers,
        takenAt: new Date(u.placement.takenAt).toISOString(),
      };
    }
  }

  const completed = new Set(progress.map((p) => p.lessonId));
  const outlines = await getPathOutlines(ctx, completed);

  const lastDone = [...progress].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
  let currentPath: PathOutline | null = null;
  for (const entry of lastDone) {
    const owner = outlines.find((p) =>
      p.steps.some((s) => s.lessons.some((l) => l.id === entry.lessonId))
    );
    if (owner && !owner.isComplete) {
      currentPath = owner;
      break;
    }
  }

  const recommendation =
    track === "curious" || track === "muslim"
      ? { path: pickTrackPath(groupByTrack(outlines)[track]), isFallback: false }
      : placement
        ? pickRecommendedPath(outlines, placement.stage)
        : { path: null, isFallback: false };

  return {
    track,
    placement,
    completedLessonIds: [...completed],
    currentPath: currentPath ?? (recommendation.path && !recommendation.path.isComplete ? recommendation.path : null),
    recommendedPath: recommendation.path,
    recommendedIsFallback: recommendation.isFallback,
    startedPaths: outlines.filter((p) => p.isStarted),
  };
}
