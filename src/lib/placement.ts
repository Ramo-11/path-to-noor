import type { StageKey } from "@/lib/stages";

export type PlacementQuestionId =
  | "shahada"
  | "wudu"
  | "prayer"
  | "quran"
  | "belief"
  | "support";

export interface PlacementQuestion {
  id: PlacementQuestionId;
  options: ReadonlyArray<{ id: string; score: number }>;
}

export const PLACEMENT_QUESTIONS: ReadonlyArray<PlacementQuestion> = [
  {
    id: "shahada",
    options: [
      { id: "weeks", score: 0 },
      { id: "months", score: 1 },
      { id: "year", score: 2 },
      { id: "years", score: 2 },
    ],
  },
  {
    id: "wudu",
    options: [
      { id: "notYet", score: 0 },
      { id: "withGuide", score: 1 },
      { id: "byHeart", score: 2 },
    ],
  },
  {
    id: "prayer",
    options: [
      { id: "notStarted", score: 0 },
      { id: "learning", score: 1 },
      { id: "some", score: 2 },
      { id: "allFive", score: 3 },
    ],
  },
  {
    id: "quran",
    options: [
      { id: "none", score: 0 },
      { id: "fatiha", score: 1 },
      { id: "fewSurahs", score: 2 },
    ],
  },
  {
    id: "belief",
    options: [
      { id: "new", score: 0 },
      { id: "heard", score: 1 },
      { id: "explain", score: 2 },
    ],
  },
  {
    id: "support",
    options: [
      { id: "mentor", score: 0 },
      { id: "community", score: 0 },
      { id: "alone", score: 0 },
    ],
  },
];

export type PlacementAnswers = Record<PlacementQuestionId, string>;

export type PlacementReason =
  | "wuduFirst"
  | "prayerFirst"
  | "prayerConsistency"
  | "quranNext"
  | "beliefNext"
  | "readyForDepth"
  | "solidBasics";

export interface PlacementResult {
  stage: StageKey;
  score: number;
  reasons: PlacementReason[];
  learningAlone: boolean;
}

export function isCompletePlacement(answers: unknown): answers is PlacementAnswers {
  if (!answers || typeof answers !== "object") return false;
  const record = answers as Record<string, unknown>;
  return PLACEMENT_QUESTIONS.every((question) =>
    question.options.some((option) => option.id === record[question.id])
  );
}

function scoreOf(questionId: PlacementQuestionId, answerId: string): number {
  const question = PLACEMENT_QUESTIONS.find((q) => q.id === questionId);
  return question?.options.find((option) => option.id === answerId)?.score ?? 0;
}

export function computePlacement(answers: PlacementAnswers): PlacementResult {
  const score = PLACEMENT_QUESTIONS.reduce(
    (total, question) => total + scoreOf(question.id, answers[question.id]),
    0
  );

  const reasons: PlacementReason[] = [];
  const prayerStarted = answers.prayer === "some" || answers.prayer === "allFive";

  if (answers.wudu === "notYet") reasons.push("wuduFirst");
  if (!prayerStarted) reasons.push("prayerFirst");

  let stage: StageKey;
  if (answers.wudu === "notYet" || !prayerStarted) {
    stage = "beginning";
  } else if (score >= 9 && answers.prayer === "allFive" && answers.quran !== "none") {
    stage = "deeper";
    reasons.push("readyForDepth");
  } else if (score >= 5) {
    stage = "foundations";
    if (answers.prayer === "some") reasons.push("prayerConsistency");
    if (answers.quran !== "fewSurahs") reasons.push("quranNext");
    if (answers.belief !== "explain") reasons.push("beliefNext");
    if (reasons.length === 0) reasons.push("solidBasics");
  } else {
    stage = "beginning";
    if (answers.quran === "none") reasons.push("quranNext");
    if (answers.belief === "new") reasons.push("beliefNext");
  }

  return {
    stage,
    score,
    reasons: reasons.slice(0, 3),
    learningAlone: answers.support === "alone",
  };
}

export const PLACEMENT_STORAGE_KEY = "bd.placement";

export interface StoredPlacement {
  answers: PlacementAnswers;
  stage: StageKey;
  takenAt: string;
}
