export const LESSON_BLOCK_TYPES = ["phraseCard", "stepList", "quickCheck", "keyPoint"] as const;

export type LessonBlockType = (typeof LESSON_BLOCK_TYPES)[number];

export interface PhraseCardAttrs {
  arabic: string;
  transliteration: string;
  meaning: string;
}

export interface StepListAttrs {
  title: string;
  steps: string[];
}

export interface QuickCheckAttrs {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface KeyPointAttrs {
  text: string;
}

export interface LessonBlockAttrs {
  phraseCard: PhraseCardAttrs;
  stepList: StepListAttrs;
  quickCheck: QuickCheckAttrs;
  keyPoint: KeyPointAttrs;
}

const MAX_TEXT = 2000;
const MAX_ITEMS = 20;

function text(value: unknown, max = MAX_TEXT): string {
  return typeof value === "string" ? value.slice(0, max) : "";
}

function textList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => text(item, 500))
    .filter((item) => item.trim().length > 0)
    .slice(0, MAX_ITEMS);
}

export function normalizePhraseCard(attrs: unknown): PhraseCardAttrs | null {
  const a = (attrs ?? {}) as Record<string, unknown>;
  const result = {
    arabic: text(a.arabic, 500),
    transliteration: text(a.transliteration, 500),
    meaning: text(a.meaning, 1000),
  };
  return result.arabic.trim() ? result : null;
}

export function normalizeStepList(attrs: unknown): StepListAttrs | null {
  const a = (attrs ?? {}) as Record<string, unknown>;
  const steps = textList(a.steps);
  return steps.length > 0 ? { title: text(a.title, 200), steps } : null;
}

export function normalizeQuickCheck(attrs: unknown): QuickCheckAttrs | null {
  const a = (attrs ?? {}) as Record<string, unknown>;
  const options = textList(a.options).slice(0, 6);
  const correctIndex = typeof a.correctIndex === "number" ? Math.trunc(a.correctIndex) : -1;
  const question = text(a.question, 500);
  if (!question.trim() || options.length < 2 || correctIndex < 0 || correctIndex >= options.length) {
    return null;
  }
  return { question, options, correctIndex, explanation: text(a.explanation, 1000) };
}

export function normalizeKeyPoint(attrs: unknown): KeyPointAttrs | null {
  const a = (attrs ?? {}) as Record<string, unknown>;
  const value = text(a.text, 1000);
  return value.trim() ? { text: value } : null;
}

export const LESSON_BLOCK_DEFAULTS: LessonBlockAttrs = {
  phraseCard: { arabic: "", transliteration: "", meaning: "" },
  stepList: { title: "", steps: [] },
  quickCheck: { question: "", options: ["", ""], correctIndex: 0, explanation: "" },
  keyPoint: { text: "" },
};
