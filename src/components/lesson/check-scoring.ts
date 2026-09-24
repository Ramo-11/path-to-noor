import type { LocalizedText } from "@/lib/stages";

export interface ScorableQuestion {
  options: ReadonlyArray<{ isCorrect?: boolean | null }>;
  explanation?: { en?: string | null; ar?: string | null; es?: string | null } | null;
}

export type CheckAnswer = number | null;

export interface QuestionResult {
  questionIndex: number;
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: LocalizedText;
}

export interface ScoreSummary {
  results: QuestionResult[];
  answeredCount: number;
  correctCount: number;
  totalQuestions: number;
  passingScore: number;
  complete: boolean;
  score: number | null;
  passed: boolean | null;
}

function toText(value: ScorableQuestion["explanation"]): LocalizedText {
  return {
    en: typeof value?.en === "string" ? value.en : "",
    ar: typeof value?.ar === "string" ? value.ar : "",
    es: typeof value?.es === "string" ? value.es : "",
  };
}

export function answersFit(
  questions: ReadonlyArray<ScorableQuestion>,
  answers: ReadonlyArray<CheckAnswer>
): boolean {
  return (
    answers.length === questions.length &&
    answers.every(
      (answer, index) => answer === null || (answer >= 0 && answer < questions[index].options.length)
    )
  );
}

export function scoreQuiz(
  questions: ReadonlyArray<ScorableQuestion>,
  answers: ReadonlyArray<CheckAnswer>,
  passingScore: number
): ScoreSummary {
  const results: QuestionResult[] = [];
  answers.forEach((answer, questionIndex) => {
    if (answer === null) return;
    const question = questions[questionIndex];
    const correctIndex = question.options.findIndex((option) => option.isCorrect === true);
    results.push({
      questionIndex,
      selectedIndex: answer,
      correctIndex,
      isCorrect: correctIndex >= 0 && answer === correctIndex,
      explanation: toText(question.explanation),
    });
  });

  const correctCount = results.filter((result) => result.isCorrect).length;
  const complete = results.length === questions.length;
  const score = complete ? Math.round((correctCount / questions.length) * 100) : null;

  return {
    results,
    answeredCount: results.length,
    correctCount,
    totalQuestions: questions.length,
    passingScore,
    complete,
    score,
    passed: score === null ? null : score >= passingScore,
  };
}
