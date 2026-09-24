export const STAGES = ["beginning", "foundations", "deeper"] as const;

export type StageKey = (typeof STAGES)[number];

export type Locale = "en" | "ar" | "es";

export type LocalizedText = { en: string; ar?: string; es?: string };

export const STAGE_NUMBER: Record<StageKey, 1 | 2 | 3> = {
  beginning: 1,
  foundations: 2,
  deeper: 3,
};

export const STAGE_STYLES: Record<
  StageKey,
  { fill: string; tint: string; text: string; onFill: string; border: string }
> = {
  beginning: {
    fill: "bg-stage1",
    tint: "bg-stage1-tint",
    text: "text-stage1-text",
    onFill: "text-on-stage",
    border: "border-stage1",
  },
  foundations: {
    fill: "bg-stage2",
    tint: "bg-stage2-tint",
    text: "text-stage2-text",
    onFill: "text-on-stage",
    border: "border-stage2",
  },
  deeper: {
    fill: "bg-stage3",
    tint: "bg-stage3-tint",
    text: "text-stage3-text",
    onFill: "text-on-stage3",
    border: "border-stage3",
  },
};

export function isStageKey(value: unknown): value is StageKey {
  return typeof value === "string" && (STAGES as readonly string[]).includes(value);
}

export function localized(text: LocalizedText | null | undefined, locale: string): string {
  if (!text) return "";
  const value = text[locale as Locale];
  return value && value.trim().length > 0 ? value : text.en;
}
