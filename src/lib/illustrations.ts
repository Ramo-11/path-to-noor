import type { StageKey } from "@/lib/stages";

export const ILLUSTRATIONS = {
  "hero-dawn": { width: 1024, height: 768 },
  "stage-dawn": { width: 1024, height: 768 },
  "stage-day": { width: 1024, height: 768 },
  "stage-evening": { width: 1024, height: 768 },
  "path-first-steps": { width: 1024, height: 576 },
  "path-daily-life": { width: 1024, height: 576 },
  "path-growing-deeper": { width: 1024, height: 576 },
  "lib-pillars": { width: 1024, height: 768 },
  "lib-prayer": { width: 1024, height: 768 },
  "lib-quran": { width: 1024, height: 768 },
  "lib-halal": { width: 1024, height: 768 },
  "lib-dawah": { width: 1024, height: 768 },
  "lib-supplication": { width: 1024, height: 768 },
  "lib-questions": { width: 1024, height: 768 },
  "lib-hadith": { width: 1024, height: 768 },
  "lib-sahaba": { width: 1024, height: 768 },
  "lib-prophets": { width: 1024, height: 768 },
  mentor: { width: 1024, height: 768 },
  saved: { width: 1024, height: 768 },
  lantern: { width: 1024, height: 768 },
  sprout: { width: 1024, height: 768 },
  journey: { width: 1024, height: 576 },
  welcome: { width: 768, height: 1024 },
} as const;

export type IllustrationName = keyof typeof ILLUSTRATIONS;

export const SMALL_WIDTH = 560;

export const STAGE_ART: Record<StageKey, IllustrationName> = {
  beginning: "stage-dawn",
  foundations: "stage-day",
  deeper: "stage-evening",
};

const PATH_ART: Record<string, IllustrationName> = {
  "res-first-steps-in-islam": "path-first-steps",
  "res-living-as-a-muslim": "path-daily-life",
  "growing-deeper": "path-growing-deeper",
};

const PATH_ART_BY_STAGE: Record<StageKey, IllustrationName> = {
  beginning: "path-first-steps",
  foundations: "path-daily-life",
  deeper: "path-growing-deeper",
};

const LIBRARY_ART: Record<string, IllustrationName> = {
  "pillars-of-faith": "lib-pillars",
  prayer: "lib-prayer",
  quran: "lib-quran",
  "res-halal-and-haram": "lib-halal",
  "res-dawah": "lib-dawah",
  "res-supplication": "lib-supplication",
  "res-common-questions": "lib-questions",
  "res-hadith": "lib-hadith",
  "res-sahaba": "lib-sahaba",
  "res-prophets": "lib-prophets",
};

const LIBRARY_FALLBACK: IllustrationName[] = ["lib-questions", "lib-supplication", "lib-pillars", "lib-hadith"];

export function pathArt(slug: string, stage: StageKey): IllustrationName {
  return PATH_ART[slug] ?? PATH_ART_BY_STAGE[stage];
}

export function libraryArt(slug: string): IllustrationName {
  const known = LIBRARY_ART[slug];
  if (known) return known;
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return LIBRARY_FALLBACK[hash % LIBRARY_FALLBACK.length];
}

export type ArtTone = "dawn" | "day" | "evening" | "sky";

const ART_TONE: Partial<Record<IllustrationName, ArtTone>> = {
  "lib-pillars": "dawn",
  "lib-prayer": "day",
  "lib-quran": "evening",
  "lib-halal": "day",
  "lib-dawah": "dawn",
  "lib-supplication": "evening",
  "lib-questions": "sky",
  "lib-hadith": "dawn",
  "lib-sahaba": "dawn",
  "lib-prophets": "evening",
  mentor: "evening",
  saved: "dawn",
  lantern: "evening",
  sprout: "dawn",
};

export function artTone(name: IllustrationName): ArtTone {
  return ART_TONE[name] ?? "sky";
}
