import { getPublicSubtopics, getPublicModulesByTopic, getPublicTopics } from "@/lib/data";
import { localized } from "@/lib/stages";
import { connectDB } from "@/db/connection";
import { Module } from "@/db/models/Module";
import { LearningPath } from "@/db/models/LearningPath";
import "@/db/models/Lesson";
import type {
  LibrarySubjectCard,
  SubjectContent,
  SubjectModuleView,
} from "./library-types";

export interface AudienceCtx {
  userType?: string;
  isGuest: boolean;
}

type LocalizedField = { en: string; ar?: string; es?: string };

function moduleAudienceFilter(ctx: AudienceCtx) {
  const filter: Record<string, unknown> = { published: true };
  if (ctx.isGuest) {
    filter.guestAccessible = true;
    filter.audience = { $in: ["all", "revert"] };
  } else if (ctx.userType === "revert") {
    filter.audience = { $in: ["all", "revert"] };
  }
  return filter;
}

export async function buildLibrarySubjects(
  ctx: AudienceCtx,
  locale: string,
  completedLessonIds: Set<string> = new Set(),
  learnedTopicIds: Set<string> = new Set()
): Promise<LibrarySubjectCard[]> {
  const topics = (await getPublicTopics(ctx)) as unknown as {
    _id: { toString(): string };
    slug: string;
    name: LocalizedField;
    description?: LocalizedField;
    parent?: unknown;
  }[];
  const rootTopics = topics.filter((topic) => !topic.parent);
  const rootTopicIds = rootTopics.map((topic) => topic._id.toString());

  await connectDB();
  const modules = (await Module.find({
    ...moduleAudienceFilter(ctx),
    topics: { $in: rootTopicIds },
  })
    .select("topics lessons")
    .populate({ path: "lessons.lessonId", select: "_id", match: { published: true } })
    .lean()) as unknown as {
    topics?: { toString(): string }[];
    lessons?: { lessonId?: { _id: { toString(): string } } }[];
  }[];

  const lessonCountByTopic = new Map<string, number>();
  const completedCountByTopic = new Map<string, number>();
  for (const mod of modules) {
    const published = (mod.lessons || []).filter((entry) => entry.lessonId);
    const completedInModule = published.filter((entry) =>
      completedLessonIds.has(entry.lessonId!._id.toString())
    ).length;
    for (const topicId of mod.topics || []) {
      const tid = topicId.toString();
      lessonCountByTopic.set(tid, (lessonCountByTopic.get(tid) || 0) + published.length);
      if (completedInModule > 0) {
        completedCountByTopic.set(tid, (completedCountByTopic.get(tid) || 0) + completedInModule);
      }
    }
  }

  return rootTopics.map((topic) => {
    const id = topic._id.toString();
    return {
      id,
      slug: topic.slug,
      name: localized(topic.name, locale),
      description: localized(topic.description, locale),
      lessonCount: lessonCountByTopic.get(id) || 0,
      completedCount: completedCountByTopic.get(id) || 0,
      isLearned: learnedTopicIds.has(id),
    };
  });
}

export async function buildSubjectContent(
  topicId: string,
  ctx: AudienceCtx,
  locale: string
): Promise<SubjectContent> {
  const [subtopics, modules] = await Promise.all([
    getPublicSubtopics(topicId, ctx),
    getPublicModulesByTopic(topicId, ctx),
  ]);

  const rawModules = modules as unknown as {
    _id: { toString(): string };
    title: LocalizedField;
    description?: LocalizedField;
    lessons?: {
      order?: number;
      lessonId?: {
        _id: { toString(): string };
        slug: string;
        title: LocalizedField;
        type: string;
        estimatedMinutes?: number;
      } | null;
    }[];
  }[];

  await connectDB();
  const moduleIds = rawModules.map((mod) => mod._id.toString());
  const paths = (await LearningPath.find({
    published: true,
    "modules.moduleId": { $in: moduleIds },
  })
    .select("title slug modules.moduleId")
    .lean()) as unknown as {
    title: LocalizedField;
    slug: string;
    modules?: { moduleId?: { toString(): string } }[];
  }[];

  const pathByModuleId = new Map<string, { slug: string; title: string }>();
  for (const path of paths) {
    for (const entry of path.modules || []) {
      if (!entry.moduleId) continue;
      const mid = entry.moduleId.toString();
      if (!pathByModuleId.has(mid)) {
        pathByModuleId.set(mid, { slug: path.slug, title: localized(path.title, locale) });
      }
    }
  }

  const moduleViews: SubjectModuleView[] = rawModules.map((mod) => ({
    id: mod._id.toString(),
    title: localized(mod.title, locale),
    description: mod.description ? localized(mod.description, locale) : "",
    path: pathByModuleId.get(mod._id.toString()) ?? null,
    lessons: (mod.lessons || [])
      .filter((entry) => entry.lessonId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((entry) => ({
        id: entry.lessonId!._id.toString(),
        slug: entry.lessonId!.slug,
        title: localized(entry.lessonId!.title, locale),
        type: entry.lessonId!.type,
        minutes: entry.lessonId!.estimatedMinutes ?? 0,
      })),
  }));

  return {
    subtopics: (subtopics as unknown as { _id: { toString(): string }; slug: string; name: LocalizedField }[]).map((sub) => ({
      id: sub._id.toString(),
      slug: sub.slug,
      name: localized(sub.name, locale),
    })),
    modules: moduleViews,
  };
}
