import { PLACEMENT_QUESTIONS, type PlacementAnswers } from "@/lib/placement";
import type { StageKey } from "@/lib/stages";

export type StageLevels = Record<StageKey, number>;

const FOUNDATIONS_FROM = 5;
const DEEPER_FROM = 9;
const MAX_SCORE = PLACEMENT_QUESTIONS.reduce(
  (total, question) => total + Math.max(...question.options.map((option) => option.score)),
  0
);

export const EMPTY_LEVELS: StageLevels = { beginning: 0, foundations: 0, deeper: 0 };

function segment(value: number, from: number, to: number): number {
  return Math.max(0, Math.min(1, (value - from + 1) / (to - from + 1)));
}

export function stageLevels(answers: Partial<PlacementAnswers>): StageLevels {
  const answered = PLACEMENT_QUESTIONS.filter((question) => answers[question.id]);
  if (answered.length === 0) return EMPTY_LEVELS;

  const score = answered.reduce(
    (total, question) =>
      total + (question.options.find((option) => option.id === answers[question.id])?.score ?? 0),
    0
  );

  const prayer = answers.prayer;
  const prayerNotStarted = prayer !== undefined && prayer !== "some" && prayer !== "allFive";
  let ceiling = MAX_SCORE;
  if (answers.wudu === "notYet" || prayerNotStarted) {
    ceiling = FOUNDATIONS_FROM - 1;
  } else if (prayer === "some" || answers.quran === "none") {
    ceiling = DEEPER_FROM - 1;
  }

  const value = Math.min(score, ceiling);
  return {
    beginning: segment(value, 0, FOUNDATIONS_FROM - 1),
    foundations: segment(value, FOUNDATIONS_FROM, DEEPER_FROM - 1),
    deeper: segment(value, DEEPER_FROM, MAX_SCORE),
  };
}
