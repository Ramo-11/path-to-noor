import "server-only";

import { cache } from "react";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { getLessonNavigationContext, getPublicLessonBySlug } from "@/lib/data";
import type { LessonOutline, PathOutline, StepOutline } from "@/lib/learning-types";
import { localized, type Locale, type LocalizedText, type StageKey } from "@/lib/stages";
import { hasRenderableContent } from "./tiptap";

const LOCALES: readonly Locale[] = ["en", "ar", "es"];

export interface LessonRecord {
  id: string;
  slug: string;
  title: LocalizedText;
  content: Record<Locale, unknown>;
  minutes: number;
  audience: string;
  guestAccessible: boolean;
}

export interface NavLesson {
  slug: string;
  title: string;
  stepNumber: number | null;
  stepTitle: string;
  minutes: number;
}

export interface StepCell {
  id: string;
  completed: boolean;
}

export interface LessonPlace {
  path: { slug: string; title: string; stage: StageKey } | null;
  step: { number: number | null; title: string } | null;
  lessonNumber: number | null;
  lessonCount: number | null;
  cells: StepCell[];
  previous: NavLesson | null;
  next: NavLesson | null;
  upNext: NavLesson | null;
  completesStep: boolean;
  completesPath: boolean;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export function toLocale(value: string): Locale {
  return (LOCALES as readonly string[]).includes(value) ? (value as Locale) : "en";
}

export const loadLesson = cache(async (slug: string): Promise<LessonRecord | null> => {
  if (!slug || slug.length > 200) return null;
  const doc = await getPublicLessonBySlug(slug);
  if (!doc) return null;
  const record = asRecord(doc);
  const title = asRecord(record.title);
  const content = asRecord(record.content);
  const minutes = typeof record.estimatedMinutes === "number" ? Math.round(record.estimatedMinutes) : 0;

  return {
    id: String(record._id),
    slug: text(record.slug) || slug,
    title: { en: text(title.en), ar: text(title.ar), es: text(title.es) },
    content: { en: content.en ?? null, ar: content.ar ?? null, es: content.es ?? null },
    minutes: minutes > 0 ? minutes : 0,
    audience: text(record.audience) || "all",
    guestAccessible: record.guestAccessible !== false,
  };
});

export interface PickedContent {
  doc: unknown;
  language: Locale;
  isFallback: boolean;
  hasContent: boolean;
}

export function pickLessonContent(lesson: LessonRecord, locale: string): PickedContent {
  const wanted = toLocale(locale);
  if (hasRenderableContent(lesson.content[wanted])) {
    return { doc: lesson.content[wanted], language: wanted, isFallback: false, hasContent: true };
  }
  if (wanted !== "en" && hasRenderableContent(lesson.content.en)) {
    return { doc: lesson.content.en, language: "en", isFallback: true, hasContent: true };
  }
  return { doc: null, language: wanted, isFallback: false, hasContent: false };
}

export function titleLanguage(title: LocalizedText, locale: string): Locale {
  const wanted = toLocale(locale);
  const value = title[wanted];
  return value && value.trim().length > 0 ? wanted : "en";
}

export async function getLearnerLessonState(
  userId: string | undefined,
  lessonId: string
): Promise<{ completed: Set<string>; saved: boolean }> {
  if (!userId) return { completed: new Set(), saved: false };
  await connectDB();
  const user = asRecord(await User.findById(userId).select("progress bookmarks").lean());
  const progress = Array.isArray(user.progress) ? user.progress : [];
  const bookmarks = Array.isArray(user.bookmarks) ? user.bookmarks : [];
  return {
    completed: new Set(progress.map((entry) => String(asRecord(entry).lessonId))),
    saved: bookmarks.some((id) => String(id) === lessonId),
  };
}

interface FlatLesson {
  lesson: LessonOutline;
  step: StepOutline;
  stepIndex: number;
}

function toNav(entry: FlatLesson, locale: string): NavLesson {
  return {
    slug: entry.lesson.slug,
    title: localized(entry.lesson.title, locale),
    stepNumber: entry.stepIndex + 1,
    stepTitle: localized(entry.step.title, locale),
    minutes: entry.lesson.estimatedMinutes,
  };
}

async function placeWithoutPath(lessonId: string, locale: string): Promise<LessonPlace> {
  const nav = await getLessonNavigationContext(lessonId, locale);
  const empty: LessonPlace = {
    path: null,
    step: null,
    lessonNumber: null,
    lessonCount: null,
    cells: [],
    previous: null,
    next: null,
    upNext: null,
    completesStep: false,
    completesPath: false,
  };
  if (!nav) return empty;

  const stepTitle = localized(nav.module.title, locale);
  const toModuleNav = (lesson: { slug: string; title: LocalizedText } | null): NavLesson | null =>
    lesson
      ? { slug: lesson.slug, title: localized(lesson.title, locale), stepNumber: null, stepTitle, minutes: 0 }
      : null;
  const next = toModuleNav(nav.nextLesson);

  return {
    ...empty,
    step: { number: null, title: stepTitle },
    lessonNumber: nav.currentIndex >= 0 ? nav.currentIndex + 1 : null,
    lessonCount: nav.currentIndex >= 0 ? nav.totalInModule : null,
    previous: toModuleNav(nav.previousLesson),
    next,
    upNext: next,
  };
}

export async function getLessonPlace(
  lessonId: string,
  locale: string,
  path: PathOutline | null,
  signedIn: boolean
): Promise<LessonPlace> {
  const flat: FlatLesson[] = path
    ? path.steps.flatMap((step, stepIndex) => step.lessons.map((lesson) => ({ lesson, step, stepIndex })))
    : [];
  const position = flat.findIndex((entry) => entry.lesson.id === lessonId);
  if (!path || position < 0) return placeWithoutPath(lessonId, locale);

  const here = flat[position];
  const isOpen = (entry: FlatLesson) => entry.lesson.id !== lessonId && !entry.lesson.completed;
  const upNextEntry = signedIn
    ? flat.slice(position + 1).find(isOpen) ?? flat.slice(0, position).find(isOpen) ?? null
    : flat[position + 1] ?? null;

  return {
    path: { slug: path.slug, title: localized(path.title, locale), stage: path.stage },
    step: { number: here.stepIndex + 1, title: localized(here.step.title, locale) },
    lessonNumber: here.step.lessons.findIndex((lesson) => lesson.id === lessonId) + 1,
    lessonCount: here.step.lessons.length,
    cells: here.step.lessons.map((lesson) => ({ id: lesson.id, completed: lesson.completed })),
    previous: position > 0 ? toNav(flat[position - 1], locale) : null,
    next: flat[position + 1] ? toNav(flat[position + 1], locale) : null,
    upNext: upNextEntry ? toNav(upNextEntry, locale) : null,
    completesStep: here.step.lessons.every((lesson) => lesson.id === lessonId || lesson.completed),
    completesPath: flat.every((entry) => entry.lesson.id === lessonId || entry.lesson.completed),
  };
}
