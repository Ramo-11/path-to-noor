export const LESSON_BLOCK_TYPES = [
  "phraseCard",
  "stepList",
  "quickCheck",
  "keyPoint",
  "breakdown",
  "compare",
  "flow",
  "timeline",
  "facts",
  "scenario",
  "moreBlock",
] as const;

export type LessonBlockType = (typeof LESSON_BLOCK_TYPES)[number];

export const FACT_ICONS = [
  "book",
  "heart",
  "sun",
  "moon",
  "star",
  "droplet",
  "hands",
  "home",
  "clock",
  "users",
  "scale",
  "shield",
  "compass",
  "leaf",
  "mountain",
  "sparkles",
  "message",
  "gift",
  "utensils",
  "ban",
  "check",
  "eye",
  "ear",
  "globe",
] as const;

export type FactIcon = (typeof FACT_ICONS)[number];

export const AUDIO_PATH = /^\/audio\/[a-z0-9/_-]+\.mp3$/;

export interface PhraseCardAttrs {
  arabic: string;
  transliteration: string;
  meaning: string;
  audio: string[];
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

export interface BreakdownPart {
  arabic: string;
  transliteration: string;
  meaning: string;
}

export interface BreakdownAttrs {
  parts: BreakdownPart[];
  result: string;
  audio: string[];
}

export interface CompareSide {
  title: string;
  items: string[];
}

export interface CompareAttrs {
  first: CompareSide;
  second: CompareSide;
}

export interface FlowStep {
  label: string;
  text: string;
}

export interface FlowAttrs {
  title: string;
  steps: FlowStep[];
}

export interface TimelineEvent {
  when: string;
  text: string;
}

export interface TimelineAttrs {
  title: string;
  events: TimelineEvent[];
}

export interface FactItem {
  icon: FactIcon | "";
  label: string;
  text: string;
}

export interface FactsAttrs {
  title: string;
  items: FactItem[];
}

export interface ScenarioLine {
  from: "them" | "you";
  text: string;
}

export interface ScenarioAttrs {
  situation: string;
  lines: ScenarioLine[];
}

export interface MoreAttrs {
  title: string;
}

export interface LessonBlockAttrs {
  phraseCard: PhraseCardAttrs;
  stepList: StepListAttrs;
  quickCheck: QuickCheckAttrs;
  keyPoint: KeyPointAttrs;
  breakdown: BreakdownAttrs;
  compare: CompareAttrs;
  flow: FlowAttrs;
  timeline: TimelineAttrs;
  facts: FactsAttrs;
  scenario: ScenarioAttrs;
  moreBlock: MoreAttrs;
}

export const BLOCK_LIMITS = {
  breakdownParts: [2, 8],
  compareItems: [1, 5],
  flowSteps: [2, 7],
  timelineEvents: [2, 10],
  factItems: [2, 6],
  scenarioLines: [1, 6],
} as const;

const MAX_TEXT = 2000;
const MAX_ITEMS = 20;
const MAX_AUDIO = 10;

function text(value: unknown, max = MAX_TEXT): string {
  return typeof value === "string" ? value.slice(0, max) : "";
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function list(value: unknown, max: number): unknown[] {
  return Array.isArray(value) ? value.slice(0, max) : [];
}

function textList(value: unknown, max = MAX_ITEMS): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => text(item, 500))
    .filter((item) => item.trim().length > 0)
    .slice(0, max);
}

function inRange(count: number, [min, max]: readonly [number, number]): boolean {
  return count >= min && count <= max;
}

export function normalizeAudio(value: unknown): string[] {
  const raw = typeof value === "string" ? [value] : Array.isArray(value) ? value : [];
  return raw
    .filter((item): item is string => typeof item === "string" && AUDIO_PATH.test(item))
    .slice(0, MAX_AUDIO);
}

export function invalidAudio(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  const raw = typeof value === "string" ? [value] : Array.isArray(value) ? value : [value];
  return raw.filter((item) => typeof item !== "string" || !AUDIO_PATH.test(item)).map(String);
}

export function normalizePhraseCard(attrs: unknown): PhraseCardAttrs | null {
  const a = record(attrs);
  const result = {
    arabic: text(a.arabic, 500),
    transliteration: text(a.transliteration, 500),
    meaning: text(a.meaning, 1000),
    audio: normalizeAudio(a.audio),
  };
  return result.arabic.trim() ? result : null;
}

export function normalizeStepList(attrs: unknown): StepListAttrs | null {
  const a = record(attrs);
  const steps = textList(a.steps);
  return steps.length > 0 ? { title: text(a.title, 200), steps } : null;
}

export function normalizeQuickCheck(attrs: unknown): QuickCheckAttrs | null {
  const a = record(attrs);
  const options = textList(a.options).slice(0, 6);
  const correctIndex = typeof a.correctIndex === "number" ? Math.trunc(a.correctIndex) : -1;
  const question = text(a.question, 500);
  if (!question.trim() || options.length < 2 || correctIndex < 0 || correctIndex >= options.length) {
    return null;
  }
  return { question, options, correctIndex, explanation: text(a.explanation, 1000) };
}

