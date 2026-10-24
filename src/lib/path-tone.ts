import { pathArt, type IllustrationName } from "@/lib/illustrations";
import { STAGE_STYLES, type StageKey } from "@/lib/stages";

export type ToneStyle = (typeof STAGE_STYLES)[StageKey];

export const NEUTRAL_STYLE: ToneStyle = {
  fill: "bg-primary",
  tint: "bg-primary-tint",
  text: "text-primary",
  onFill: "text-on-primary",
  border: "border-primary",
  glow: "glow-day",
};

const UNSTAGED_ART: Record<string, IllustrationName> = {
  "discover-islam": "lib-questions",
  "walk-with-a-new-muslim": "mentor",
};

export function toneStyle(stage: StageKey | null | undefined): ToneStyle {
  return stage ? STAGE_STYLES[stage] : NEUTRAL_STYLE;
}

export function pathArtFor(slug: string, stage: StageKey | null | undefined): IllustrationName {
  if (stage) return pathArt(slug, stage);
  return UNSTAGED_ART[slug] ?? "journey";
}
