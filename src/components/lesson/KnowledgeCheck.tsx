"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/primer/Button";
import { Notice } from "@/components/primer/Notice";
import { localized, type LocalizedText } from "@/lib/stages";

export interface CheckQuestion {
  question: string;
  options: string[];
}

interface Verdict {
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: LocalizedText;
}

interface Summary {
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
}

interface KnowledgeCheckProps {
  slug: string;
  quizId: string;
  questions: CheckQuestion[];
  signedIn: boolean;
  upNext: { slug: string; title: string } | null;
  path: { slug: string; title: string } | null;
}

type ErrorKind = "check" | "finish" | "save" | "changed";
type FocusTarget = "question" | "actions" | "summary";

class ChangedError extends Error {}

interface ScoreResponse {
  results: Array<Verdict & { questionIndex: number }>;
  correctCount: number;
  totalQuestions: number;
  passed: boolean | null;
}

async function postJson(url: string, body: unknown): Promise<ScoreResponse> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status === 409) throw new ChangedError();
  const json = (await res.json().catch(() => null)) as { data?: ScoreResponse } | null;
  if (!res.ok || !json?.data || !Array.isArray(json.data.results)) {
    throw new Error(`score ${res.status}`);
  }
  return json.data;
}

export function KnowledgeCheck({ slug, quizId, questions, signedIn, upNext, path }: KnowledgeCheckProps) {
  const t = useTranslations("check");
  const locale = useLocale();
  const questionHeadingId = useId();
  const total = questions.length;
  const scoreUrl = `/api/public/quiz/${encodeURIComponent(slug)}/score`;

  const [current, setCurrent] = useState(0);
  const [choices, setChoices] = useState<Array<number | null>>(() => questions.map(() => null));
  const [verdicts, setVerdicts] = useState<Array<Verdict | null>>(() => questions.map(() => null));
  const [pending, setPending] = useState<"check" | "finish" | "save" | null>(null);
  const [error, setError] = useState<ErrorKind | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [saved, setSaved] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null);

  const questionRef = useRef<HTMLHeadingElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!focusTarget) return;
    if (focusTarget === "question") questionRef.current?.focus();
    if (focusTarget === "summary") summaryRef.current?.focus();
    if (focusTarget === "actions") actionsRef.current?.querySelector<HTMLElement>("button, a")?.focus();
    setFocusTarget(null);
  }, [focusTarget]);

  const question = questions[current];
  const verdict = verdicts[current];
  const choice = choices[current];
  const remaining = verdicts.filter((v) => v === null).length;
  const allChecked = remaining === 0;

  function goTo(index: number) {
    setCurrent(index);
    setError(null);
    setFocusTarget("question");
  }

  function choose(index: number) {
    if (verdict) return;
    setChoices((prev) => prev.map((value, i) => (i === current ? index : value)));
  }

  async function check() {
    if (choice === null || verdict || pending) return;
    setPending("check");
    setError(null);
    try {
      const answers = questions.map((_, i) => (i === current ? choice : null));
      const data = await postJson(scoreUrl, { answers });
      const result = data.results.find((r) => r.questionIndex === current);
      if (!result) throw new Error("missing result");
      const next: Verdict = {
        selectedIndex: result.selectedIndex,
        correctIndex: result.correctIndex,
        isCorrect: result.isCorrect,
        explanation: result.explanation,
      };
      setVerdicts((prev) => prev.map((value, i) => (i === current ? next : value)));
      const answerText = question.options[next.correctIndex];
      setAnnouncement(
        next.isCorrect
          ? t("right")
          : answerText
            ? `${t("notQuite")} ${t("theAnswer", { answer: answerText })}`
            : t("notQuite")
      );
      setFocusTarget("actions");
    } catch (err) {
      setError(err instanceof ChangedError ? "changed" : "check");
    } finally {
      setPending(null);
    }
  }

  async function saveResult(answers: number[]) {
    const data = await postJson("/api/user/quiz", { quizId, answers });
    setSaved(true);
    return data;
  }

  async function finish() {
    if (pending) return;
    const answers = verdicts.map((v) => v?.selectedIndex ?? -1);
    if (answers.some((a) => a < 0)) return;
    setPending("finish");
    setError(null);
    try {
      let data: ScoreResponse;
      let saveFailed = false;
      if (signedIn) {
        try {
          data = await saveResult(answers);
        } catch (err) {
          if (err instanceof ChangedError) throw err;
          saveFailed = true;
          data = await postJson(scoreUrl, { answers });
        }
      } else {
        data = await postJson(scoreUrl, { answers });
      }
      setSummary({
        correctCount: data.correctCount,
        totalQuestions: data.totalQuestions,
        passed: data.passed === true,
      });
      if (saveFailed) setError("save");
      setFocusTarget("summary");
    } catch (err) {
      setError(err instanceof ChangedError ? "changed" : "finish");
    } finally {
      setPending(null);
    }
  }

  async function retrySave() {
    if (pending) return;
    const answers = verdicts.map((v) => v?.selectedIndex ?? -1);
    setPending("save");
    try {
      await saveResult(answers);
      setError(null);
    } catch (err) {
      setError(err instanceof ChangedError ? "changed" : "save");
    } finally {
      setPending(null);
    }
  }

  function advance() {
    if (allChecked) {
      void finish();
      return;
    }
    const after = verdicts.findIndex((v, i) => i > current && v === null);
    const target = after >= 0 ? after : verdicts.findIndex((v) => v === null);
    if (target >= 0) goTo(target);
  }

  function restart() {
    setCurrent(0);
    setChoices(questions.map(() => null));
    setVerdicts(questions.map(() => null));
    setSummary(null);
    setSaved(false);
    setError(null);
    setAnnouncement("");
    setFocusTarget("question");
  }

  if (error === "changed") {
    return (
      <div className="mt-10 flex flex-col items-start gap-5">
        <Notice tone="info">{t("changed")}</Notice>
        <Button onClick={() => window.location.reload()}>{t("startAgain")}</Button>
      </div>
    );
  }

  if (summary) {
    const lessonHref = `/learn/${slug}`;
    return (
      <section aria-labelledby="check-summary" className="mt-10 sm:mt-12">
        <div className="primer-grid">
          <div className="settle px-6 py-8 sm:px-10 sm:py-10">
            <h2
              id="check-summary"
              ref={summaryRef}
              tabIndex={-1}
              className="text-title font-semibold text-balance tabular"
            >
              {t("summaryTitle", { correct: summary.correctCount, total: summary.totalQuestions })}
            </h2>
            <p className="mt-4 max-w-[56ch] text-lg text-ink-2 text-pretty">
              {summary.passed ? t("summaryWell") : t("summaryAgain")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {summary.passed ? (
                <>
                  {upNext ? (
                    <Button size="lg" href={`/learn/${upNext.slug}`}>
                      {t("continue")}
                      <ArrowRight aria-hidden="true" strokeWidth={2} className="size-[18px] rtl:rotate-180" />
                    </Button>
                  ) : (
                    <Button size="lg" href={path ? `/paths/${path.slug}` : lessonHref}>
                      {path ? t("backToPath") : t("backToLesson")}
                    </Button>
                  )}
                  {upNext || path ? (
                    <Button size="lg" variant="secondary" href={lessonHref}>
                      {t("backToLesson")}
                    </Button>
                  ) : null}
                  <Button variant="quiet" onClick={restart} className="ms-2">
                    {t("tryAgain")}
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" href={lessonHref}>
                    {t("reviewLesson")}
                  </Button>
                  <Button size="lg" variant="secondary" onClick={restart}>
                    {t("tryAgain")}
                  </Button>
                </>
              )}
            </div>
            {summary.passed && upNext ? (
              <p className="mt-4 text-meta text-ink-3">{t("upNextLine", { title: upNext.title })}</p>
            ) : null}
          </div>
          <div className="px-6 py-5 sm:px-10">
            {signedIn ? (
              error === "save" ? (
                <div className="flex flex-col items-start gap-3">
                  <Notice tone="error">{t("saveError")}</Notice>
                  <Button variant="secondary" onClick={retrySave} loading={pending === "save"}>
                    {t("saveAgain")}
                  </Button>
                </div>
              ) : saved ? (
                <p className="inline-flex items-center gap-2 text-ink-2">
                  <Check aria-hidden="true" strokeWidth={2} className="size-4" />
                  {t("savedNote")}
                </p>
              ) : null
            ) : (
              <p className="text-ink-2 text-pretty">
                {t.rich("guestNote", {
                  link: (chunks) => (
                    <Link
                      href="/register"
                      className="font-medium text-ink underline decoration-rule-strong underline-offset-[0.25em] transition-colors duration-150 hover:decoration-ink"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
              </p>
            )}
          </div>
        </div>

        <h3 className="mt-14 text-heading font-semibold">{t("reviewTitle")}</h3>
        <ol className="primer-grid mt-5">
          {questions.map((q, index) => {
            const v = verdicts[index];
            if (!v) return null;
            const answerText = q.options[v.correctIndex];
            return (
              <li key={index} className="flex gap-4 px-5 py-5 sm:px-6">
                <span aria-hidden="true" className="w-7 shrink-0 text-lg font-semibold leading-7 text-ink tabular">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-7 text-ink text-pretty">{q.question}</p>
                  {answerText ? (
                    <p className="mt-1 text-[0.9375rem] text-ink-2">{t("reviewAnswer", { answer: answerText })}</p>
                  ) : null}
                  <p
                    className={`mt-2 inline-flex items-center gap-1.5 text-meta font-medium ${
                      v.isCorrect ? "text-stage2-text" : "text-ink-2"
                    }`}
                  >
                    {v.isCorrect ? <Check aria-hidden="true" strokeWidth={2.5} className="size-3.5" /> : null}
                    {v.isCorrect ? t("reviewRight") : t("reviewNotQuite")}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    );
  }

  const explanation = verdict ? localized(verdict.explanation, locale).trim() : "";
  const correctText = verdict ? question.options[verdict.correctIndex] : undefined;

  return (
    <div className="mt-10 sm:mt-12">
      {total > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <nav aria-label={t("questionsLabel")}>
            <ol className="flex flex-wrap gap-2">
              {questions.map((_, index) => {
                const v = verdicts[index];
                const status = v ? (v.isCorrect ? "right" : "notQuite") : "open";
                const isCurrent = index === current;
                return (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => goTo(index)}
                      aria-current={isCurrent ? "step" : undefined}
                      aria-label={t("tab", { number: index + 1, status })}
                      className={`relative grid size-11 place-items-center overflow-hidden rounded-[var(--radius-control)] text-[0.9375rem] font-semibold text-ink tabular transition-colors duration-150 ${
                        isCurrent ? "border-2 border-ink" : "border border-rule hover:border-rule-strong"
                      }`}
                    >
                      {v ? (
                        <span
                          aria-hidden="true"
                          className={`absolute inset-0 ${v.isCorrect ? "bg-stage2-tint" : "bg-wash"}`}
                        />
                      ) : null}
                      <span className="relative">{index + 1}</span>
                      {v?.isCorrect ? (
                        <Check
                          aria-hidden="true"
                          strokeWidth={2.5}
                          className="absolute end-1 top-1 size-3 text-stage2-text"
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
          <p className="text-meta text-ink-3 tabular">
            {t("questionOf", { current: current + 1, total })}
          </p>
        </div>
      ) : null}

      <fieldset aria-labelledby={questionHeadingId} className="mt-8 min-w-0" key={current}>
        <h2
          id={questionHeadingId}
          ref={questionRef}
          tabIndex={-1}
          className="text-heading font-semibold text-balance"
        >
          {question.question}
        </h2>
        <div className="primer-grid mt-6">
          {question.options.map((option, index) => {
            const isCorrect = verdict ? index === verdict.correctIndex : false;
            const isChosen = verdict ? index === verdict.selectedIndex : choice === index;
            const showCorrect = Boolean(verdict) && isCorrect;
            const showMissed = Boolean(verdict) && isChosen && !isCorrect;
            return (
              <div key={index}>
                <label
                  className={`relative flex min-h-14 w-full items-center gap-4 px-5 py-4 transition-colors duration-150 sm:px-6 ${
                    verdict ? "" : "cursor-pointer hover:bg-wash"
                  }`}
                >
                  {showCorrect ? (
                    <span aria-hidden="true" className="absolute inset-0 bg-stage2-tint fill-in" />
                  ) : null}
                  {showMissed ? <span aria-hidden="true" className="absolute inset-0 bg-wash" /> : null}
                  <input
                    type="radio"
                    name={`check-question-${current}`}
                    value={index}
                    checked={isChosen}
                    onChange={() => choose(index)}
                    disabled={Boolean(verdict)}
                    className="relative order-last size-5 shrink-0 cursor-pointer appearance-none rounded-full border border-rule-strong bg-page transition-[border] duration-150 checked:border-[6px] checked:border-ink disabled:cursor-default"
                  />
                  <span className="relative min-w-0 flex-1 text-[1.0625rem] text-ink text-pretty">{option}</span>
                  {showCorrect ? (
                    <span className="relative inline-flex shrink-0 items-center gap-1.5 text-meta font-medium text-stage2-text">
                      <Check aria-hidden="true" strokeWidth={2.5} className="size-4" />
                      {isChosen ? t("right") : t("correctOption")}
                    </span>
                  ) : null}
                  {showMissed ? (
                    <span className="relative shrink-0 text-meta text-ink-2">{t("yourAnswer")}</span>
                  ) : null}
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>

      {verdict ? (
        <div className="settle mt-6 rounded-[var(--radius-cell)] bg-wash px-5 py-5 sm:px-6">
          <p className="font-semibold text-ink">{verdict.isCorrect ? t("right") : t("notQuite")}</p>
          {!verdict.isCorrect && correctText ? (
            <p className="mt-1 text-ink">{t("theAnswer", { answer: correctText })}</p>
          ) : null}
          {explanation ? <p className="mt-3 whitespace-pre-line text-ink-2">{explanation}</p> : null}
        </div>
      ) : null}

      {error === "check" || error === "finish" ? (
        <Notice tone="error" className="mt-6">
          {error === "check" ? t("checkError") : t("finishError")}
        </Notice>
      ) : null}

      <div ref={actionsRef} className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
        {verdict ? (
          <Button size="lg" onClick={advance} loading={pending === "finish"}>
            {allChecked ? t("seeResult") : t("nextQuestion")}
            {allChecked ? null : (
              <ArrowRight aria-hidden="true" strokeWidth={2} className="size-[18px] rtl:rotate-180" />
            )}
          </Button>
        ) : (
          <Button size="lg" onClick={check} disabled={choice === null} loading={pending === "check"}>
            {t("checkAnswer")}
          </Button>
        )}
        {!verdict && choice === null ? <p className="text-meta text-ink-3">{t("chooseFirst")}</p> : null}
      </div>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
