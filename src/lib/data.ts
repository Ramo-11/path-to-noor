import "server-only";

import { connectDB } from "@/db/connection";
import { Topic } from "@/db/models/Topic";
import { Module } from "@/db/models/Module";
import { Lesson } from "@/db/models/Lesson";
import { LearningPath } from "@/db/models/LearningPath";
import { Quiz } from "@/db/models/Quiz";
import { User } from "@/db/models/User";

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
    // Guests only see guest-accessible content with audience "all"
    filter.guestAccessible = true;
    filter.audience = "all";
  } else if (ctx.userType) {
    // Logged-in users see content for their type or "all"
    filter.audience = { $in: ["all", ctx.userType] };
  }
  // If logged in but no userType (e.g. admin), see everything published

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
    .sort({ createdAt: -1 })
    .lean();
}

export async function getPublicLearningPathBySlug(slug: string) {
  await connectDB();
  return LearningPath.findOne({ slug, published: true })
    .populate({
      path: "modules.moduleId",
      select: "title slug description lessons",
      populate: {
        path: "lessons.lessonId",
        select: "title slug type estimatedMinutes",
        match: { published: true },
      },
    })
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
// Public: Quiz by Lesson
// ---------------------------------------------------------------------------

export async function getPublicQuizByLessonId(lessonId: string) {
  await connectDB();
  return Quiz.findOne({ lessonId }).lean();
}

// ---------------------------------------------------------------------------
// Public: Homepage stats
// ---------------------------------------------------------------------------

export async function getHomepageStats() {
  await connectDB();
  const [topicCount, pathCount, lessonCount] = await Promise.all([
    Topic.countDocuments({ published: true, parent: null }),
    LearningPath.countDocuments({ published: true }),
    Lesson.countDocuments({ published: true }),
  ]);
  return { topicCount, pathCount, lessonCount, languageCount: 3 };
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
      difficulty: path.difficulty,
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
