// Server-only data queries for admin CRUD operations.
// This file should only be imported in server components and API routes.

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

export async function getUsers(params: QueryParams): Promise<PaginatedResult<InstanceType<typeof User>>> {
  await connectDB();

  const { page, limit, search, sort, order } = params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (search) {
    const escaped = escapeRegex(search);
    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
    ];
  }

  const [data, total] = await Promise.all([
    User.find(filter)
      .select("-progress -bookmarks")
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
// Public: Topics
// ---------------------------------------------------------------------------

export async function getPublicTopics() {
  await connectDB();
  return Topic.find({ published: true })
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

export async function getPublicSubtopics(parentId: string) {
  await connectDB();
  return Topic.find({ parent: parentId, published: true })
    .sort({ order: 1 })
    .lean();
}

// ---------------------------------------------------------------------------
// Public: Learning Paths
// ---------------------------------------------------------------------------

export async function getPublicLearningPaths() {
  await connectDB();
  return LearningPath.find({ published: true })
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

export async function getPublicModulesByTopic(topicId: string) {
  await connectDB();
  return Module.find({ topics: topicId, published: true })
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
// Dashboard Stats
// ---------------------------------------------------------------------------

export async function getDashboardStats() {
  await connectDB();

  const [topics, modules, lessons, paths, users] = await Promise.all([
    Topic.countDocuments(),
    Module.countDocuments(),
    Lesson.countDocuments(),
    LearningPath.countDocuments(),
    User.countDocuments(),
  ]);

  return { topics, modules, lessons, paths, users };
}
