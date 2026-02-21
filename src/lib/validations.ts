import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const bilingualString = z.object({
  en: z.string().min(1, "English text is required"),
  ar: z.string().min(1, "Arabic text is required"),
});

const bilingualStringOptional = z.object({
  en: z.string().min(1, "English text is required").optional(),
  ar: z.string().min(1, "Arabic text is required").optional(),
});

const bilingualAny = z.object({
  en: z.any(),
  ar: z.any(),
});

const slugField = z
  .string()
  .min(1, "Slug is required")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must be lowercase alphanumeric with hyphens"
  );

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const objectIdString = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

// ---------------------------------------------------------------------------
// Pagination (used by admin list pages to parse searchParams)
// ---------------------------------------------------------------------------

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

// ---------------------------------------------------------------------------
// Topic
// ---------------------------------------------------------------------------

export const createTopicSchema = z.object({
  name: bilingualString,
  description: bilingualString,
  slug: slugField.optional(),
  icon: z.string().default(""),
  parent: objectIdString.nullable().default(null),
  order: z.number().int().min(1).default(1),
  published: z.boolean().default(false),
});

export const updateTopicSchema = z.object({
  name: bilingualStringOptional.optional(),
  description: bilingualStringOptional.optional(),
  slug: slugField.optional(),
  icon: z.string().optional(),
  parent: objectIdString.nullable().optional(),
  order: z.number().int().min(1).optional(),
  published: z.boolean().optional(),
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;

// ---------------------------------------------------------------------------
// Module
// ---------------------------------------------------------------------------

export const createModuleSchema = z.object({
  title: bilingualString,
  description: bilingualString,
  slug: slugField.optional(),
  thumbnail: z.string().default(""),
  topics: z.array(objectIdString).default([]),
  lessons: z
    .array(
      z.object({
        lessonId: objectIdString,
        order: z.number().int().min(1).default(1),
      })
    )
    .default([]),
  published: z.boolean().default(false),
});

export const updateModuleSchema = z.object({
  title: bilingualStringOptional.optional(),
  description: bilingualStringOptional.optional(),
  slug: slugField.optional(),
  thumbnail: z.string().optional(),
  topics: z.array(objectIdString).optional(),
  lessons: z
    .array(
      z.object({
        lessonId: objectIdString,
        order: z.number().int().min(1).default(1),
      })
    )
    .optional(),
  published: z.boolean().optional(),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;

// ---------------------------------------------------------------------------
// Lesson
// ---------------------------------------------------------------------------

export const createLessonSchema = z.object({
  title: bilingualString,
  content: bilingualAny.default({ en: null, ar: null }),
  slug: slugField.optional(),
  moduleId: objectIdString,
  estimatedMinutes: z.number().int().positive().default(5),
  published: z.boolean().default(false),
});

export const updateLessonSchema = z.object({
  title: bilingualStringOptional.optional(),
  content: bilingualAny.optional(),
  slug: slugField.optional(),
  moduleId: objectIdString.optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  published: z.boolean().optional(),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;

// ---------------------------------------------------------------------------
// Learning Path
// ---------------------------------------------------------------------------

export const createLearningPathSchema = z.object({
  title: bilingualString,
  description: bilingualString,
  slug: slugField.optional(),
  thumbnail: z.string().default(""),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  estimatedHours: z.number().positive().default(1),
  modules: z
    .array(
      z.object({
        moduleId: objectIdString,
        order: z.number().int().min(1).default(1),
      })
    )
    .default([]),
  published: z.boolean().default(false),
});

export const updateLearningPathSchema = z.object({
  title: bilingualStringOptional.optional(),
  description: bilingualStringOptional.optional(),
  slug: slugField.optional(),
  thumbnail: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  estimatedHours: z.number().positive().optional(),
  modules: z
    .array(
      z.object({
        moduleId: objectIdString,
        order: z.number().int().min(1).default(1),
      })
    )
    .optional(),
  published: z.boolean().optional(),
});

export type CreateLearningPathInput = z.infer<typeof createLearningPathSchema>;
export type UpdateLearningPathInput = z.infer<typeof updateLearningPathSchema>;

// ---------------------------------------------------------------------------
// Quiz
// ---------------------------------------------------------------------------

const quizOptionSchema = z.object({
  text: bilingualString,
  isCorrect: z.boolean(),
});

const quizQuestionSchema = z.object({
  question: bilingualString,
  options: z.array(quizOptionSchema).min(2, "At least 2 options are required"),
  explanation: bilingualString.optional().default({ en: "", ar: "" }),
});

export const createQuizSchema = z.object({
  lessonId: objectIdString,
  required: z.boolean().default(false),
  passingScore: z.number().min(0).max(100).default(70),
  questions: z.array(quizQuestionSchema).min(1, "At least 1 question is required"),
});

export const updateQuizSchema = z.object({
  lessonId: objectIdString.optional(),
  required: z.boolean().optional(),
  passingScore: z.number().min(0).max(100).optional(),
  questions: z
    .array(quizQuestionSchema)
    .min(1, "At least 1 question is required")
    .optional(),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;

// ---------------------------------------------------------------------------
// User (update only — users are created via auth providers)
// ---------------------------------------------------------------------------

export const updateUserSchema = z.object({
  role: z.enum(["super_admin", "admin", "user"]).optional(),
  isActive: z.boolean().optional(),
  preferredLanguage: z.enum(["en", "ar"]).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
