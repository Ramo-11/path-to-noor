"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/Container";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Trophy,
  RotateCcw,
  Loader2,
} from "lucide-react";

interface QuizQuestion {
  question: { en: string; ar: string };
  options: Array<{ text: { en: string; ar: string }; isCorrect: boolean }>;
  explanation: { en: string; ar: string };
}

interface QuizData {
  _id: string;
  lessonId: string;
  passingScore: number;
  questions: QuizQuestion[];
}

interface QuizResult {
  score: number;
  passed: boolean;
  passingScore: number;
  correctCount: number;
  totalQuestions: number;
  results: Array<{
    questionIndex: number;
    selectedIndex: number;
    correctIndex: number;
    isCorrect: boolean;
    explanation: { en: string; ar: string };
  }>;
}

export default function QuizPage() {
  const params = useParams();
  const slug = params.slug as string;
  const locale = useLocale();
  const t = useTranslations("quiz");
  const tCommon = useTranslations("common");
  const { data: session } = useSession();

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [lessonTitle, setLessonTitle] = useState<{ en: string; ar: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const BackArrow = locale === "ar" ? ArrowRight : ArrowLeft;

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await fetch(`/api/public/quiz/${slug}`);
        const data = await res.json();
        if (data.data) {
          setQuiz(data.data.quiz);
          setLessonTitle(data.data.lessonTitle);
          setAnswers(new Array(data.data.quiz.questions.length).fill(null));
        }
      } catch {
        // quiz not found
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [slug]);

  function selectAnswer(questionIndex: number, optionIndex: number) {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[questionIndex] = optionIndex;
      return updated;
    });
  }

  async function handleSubmit() {
    if (!quiz || !session?.user) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/user/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: quiz._id, answers }),
      });
      const data = await res.json();
      if (data.data) {
        setResult(data.data);
      }
    } catch {
      // error submitting
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetry() {
    setResult(null);
    setAnswers(new Array(quiz?.questions.length || 0).fill(null));
    setCurrentQuestion(0);
  }

  if (loading) {
    return (
      <section className="py-16 sm:py-24">
        <Container size="md">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        </Container>
      </section>
    );
  }

  if (!quiz) {
    return (
      <section className="py-16 sm:py-24">
        <Container size="md">
          <div className="text-center py-16">
            <p className="text-slate-500 dark:text-slate-400">{t("notFound")}</p>
            <Link
              href={`/learn/${slug}`}
              className="mt-4 inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
            >
              <BackArrow className="h-4 w-4" />
              {t("backToLesson")}
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  if (!session?.user) {
    return (
      <section className="py-16 sm:py-24">
        <Container size="md">
          <div className="text-center py-16">
            <p className="text-slate-600 dark:text-slate-400 mb-4">{t("loginRequired")}</p>
            <Link
              href="/login"
              className="inline-flex px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              {t("signInToTakeQuiz")}
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  // Results view
  if (result) {
    return (
      <section className="py-16 sm:py-24">
        <Container size="md">
          <Link
            href={`/learn/${slug}`}
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-8"
          >
            <BackArrow className="h-4 w-4" />
            {t("backToLesson")}
          </Link>

          {/* Score card */}
          <div
            className={`rounded-2xl p-8 sm:p-12 text-center mb-8 border ${
              result.passed
                ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
            }`}
          >
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                result.passed
                  ? "bg-emerald-100 dark:bg-emerald-900/30"
                  : "bg-red-100 dark:bg-red-900/30"
              }`}
            >
              {result.passed ? (
                <Trophy className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
              )}
            </div>
            <h1 className="font-heading text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {result.passed ? t("passed") : t("notPassed")}
            </h1>
            <p className="text-5xl font-bold text-slate-900 dark:text-white mb-2">
              {result.score}%
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              {t("scoreDetail", {
                correct: result.correctCount,
                total: result.totalQuestions,
              })}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
              {t("passingScoreLabel", { score: result.passingScore })}
            </p>

            {!result.passed && (
              <button
                onClick={handleRetry}
                className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                {t("tryAgain")}
              </button>
            )}
          </div>

          {/* Question review */}
          <div className="space-y-6">
            {quiz.questions.map((q, qIndex) => {
              const r = result.results[qIndex];
              return (
                <div
                  key={qIndex}
                  className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6"
                >
                  <div className="flex items-start gap-3 mb-4">
                    {r.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                    )}
                    <p className="font-medium text-slate-900 dark:text-white">
                      {q.question[locale as "en" | "ar"] || q.question.en}
                    </p>
                  </div>
                  <div className="space-y-2 ms-8">
                    {q.options.map((opt, oIndex) => {
                      let cls =
                        "px-3 py-2 rounded-lg text-sm border ";
                      if (oIndex === r.correctIndex) {
                        cls +=
                          "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400";
                      } else if (
                        oIndex === r.selectedIndex &&
                        !r.isCorrect
                      ) {
                        cls +=
                          "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 line-through";
                      } else {
                        cls +=
                          "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400";
                      }
                      return (
                        <div key={oIndex} className={cls}>
                          {opt.text[locale as "en" | "ar"] || opt.text.en}
                        </div>
                      );
                    })}
                  </div>
                  {r.explanation &&
                    (r.explanation[locale as "en" | "ar"] || r.explanation.en) && (
                      <div className="mt-3 ms-8 px-3 py-2 rounded-lg bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800 text-sm text-primary-700 dark:text-primary-400">
                        {r.explanation[locale as "en" | "ar"] || r.explanation.en}
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </Container>
      </section>
    );
  }

  // Quiz-taking view
  const question = quiz.questions[currentQuestion];
  const allAnswered = answers.every((a) => a !== null);
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;

  return (
    <section className="py-16 sm:py-24">
      <Container size="md">
        <Link
          href={`/learn/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-8"
        >
          <BackArrow className="h-4 w-4" />
          {t("backToLesson")}
        </Link>

        {/* Quiz header */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {lessonTitle
              ? `${t("title")}: ${lessonTitle[locale as "en" | "ar"] || lessonTitle.en}`
              : t("title")}
          </h1>
          <div className="decorative-line" />
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-2">
            <span>
              {t("questionOf", {
                current: currentQuestion + 1,
                total: quiz.questions.length,
              })}
            </span>
            <span>
              {answers.filter((a) => a !== null).length}/{quiz.questions.length}{" "}
              {t("answered")}
            </span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-6 sm:p-8 mb-8">
          <p className="text-lg font-medium text-slate-900 dark:text-white mb-6">
            {question.question[locale as "en" | "ar"] || question.question.en}
          </p>

          <div className="space-y-3">
            {question.options.map((option, optIndex) => (
              <button
                key={optIndex}
                type="button"
                onClick={() => selectAnswer(currentQuestion, optIndex)}
                className={`w-full text-start px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  answers[currentQuestion] === optIndex
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-300"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <span className="inline-flex items-center gap-3">
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${
                      answers[currentQuestion] === optIndex
                        ? "bg-primary-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    {String.fromCharCode(65 + optIndex)}
                  </span>
                  {option.text[locale as "en" | "ar"] || option.text.en}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 disabled:opacity-30 hover:text-primary-600 transition-colors"
          >
            {tCommon("previous")}
          </button>

          <div className="flex gap-1.5">
            {quiz.questions.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentQuestion(i)}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  i === currentQuestion
                    ? "bg-primary-600 text-white"
                    : answers[i] !== null
                      ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}
                aria-label={`Question ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {isLastQuestion ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors text-sm"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("submit")
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                setCurrentQuestion((prev) =>
                  Math.min(quiz.questions.length - 1, prev + 1)
                )
              }
              className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              {tCommon("next")}
            </button>
          )}
        </div>
      </Container>
    </section>
  );
}
