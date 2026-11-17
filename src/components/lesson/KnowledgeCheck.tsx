"use client";

import { useEffect, useId, useReducer, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Check, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/primer/Button";
import { Notice } from "@/components/primer/Notice";
import { Illustration } from "@/components/primer/Illustration";
import { PathProgress } from "@/components/paths/PathProgress";
import { localized, type LocalizedText, type StageKey } from "@/lib/stages";
import { toneStyle } from "@/lib/path-tone";
import { track } from "@/lib/analytics";

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
  path: { slug: string; title: string; stage: StageKey | null } | null;
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
  const stage: StageKey | null = path?.stage ?? null;
  const stageStyle = toneStyle(stage);

  const [current, setCurrent] = useState(0);
  const [choices, setChoices] = useState<Array<number | null>>(() => questions.map(() => null));
  const [verdicts, setVerdicts] = useState<Array<Verdict | null>>(() => questions.map(() => null));
  const [pending, setPending] = useState<"check" | "finish" | "save" | null>(null);
  const [error, setError] = useState<ErrorKind | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [saved, setSaved] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const focusTargetRef = useRef<FocusTarget | null>(null);
  const [, requestFocus] = useReducer((n: number) => n + 1, 0);
  function setFocusTarget(target: FocusTarget) {
    focusTargetRef.current = target;
    requestFocus();
  }

  const questionRef = useRef<HTMLHeadingElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const focusTarget = focusTargetRef.current;
    if (!focusTarget) return;
    focusTargetRef.current = null;
    if (focusTarget === "question") questionRef.current?.focus();
    if (focusTarget === "summary") summaryRef.current?.focus();
    if (focusTarget === "actions") actionsRef.current?.querySelector<HTMLElement>("button, a")?.focus();
  });

  const question = questions[current];
  const verdict = verdicts[current];
  const choice = choices[current];
  const answeredCount = verdicts.filter((v) => v !== null).length;
  const remaining = total - answeredCount;
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
      track("knowledge_check_completed", {
        lesson: slug,
        score: data.correctCount,
        total: data.totalQuestions,
      });
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
        <div className="overflow-hidden rounded-[var(--radius-panel)] bg-surface">
          <div className="settle grid gap-6 px-6 py-8 sm:grid-cols-[minmax(0,1fr)_9rem] sm:items-center sm:px-10 sm:py-10">
            <div className="min-w-0">
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
            <div className="hidden aspect-square w-full overflow-hidden rounded-[var(--radius-cell)] sm:block">
              <Illustration name="sprout" sizes="144px" />
            </div>
          </div>
          <div className="border-t border-rule px-6 py-5 sm:px-10">
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
        <ol className="mt-5 divide-y divide-rule overflow-hidden rounded-[var(--radius-cell)] border border-rule bg-surface shadow-soft">
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
        <div className="flex flex-col gap-4">
          <PathProgress
            done={answeredCount}
            total={total}
            stage={stage}
            label={t("questionOf", { current: current + 1, total })}
          />
          <nav aria-label={t("questionsLabel")}>
            <ol className="flex flex-wrap gap-2">
              {questions.map((_, index) => {
                const v = verdicts[index];
                const status = v ? (v.isCorrect ? "right" : "notQuite") : "open";
                const isCurrent = index === current;
                const tone = v
                  ? v.isCorrect
                    ? "bg-stage2-tint text-stage2-text"
                    : "bg-danger-tint text-danger"
                  : isCurrent
                    ? `${stageStyle.fill} ${stageStyle.onFill}`
                    : "border border-rule text-ink-2 hover:border-rule-strong";
                return (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => goTo(index)}
                      aria-current={isCurrent ? "step" : undefined}
                      aria-label={t("tab", { number: index + 1, status })}
                      className={`relative grid size-11 place-items-center rounded-full text-[0.9375rem] font-semibold tabular transition-colors duration-150 ${tone}`}
                    >
                      <span>{index + 1}</span>
                      {v?.isCorrect ? (
                        <Check
                          aria-hidden="true"
                          strokeWidth={2.5}
                          className="absolute end-0.5 top-0.5 size-3 text-stage2-text"
                        />
                      ) : null}
                      {v && !v.isCorrect ? (
                        <X aria-hidden="true" strokeWidth={2.5} className="absolute end-0.5 top-0.5 size-3 text-danger" />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
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
        <div className="mt-6 flex flex-col gap-3">
          {question.options.map((option, index) => {
            const isCorrect = verdict ? index === verdict.correctIndex : false;
            const isChosen = verdict ? index === verdict.selectedIndex : choice === index;
            const showCorrect = Boolean(verdict) && isCorrect;
            const showMissed = Boolean(verdict) && isChosen && !isCorrect;
            const tone = showCorrect
              ? "border-stage2 bg-stage2-tint"
              : showMissed
                ? "border-danger bg-danger-tint"
                : isChosen
                  ? "border-primary bg-primary-tint"
                  : "border-rule bg-surface hover:border-rule-strong";
            return (
              <div key={index}>
                <label
                  className={`relative flex min-h-14 w-full items-center gap-3 rounded-full border px-5 py-3.5 transition-colors duration-150 ${tone} ${
                    verdict ? "cursor-default" : "cursor-pointer"
                  }`}
                >
                  <input
                    type="radio"
                    name={`check-question-${current}`}
                    value={index}
                    checked={isChosen}
                    onChange={() => choose(index)}
                    disabled={Boolean(verdict)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`grid size-5 shrink-0 place-items-center rounded-full border transition-colors duration-150 ${
                      isChosen ? "border-primary bg-primary" : "border-rule-strong bg-page"
                    }`}
                  >
                    {isChosen && !verdict ? <span className="size-2 rounded-full bg-on-primary" /> : null}
                  </span>
                  <span className="min-w-0 flex-1 text-[1.0625rem] text-ink text-pretty">{option}</span>
                  {showCorrect ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-meta font-medium text-stage2-text">
                      <Check aria-hidden="true" strokeWidth={2.5} className="size-4" />
                      {isChosen ? t("right") : t("correctOption")}
                    </span>
                  ) : null}
                  {showMissed ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-meta font-medium text-danger">
                      <X aria-hidden="true" strokeWidth={2.5} className="size-4" />
                      {t("yourAnswer")}
                    </span>
                  ) : null}
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>

      {verdict ? (
        <div className="settle mt-6 rounded-[var(--radius-cell)] bg-canvas px-5 py-5 sm:px-6">
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
