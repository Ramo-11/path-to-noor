import "server-only";

import { connectDB } from "@/db/connection";
import { Topic } from "@/db/models/Topic";
import { Module } from "@/db/models/Module";
import { Lesson } from "@/db/models/Lesson";
import { LearningPath } from "@/db/models/LearningPath";
import { Quiz } from "@/db/models/Quiz";
import { User } from "@/db/models/User";
import { Story } from "@/db/models/Story";
import { isStageKey, localized, type StageKey } from "@/lib/stages";
import { lessonAccess } from "@/components/lesson/lesson-access";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QueryParams {
  page: number;
  limit: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildSortOption(sort?: string, order?: "asc" | "desc") {
  const sortField = sort || "createdAt";
  const sortOrder = order === "asc" ? 1 : -1;
  return { [sortField]: sortOrder } as Record<string, 1 | -1>;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---------------------------------------------------------------------------
// Topics
// ---------------------------------------------------------------------------

export async function getTopics(params: QueryParams): Promise<PaginatedResult<InstanceType<typeof Topic>>> {
  await connectDB();

  const { page, limit, search, sort, order } = params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (search) {
    const escaped = escapeRegex(search);
    filter.$or = [
      { "name.en": { $regex: escaped, $options: "i" } },
      { "name.ar": { $regex: escaped, $options: "i" } },
      { "name.es": { $regex: escaped, $options: "i" } },
    ];
  }

  const [data, total] = await Promise.all([
    Topic.find(filter)
      .populate("parent", "name slug")
      .sort(buildSortOption(sort, order))
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Topic.countDocuments(filter),
  ]);

  return {
    data: data as InstanceType<typeof Topic>[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getTopicById(id: string) {
  await connectDB();
  return Topic.findById(id).populate("parent", "name slug").lean();
}

// ---------------------------------------------------------------------------
// Modules
// ---------------------------------------------------------------------------

export async function getModules(params: QueryParams): Promise<PaginatedResult<InstanceType<typeof Module>>> {
  await connectDB();

  const { page, limit, search, sort, order } = params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (search) {
    const escaped = escapeRegex(search);
    filter.$or = [
      { "title.en": { $regex: escaped, $options: "i" } },
      { "title.ar": { $regex: escaped, $options: "i" } },
      { "title.es": { $regex: escaped, $options: "i" } },
    ];
  }

  const [data, total] = await Promise.all([
    Module.find(filter)
      .populate("topics", "name slug")
      .sort(buildSortOption(sort, order))
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Module.countDocuments(filter),
  ]);

  return {
    data: data as InstanceType<typeof Module>[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getModuleById(id: string) {
  await connectDB();
  return Module.findById(id)
    .populate("topics", "name slug")
    .populate("lessons.lessonId", "title slug type")
    .lean();
}

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------

export async function getLessons(params: QueryParams): Promise<PaginatedResult<InstanceType<typeof Lesson>>> {
  await connectDB();

  const { page, limit, search, sort, order } = params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (search) {
    const escaped = escapeRegex(search);
    filter.$or = [
      { "title.en": { $regex: escaped, $options: "i" } },
      { "title.ar": { $regex: escaped, $options: "i" } },
      { "title.es": { $regex: escaped, $options: "i" } },
    ];
  }

  const [data, total] = await Promise.all([
    Lesson.find(filter)
      .sort(buildSortOption(sort, order))
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Lesson.countDocuments(filter),
  ]);

  return {
    data: data as InstanceType<typeof Lesson>[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getLessonById(id: string) {
  await connectDB();
  return Lesson.findById(id).lean();
}

// ---------------------------------------------------------------------------
// Learning Paths
// ---------------------------------------------------------------------------

export async function getLearningPaths(params: QueryParams): Promise<PaginatedResult<InstanceType<typeof LearningPath>>> {
  await connectDB();

  const { page, limit, search, sort, order } = params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (search) {
    const escaped = escapeRegex(search);
    filter.$or = [
      { "title.en": { $regex: escaped, $options: "i" } },
      { "title.ar": { $regex: escaped, $options: "i" } },
      { "title.es": { $regex: escaped, $options: "i" } },
    ];
  }

  const [data, total] = await Promise.all([
    LearningPath.find(filter)
      .sort(buildSortOption(sort, order))
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    LearningPath.countDocuments(filter),
  ]);

  return {
    data: data as InstanceType<typeof LearningPath>[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getLearningPathById(id: string) {
  await connectDB();
  return LearningPath.findById(id)
    .populate("modules.moduleId", "title slug")
    .lean();
}

// ---------------------------------------------------------------------------
// Quizzes
// ---------------------------------------------------------------------------

export async function getQuizzes(params: QueryParams): Promise<PaginatedResult<InstanceType<typeof Quiz>>> {
  await connectDB();

  const { page, limit, sort, order } = params;

  const [data, total] = await Promise.all([
    Quiz.find()
      .populate("lessonId", "title slug")
      .sort(buildSortOption(sort, order))
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Quiz.countDocuments(),
  ]);

  return {
    data: data as InstanceType<typeof Quiz>[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getQuizById(id: string) {
  await connectDB();
  return Quiz.findById(id).populate("lessonId", "title slug").lean();
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function getUsers(
  params: QueryParams,
  roleFilter?: "users_only" | "admins_only"
): Promise<PaginatedResult<InstanceType<typeof User>>> {
  await connectDB();

  const { page, limit, search, sort, order } = params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (roleFilter === "users_only") {
    filter.role = "user";
  } else if (roleFilter === "admins_only") {
    filter.role = { $in: ["admin", "super_admin"] };
  }

  if (search) {
    const escaped = escapeRegex(search);
    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
    ];
  }

  const [data, total] = await Promise.all([
    User.find(filter)
      .select("-progress -bookmarks -completedTopics")
      .sort(buildSortOption(sort, order))
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    data: data as InstanceType<typeof User>[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export async function getStories(params: QueryParams): Promise<PaginatedResult<InstanceType<typeof Story>>> {
  await connectDB();

  const { page, limit, search, sort, order } = params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (search) {
    const escaped = escapeRegex(search);
    filter.$or = [
      { "personName.en": { $regex: escaped, $options: "i" } },
      { "personName.ar": { $regex: escaped, $options: "i" } },
      { "title.en": { $regex: escaped, $options: "i" } },
      { "title.ar": { $regex: escaped, $options: "i" } },
    ];
  }

  const [data, total] = await Promise.all([
    Story.find(filter)
      .sort(buildSortOption(sort, order))
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Story.countDocuments(filter),
  ]);

  return {
    data: data as InstanceType<typeof Story>[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getStoryById(id: string) {
  await connectDB();
  return Story.findById(id).lean();
}

// ===========================================================================
// PUBLIC queries — only return published content
// ===========================================================================

// ---------------------------------------------------------------------------
// Audience filter helper
// ---------------------------------------------------------------------------

interface AudienceContext {
  userType?: string; // "revert" | "mentor" | undefined
  isGuest: boolean;  // true if not logged in
}

function buildAudienceFilter(ctx: AudienceContext) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = { published: true };

  if (ctx.isGuest) {
    filter.guestAccessible = true;
    filter.audience = { $in: ["all", "revert"] };
  } else if (ctx.userType === "revert") {
    filter.audience = { $in: ["all", "revert"] };
  }

  return filter;
}

// ---------------------------------------------------------------------------
// Public: Topics
// ---------------------------------------------------------------------------

export async function getPublicTopics(ctx?: AudienceContext) {
  await connectDB();
  const filter = ctx ? buildAudienceFilter(ctx) : { published: true };
  return Topic.find(filter)
    .populate("parent", "name slug")
    .sort({ order: 1 })
    .lean();
}

export async function getPublicTopicBySlug(slug: string) {
  await connectDB();
  return Topic.findOne({ slug, published: true })
    .populate("parent", "name slug")
    .lean();
}

export async function getPublicSubtopics(parentId: string, ctx?: AudienceContext) {
  await connectDB();
  const filter = ctx ? { ...buildAudienceFilter(ctx), parent: parentId } : { parent: parentId, published: true };
  return Topic.find(filter)
    .sort({ order: 1 })
    .lean();
}

// ---------------------------------------------------------------------------
// Public: Learning Paths
// ---------------------------------------------------------------------------

export async function getPublicLearningPaths(ctx?: AudienceContext) {
  await connectDB();
  const filter = ctx ? buildAudienceFilter(ctx) : { published: true };
  return LearningPath.find(filter)
    .populate({
      path: "modules.moduleId",
      select: "title slug lessons",
      match: { published: true },
    })
    .sort({ order: 1, createdAt: 1 })
    .lean();
}

// ---------------------------------------------------------------------------
// Public: Modules by Topic
// ---------------------------------------------------------------------------

export async function getPublicModulesByTopic(topicId: string, ctx?: AudienceContext) {
  await connectDB();
  const filter = ctx
    ? { ...buildAudienceFilter(ctx), topics: topicId }
    : { topics: topicId, published: true };
  return Module.find(filter)
    .populate({
      path: "lessons.lessonId",
      select: "title slug type estimatedMinutes",
      match: { published: true },
    })
    .sort({ createdAt: -1 })
    .lean();
}

// ---------------------------------------------------------------------------
// Public: Lesson
// ---------------------------------------------------------------------------

export async function getPublicLessonBySlug(slug: string) {
  await connectDB();
  return Lesson.findOne({ slug, published: true }).lean();
}

// ---------------------------------------------------------------------------
// Public: Lesson Navigation Context
// ---------------------------------------------------------------------------

export async function getLessonNavigationContext(lessonId: string, locale: string) {
  await connectDB();

  const lesson = await Lesson.findById(lessonId).select("moduleId").lean();
  if (!lesson) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lessonAny = lesson as any;

  const mod = await Module.findById(lessonAny.moduleId)
    .select("title slug lessons")
    .populate({
      path: "lessons.lessonId",
      select: "title slug",
      match: { published: true },
    })
    .lean();

  if (!mod) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modAny = mod as any;
  const sortedLessons = (modAny.lessons || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((l: any) => l.lessonId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .sort((a: any, b: any) => a.order - b.order);

  const currentIndex = sortedLessons.findIndex(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (l: any) => l.lessonId._id.toString() === lessonId
  );

  const prevLesson =
    currentIndex > 0 ? sortedLessons[currentIndex - 1].lessonId : null;
  const nextLesson =
    currentIndex < sortedLessons.length - 1
      ? sortedLessons[currentIndex + 1].lessonId
      : null;

  // Find a learning path containing this module
  const path = await LearningPath.findOne({
    published: true,
    "modules.moduleId": modAny._id,
  })
    .select("title slug")
    .lean();

  // Suppress unused parameter warning — locale reserved for future per-locale filtering
  void locale;

  return {
    module: {
      title: modAny.title as { en: string; ar: string; es: string },
      slug: modAny.slug as string,
    },
    previousLesson: prevLesson
      ? {
          title: prevLesson.title as { en: string; ar: string; es: string },
          slug: prevLesson.slug as string,
        }
      : null,
    nextLesson: nextLesson
      ? {
          title: nextLesson.title as { en: string; ar: string; es: string },
          slug: nextLesson.slug as string,
        }
      : null,
    currentIndex,
    totalInModule: sortedLessons.length,
    path: path
      ? {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          title: (path as any).title as { en: string; ar: string; es: string },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          slug: (path as any).slug as string,
        }
      : null,
  };
}

// ---------------------------------------------------------------------------
// Public: Quiz by Lesson
// ---------------------------------------------------------------------------

export async function getPublicQuizByLessonId(lessonId: string) {
  await connectDB();
  return Quiz.findOne({ lessonId }).lean();
}

// ---------------------------------------------------------------------------
// Public: Stories (for homepage carousel)
// ---------------------------------------------------------------------------

export async function getPublicStories(limit = 10) {
  await connectDB();
  return Story.find({ published: true })
    .sort({ featured: -1, order: 1, createdAt: -1 })
    .limit(limit)
    .lean();
}

// ---------------------------------------------------------------------------
// Public: Bookmarked Lessons
// ---------------------------------------------------------------------------

export async function getUserBookmarkedLessons(userId: string) {
  await connectDB();
  const user = await User.findById(userId)
    .select("bookmarks")
    .populate({
      path: "bookmarks",
      select: "title slug estimatedMinutes moduleId",
      match: { published: true },
    })
    .lean();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (user as any)?.bookmarks || [];
}

// ---------------------------------------------------------------------------
// Dashboard Stats
// ---------------------------------------------------------------------------

export async function getDashboardStats() {
  await connectDB();

  const [topics, modules, lessons, paths, quizzes, users] = await Promise.all([
    Topic.countDocuments(),
    Module.countDocuments(),
    Lesson.countDocuments(),
    LearningPath.countDocuments(),
    Quiz.countDocuments(),
    User.countDocuments(),
  ]);

  return { topics, modules, lessons, paths, quizzes, users };
}

// ---------------------------------------------------------------------------
// Analytics: Signup Trends (last 30 days)
// ---------------------------------------------------------------------------

export async function getSignupTrends(days = 30) {
  await connectDB();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const results = await User.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Fill in missing days with 0
  const filled: Array<{ date: string; count: number }> = [];
  const current = new Date(startDate);
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  while (current <= now) {
    const dateStr = current.toISOString().split("T")[0];
    const found = results.find((r: { _id: string; count: number }) => r._id === dateStr);
    filled.push({ date: dateStr, count: found?.count || 0 });
    current.setDate(current.getDate() + 1);
  }

  return filled;
}

// ---------------------------------------------------------------------------
// Analytics: Lesson Completion Trends (last 30 days)
// ---------------------------------------------------------------------------

export async function getCompletionTrends(days = 30) {
  await connectDB();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const results = await User.aggregate([
    { $unwind: "$progress" },
    { $match: { "progress.completedAt": { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$progress.completedAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const filled: Array<{ date: string; count: number }> = [];
  const current = new Date(startDate);
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  while (current <= now) {
    const dateStr = current.toISOString().split("T")[0];
    const found = results.find((r: { _id: string; count: number }) => r._id === dateStr);
    filled.push({ date: dateStr, count: found?.count || 0 });
    current.setDate(current.getDate() + 1);
  }

  return filled;
}

// ---------------------------------------------------------------------------
// Analytics: Quiz Activity Trends (last 30 days)
// ---------------------------------------------------------------------------

export async function getQuizActivityTrends(days = 30) {
  await connectDB();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const results = await User.aggregate([
    { $unwind: "$quizResults" },
    { $match: { "quizResults.completedAt": { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$quizResults.completedAt" } },
        total: { $sum: 1 },
        passed: { $sum: { $cond: ["$quizResults.passed", 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const filled: Array<{ date: string; total: number; passed: number }> = [];
  const current = new Date(startDate);
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  while (current <= now) {
    const dateStr = current.toISOString().split("T")[0];
    const found = results.find((r: { _id: string; total: number; passed: number }) => r._id === dateStr);
    filled.push({ date: dateStr, total: found?.total || 0, passed: found?.passed || 0 });
    current.setDate(current.getDate() + 1);
  }

  return filled;
}

// ---------------------------------------------------------------------------
// Analytics: Popular Learning Paths (by enrollment/progress)
// ---------------------------------------------------------------------------

export async function getPopularPaths() {
  await connectDB();

  const paths = await LearningPath.find({ published: true })
    .populate({
      path: "modules.moduleId",
      select: "title lessons",
      populate: {
        path: "lessons.lessonId",
        select: "_id",
      },
    })
    .lean();

  // Get all users with progress
  const usersWithProgress = await User.find(
    { "progress.0": { $exists: true } },
    { progress: 1 }
  ).lean();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return paths.map((path: any) => {
    // Collect all lesson IDs in this path
    const lessonIds = new Set<string>();
    for (const mod of path.modules || []) {
      if (!mod.moduleId) continue;
      for (const lesson of mod.moduleId.lessons || []) {
        if (lesson.lessonId?._id) {
          lessonIds.add(lesson.lessonId._id.toString());
        }
      }
    }

    const totalLessons = lessonIds.size;
    let enrolledUsers = 0;
    let totalCompleted = 0;

    for (const user of usersWithProgress) {
      const userCompletedInPath = user.progress.filter((p) =>
        lessonIds.has(p.lessonId.toString())
      ).length;

      if (userCompletedInPath > 0) {
        enrolledUsers++;
        totalCompleted += userCompletedInPath;
      }
    }

    return {
      _id: path._id.toString(),
      title: path.title,
      totalLessons,
      enrolledUsers,
      avgCompletion: enrolledUsers > 0 && totalLessons > 0
        ? Math.round((totalCompleted / enrolledUsers / totalLessons) * 100)
        : 0,
    };
  });
}

// ---------------------------------------------------------------------------
// Analytics: Path Detail (enrolled users, completion per user)
// ---------------------------------------------------------------------------

export async function getPathAnalytics(pathId: string) {
  await connectDB();

  const path = await LearningPath.findById(pathId)
    .populate({
      path: "modules.moduleId",
      select: "title lessons",
      populate: {
        path: "lessons.lessonId",
        select: "_id title",
      },
    })
    .lean();

  if (!path) return null;

  // Collect all lesson IDs in this path
  const lessonIds = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pathAny = path as any;
  for (const mod of pathAny.modules || []) {
    if (!mod.moduleId) continue;
    for (const lesson of mod.moduleId.lessons || []) {
      if (lesson.lessonId?._id) {
        lessonIds.add(lesson.lessonId._id.toString());
      }
    }
  }

  const totalLessons = lessonIds.size;

  // Get all users who have completed at least one lesson in this path
  const usersWithProgress = await User.find(
    { "progress.0": { $exists: true } },
    { name: 1, email: 1, progress: 1, createdAt: 1 }
  ).lean();

  const enrolledUsers: Array<{
    _id: string;
    name: string;
    email: string;
    completedLessons: number;
    totalLessons: number;
    percentage: number;
    lastActivity: Date;
  }> = [];

  for (const user of usersWithProgress) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userAny = user as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completedInPath = userAny.progress.filter((p: any) =>
      lessonIds.has(p.lessonId.toString())
    );

    if (completedInPath.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lastActivity = completedInPath.reduce((latest: Date, p: any) =>
        p.completedAt > latest ? p.completedAt : latest, completedInPath[0].completedAt
      );

      enrolledUsers.push({
        _id: userAny._id.toString(),
        name: userAny.name,
        email: userAny.email,
        completedLessons: completedInPath.length,
        totalLessons,
        percentage: totalLessons > 0 ? Math.round((completedInPath.length / totalLessons) * 100) : 0,
        lastActivity,
      });
    }
  }

  // Sort by most recently active
  enrolledUsers.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());

  return {
    totalLessons,
    enrolledCount: enrolledUsers.length,
    avgCompletion: enrolledUsers.length > 0
      ? Math.round(enrolledUsers.reduce((sum, u) => sum + u.percentage, 0) / enrolledUsers.length)
      : 0,
    completedCount: enrolledUsers.filter(u => u.percentage === 100).length,
    enrolledUsers,
  };
}

// ---------------------------------------------------------------------------
// Admin: User Detail (full profile with progress data)
// ---------------------------------------------------------------------------

export async function getAdminUserDetail(userId: string) {
  await connectDB();

  const user = await User.findById(userId)
    .select("-password -resetToken -resetTokenExpiry")
    .populate({
      path: "progress.lessonId",
      select: "title slug moduleId",
    })
    .populate({
      path: "bookmarks",
      select: "title slug",
      match: { published: true },
    })
    .populate({
      path: "quizResults.quizId",
      select: "lessonId",
      populate: {
        path: "lessonId",
        select: "title slug",
      },
    })
    .populate({
      path: "completedTopics.topicId",
      select: "name slug icon",
    })
    .populate({
      path: "assignedMentorId",
      select: "name email",
    })
    .lean();

  if (!user) return null;

  // Get all learning paths to compute path-level progress
  const allPaths = await LearningPath.find({ published: true })
    .populate({
      path: "modules.moduleId",
      select: "title lessons",
      populate: {
        path: "lessons.lessonId",
        select: "_id title",
      },
    })
    .lean();

  const completedLessonIds = new Set(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (user as any).progress.map((p: any) =>
      p.lessonId?._id?.toString() || p.lessonId?.toString()
    )
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pathProgress = allPaths.map((path: any) => {
    const modules = (path.modules || [])
      .filter((m: { moduleId: unknown }) => m.moduleId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((m: any) => {
        const lessons = (m.moduleId.lessons || [])
          .filter((l: { lessonId: unknown }) => l.lessonId)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((l: any) => ({
            _id: l.lessonId._id.toString(),
            title: l.lessonId.title,
            completed: completedLessonIds.has(l.lessonId._id.toString()),
          }));

        return {
          _id: m.moduleId._id.toString(),
          title: m.moduleId.title,
          lessons,
          completedCount: lessons.filter((l: { completed: boolean }) => l.completed).length,
          totalLessons: lessons.length,
        };
      });

    const totalLessons = modules.reduce((acc: number, m: { totalLessons: number }) => acc + m.totalLessons, 0);
    const completedCount = modules.reduce((acc: number, m: { completedCount: number }) => acc + m.completedCount, 0);

    return {
      _id: path._id.toString(),
      title: path.title,
      stage: path.stage,
      modules,
      totalLessons,
      completedCount,
      percentage: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
    };
  });

  // Only include paths where user has started at least one lesson
  const activePaths = pathProgress.filter((p) => p.completedCount > 0);

  return {
    user,
    pathProgress: activePaths,
    allPathProgress: pathProgress,
  };
}

export interface LessonSearchResult {
  slug: string;
  title: string;
  minutes: number;
  pathTitle: string | null;
  stepTitle: string | null;
  stage: StageKey | null;
  access: "open" | "signIn";
}

interface SearchEntry extends LessonSearchResult {
  titleKey: string;
  textKey: string;
  audience: string;
  guestAccessible: boolean;
  pathOrder: number;
  lessonOrder: number;
}

const SEARCH_LOCALES = ["en", "ar", "es"] as const;
const SEARCH_TTL_MS = 5 * 60 * 1000;
const searchIndexes = new Map<string, { builtAt: number; entries: SearchEntry[] }>();
const searchBuilds = new Map<string, Promise<SearchEntry[]>>();

function normalizeForSearch(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\p{M}ـ]/gu, "")
    .replace(/[أإآ]/g, "ا")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function collectNodeText(value: unknown, out: string[], depth = 0) {
  if (depth > 40 || !value || typeof value !== "object") return;
  const node = value as { type?: unknown; text?: unknown; attrs?: unknown; content?: unknown };
  if (typeof node.text === "string") out.push(node.text);
  if (node.attrs && typeof node.attrs === "object") {
    for (const [key, attr] of Object.entries(node.attrs as Record<string, unknown>)) {
      if (key === "src" || key === "href" || key === "audio") continue;
      if (typeof attr === "string") out.push(attr);
      else if (Array.isArray(attr)) {
        for (const item of attr) if (typeof item === "string") out.push(item);
      }
    }
  }
  if (Array.isArray(node.content)) {
    for (const child of node.content) collectNodeText(child, out, depth + 1);
  }
}

function lessonPlainText(content: unknown): string {
  const parts: string[] = [];
  collectNodeText(content, parts);
  return parts.join(" ");
}

async function buildSearchIndex(locale: string): Promise<SearchEntry[]> {
  await connectDB();
  const [lessons, modules, paths] = await Promise.all([
    Lesson.find({ published: true })
      .select("title slug estimatedMinutes audience guestAccessible moduleId content")
      .lean(),
    Module.find({ published: true }).select("title lessons").lean(),
    LearningPath.find({ published: true })
      .select("title stage order modules")
      .sort({ order: 1, createdAt: 1 })
      .lean(),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const moduleById = new Map<string, any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const mod of modules as any[]) moduleById.set(mod._id.toString(), mod);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pathByModule = new Map<string, { path: any; index: number }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (paths as any[]).forEach((path, index) => {
    for (const entry of path.modules || []) {
      const mid = entry.moduleId?.toString();
      if (mid && !pathByModule.has(mid)) pathByModule.set(mid, { path, index });
    }
  });

  const entries: SearchEntry[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const lesson of lessons as any[]) {
    const mid = lesson.moduleId?.toString();
    const mod = mid ? moduleById.get(mid) : undefined;
    const placed = mid ? pathByModule.get(mid) : undefined;
    const title = localized(lesson.title, locale);
    const localContent = lesson.content?.[locale];
    const content = lessonPlainText(localContent).length > 0 ? localContent : lesson.content?.en;
    const lessonOrder =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mod?.lessons || []).find((l: any) => l.lessonId?.toString() === lesson._id.toString())?.order ?? 0;

    entries.push({
      slug: lesson.slug,
      title,
      minutes: lesson.estimatedMinutes || 0,
      pathTitle: placed ? localized(placed.path.title, locale) : null,
      stepTitle: mod ? localized(mod.title, locale) : null,
      stage: isStageKey(placed?.path.stage) ? placed!.path.stage : null,
      access: "open",
      titleKey: normalizeForSearch(`${title} ${lesson.title?.en ?? ""}`),
      textKey: normalizeForSearch(lessonPlainText(content)),
      audience: lesson.audience || "all",
      guestAccessible: lesson.guestAccessible !== false,
      pathOrder: placed ? placed.index : 9999,
      lessonOrder,
    });
  }
  return entries;
}

async function getSearchIndex(locale: string): Promise<SearchEntry[]> {
  const cached = searchIndexes.get(locale);
  if (cached && Date.now() - cached.builtAt < SEARCH_TTL_MS) return cached.entries;

  let pending = searchBuilds.get(locale);
  if (!pending) {
    pending = buildSearchIndex(locale)
      .then((entries) => {
        searchIndexes.set(locale, { builtAt: Date.now(), entries });
        return entries;
      })
      .finally(() => searchBuilds.delete(locale));
    searchBuilds.set(locale, pending);
  }
  return pending;
}

export async function searchPublicLessons(
  query: string,
  locale: string,
  user: { id?: string; userType?: string } | null | undefined,
  limit = 20
): Promise<LessonSearchResult[]> {
  const safeLocale = (SEARCH_LOCALES as readonly string[]).includes(locale) ? locale : "en";
  const tokens = normalizeForSearch(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return [];

  const entries = await getSearchIndex(safeLocale);
  const scored: Array<{ entry: SearchEntry; score: number }> = [];

  for (const entry of entries) {
    const access = lessonAccess(entry, user);
    if (access === "hidden") continue;

    const inTitle = tokens.every((token) => entry.titleKey.includes(token));
    const inText = access === "open" && tokens.every((token) => entry.titleKey.includes(token) || entry.textKey.includes(token));
    if (!inTitle && !inText) continue;

    scored.push({ entry, score: inTitle ? 2 : 1 });
  }

  scored.sort(
    (a, b) =>
      b.score - a.score ||
      a.entry.pathOrder - b.entry.pathOrder ||
      a.entry.lessonOrder - b.entry.lessonOrder
  );

  return scored.slice(0, limit).map(({ entry }) => ({
    slug: entry.slug,
    title: entry.title,
    minutes: entry.minutes,
    pathTitle: entry.pathTitle,
    stepTitle: entry.stepTitle,
    stage: entry.stage,
    access: lessonAccess(entry, user) === "signIn" ? "signIn" : "open",
  }));
}