export function normalizeKeyPoint(attrs: unknown): KeyPointAttrs | null {
  const a = record(attrs);
  const value = text(a.text, 1000);
  return value.trim() ? { text: value } : null;
}

export function normalizeBreakdown(attrs: unknown): BreakdownAttrs | null {
  const a = record(attrs);
  const parts = list(a.parts, BLOCK_LIMITS.breakdownParts[1])
    .map((item) => {
      const p = record(item);
      return {
        arabic: text(p.arabic, 100),
        transliteration: text(p.transliteration, 100),
        meaning: text(p.meaning, 200),
      };
    })
    .filter((part) => part.arabic.trim() && part.meaning.trim());
  if (!inRange(parts.length, BLOCK_LIMITS.breakdownParts)) return null;
  return { parts, result: text(a.result, 300), audio: normalizeAudio(a.audio) };
}

function normalizeSide(value: unknown): CompareSide | null {
  const s = record(value);
  const title = text(s.title, 200);
  const items = textList(s.items, BLOCK_LIMITS.compareItems[1]);
  if (!title.trim() || !inRange(items.length, BLOCK_LIMITS.compareItems)) return null;
  return { title, items };
}

export function normalizeCompare(attrs: unknown): CompareAttrs | null {
  const a = record(attrs);
  const first = normalizeSide(a.first);
  const second = normalizeSide(a.second);
  return first && second ? { first, second } : null;
}

export function normalizeFlow(attrs: unknown): FlowAttrs | null {
  const a = record(attrs);
  const steps = list(a.steps, BLOCK_LIMITS.flowSteps[1])
    .map((item) => {
      const s = record(item);
      return { label: text(s.label, 100), text: text(s.text, 400) };
    })
    .filter((step) => step.label.trim());
  if (!inRange(steps.length, BLOCK_LIMITS.flowSteps)) return null;
  return { title: text(a.title, 200), steps };
}

export function normalizeTimeline(attrs: unknown): TimelineAttrs | null {
  const a = record(attrs);
  const events = list(a.events, BLOCK_LIMITS.timelineEvents[1])
    .map((item) => {
      const e = record(item);
      return { when: text(e.when, 100), text: text(e.text, 400) };
    })
    .filter((event) => event.when.trim() && event.text.trim());
  if (!inRange(events.length, BLOCK_LIMITS.timelineEvents)) return null;
  return { title: text(a.title, 200), events };
}

export function normalizeFacts(attrs: unknown): FactsAttrs | null {
  const a = record(attrs);
  const items = list(a.items, BLOCK_LIMITS.factItems[1])
    .map((item) => {
      const f = record(item);
      const icon: FactIcon | "" = (FACT_ICONS as readonly string[]).includes(f.icon as string)
        ? (f.icon as FactIcon)
        : "";
      return { icon, label: text(f.label, 100), text: text(f.text, 300) };
    })
    .filter((fact) => fact.label.trim());
  if (!inRange(items.length, BLOCK_LIMITS.factItems)) return null;
  return { title: text(a.title, 200), items };
}

export function normalizeScenario(attrs: unknown): ScenarioAttrs | null {
  const a = record(attrs);
  const lines = list(a.lines, BLOCK_LIMITS.scenarioLines[1])
    .map((item) => {
      const l = record(item);
      return { from: l.from === "you" ? ("you" as const) : ("them" as const), text: text(l.text, 400) };
    })
    .filter((line) => line.text.trim());
  if (!inRange(lines.length, BLOCK_LIMITS.scenarioLines)) return null;
  return { situation: text(a.situation, 300), lines };
}

export function normalizeMore(attrs: unknown): MoreAttrs {
  return { title: text(record(attrs).title, 200) };
}

export function invalidFactIcons(items: unknown): string[] {
  return list(items, 50)
    .map((item) => record(item).icon)
    .filter((icon) => icon !== undefined && icon !== "" && !(FACT_ICONS as readonly string[]).includes(icon as string))
    .map(String);
}

export const LESSON_BLOCK_DEFAULTS: LessonBlockAttrs = {
  phraseCard: { arabic: "", transliteration: "", meaning: "", audio: [] },
  stepList: { title: "", steps: [] },
  quickCheck: { question: "", options: ["", ""], correctIndex: 0, explanation: "" },
  keyPoint: { text: "" },
  breakdown: {
    parts: [
      { arabic: "", transliteration: "", meaning: "" },
      { arabic: "", transliteration: "", meaning: "" },
    ],
    result: "",
    audio: [],
  },
  compare: { first: { title: "", items: [""] }, second: { title: "", items: [""] } },
  flow: {
    title: "",
    steps: [
      { label: "", text: "" },
      { label: "", text: "" },
    ],
  },
  timeline: {
    title: "",
    events: [
      { when: "", text: "" },
      { when: "", text: "" },
    ],
  },
  facts: {
    title: "",
    items: [
      { icon: "", label: "", text: "" },
      { icon: "", label: "", text: "" },
    ],
  },
  scenario: { situation: "", lines: [{ from: "them", text: "" }] },
  moreBlock: { title: "" },
};
