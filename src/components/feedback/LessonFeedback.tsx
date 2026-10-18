"use client";

import { useId, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Button } from "@/components/primer/Button";
import { Notice } from "@/components/primer/Notice";
import { track } from "@/lib/analytics";

const REASONS = ["incorrect", "translation", "video", "other"] as const;
type Reason = (typeof REASONS)[number];

const NOTE_MAX = 1000;

type Phase = "idle" | "sending" | "done" | "error";

interface LessonFeedbackProps {
  lessonSlug: string;
  className?: string;
}

function storageKey(slug: string, part: string) {
  return `bd.feedback.${part}.${slug}`;
}

function readFlag(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeFlag(key: string) {
  try {
    window.localStorage.setItem(key, "1");
  } catch {
    return;
  }
}

async function send(payload: Record<string, unknown>): Promise<"ok" | "limit" | "error"> {
  try {
    const response = await fetch("/api/public/lesson-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) return "ok";
    return response.status === 429 ? "limit" : "error";
  } catch {
    return "error";
  }
}

const noopSubscribe = () => () => {};

export function LessonFeedback({ lessonSlug, className = "" }: LessonFeedbackProps) {
  const t = useTranslations("feedback");
  const locale = useLocale();
  const formId = useId();

  const [votedNow, setVoted] = useState(false);
  const storedVote = useSyncExternalStore(
    noopSubscribe,
    () => readFlag(storageKey(lessonSlug, "vote")),
    () => false
  );
  const voted = votedNow || storedVote;
  const [votePhase, setVotePhase] = useState<Phase>("idle");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportPhase, setReportPhase] = useState<Phase>("idle");
  const [reportError, setReportError] = useState<string | null>(null);
  const [reason, setReason] = useState<Reason | null>(null);
  const [reasonError, setReasonError] = useState(false);
  const [note, setNote] = useState("");
  const [trap, setTrap] = useState("");

  async function vote(helpful: boolean) {
    setVotePhase("sending");
    const result = await send({
      kind: helpful ? "helpful" : "not_helpful",
      lessonSlug,
      locale,
      website: trap,
    });
    if (result === "ok") {
      writeFlag(storageKey(lessonSlug, "vote"));
      track("lesson_feedback", { lesson: lessonSlug, helpful });
      setVoted(true);
      setVotePhase("done");
      return;
    }
    setVotePhase("error");
  }

  async function submitReport(event: React.FormEvent) {
    event.preventDefault();
    if (reportPhase === "sending") return;
    if (!reason) {
      setReasonError(true);
      return;
    }
    setReasonError(false);
    setReportError(null);
    setReportPhase("sending");
    const result = await send({
      kind: "report",
      lessonSlug,
      locale,
      reason,
      note: note.trim() || undefined,
      website: trap,
    });
    if (result === "ok") {
      track("lesson_reported", { lesson: lessonSlug, reason });
      setReportPhase("done");
      return;
    }
    setReportError(result === "limit" ? t("report.limit") : t("report.error"));
    setReportPhase("error");
  }

  const honeypot = (
    <div aria-hidden="true" className="absolute -start-[9999px] h-0 w-0 overflow-hidden">
      <label>
        {t("trap")}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={trap}
          onChange={(event) => setTrap(event.target.value)}
        />
      </label>
    </div>
  );

  return (
    <section
      aria-labelledby={`${formId}-title`}
      className={`relative rounded-[var(--radius-cell)] border border-rule bg-canvas px-5 py-6 sm:px-7 ${className}`}
    >
      {honeypot}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 id={`${formId}-title`} className="text-lg font-semibold text-ink">
          {t("helpful.title")}
        </h2>

        {voted ? (
          <p role="status" className="inline-flex min-h-11 items-center gap-2 text-ink-2">
            <Check aria-hidden="true" strokeWidth={2.25} className="size-4 text-stage2-text" />
            {t("helpful.thanks")}
          </p>
        ) : (
          <div className="flex gap-3">
            <Button variant="secondary" disabled={votePhase === "sending"} onClick={() => vote(true)}>
              {t("helpful.yes")}
            </Button>
            <Button variant="secondary" disabled={votePhase === "sending"} onClick={() => vote(false)}>
              {t("helpful.no")}
            </Button>
          </div>
        )}
      </div>

      {votePhase === "error" && !voted ? (
        <Notice tone="error" className="mt-4">
          {t("helpful.error")}
        </Notice>
      ) : null}

      <div className="mt-3 border-t border-rule pt-3">
        {reportPhase === "done" ? (
          <p role="status" className="inline-flex min-h-11 items-center gap-2 text-ink-2">
            <Check aria-hidden="true" strokeWidth={2.25} className="size-4 text-stage2-text" />
            {t("report.thanks")}
          </p>
        ) : reportOpen ? (
          <form onSubmit={submitReport} noValidate className="flex flex-col gap-5 pt-2">
            <fieldset aria-describedby={reasonError ? `${formId}-reason-error` : undefined}>
              <legend className="mb-3 text-[0.9375rem] font-medium text-ink">
                {t("report.reasonLabel")}
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {REASONS.map((value) => (
                  <label
                    key={value}
                    className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius-control)] border bg-surface px-4 py-2.5 text-[0.9375rem] text-ink transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${
                      reason === value ? "border-primary bg-primary-tint" : reasonError ? "border-danger" : "border-rule hover:bg-wash"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`${formId}-reason`}
                      value={value}
                      checked={reason === value}
                      onChange={() => {
                        setReason(value);
                        setReasonError(false);
                      }}
                      className="size-4 accent-[var(--primary)]"
                    />
                    {t(`report.reasons.${value}`)}
                  </label>
                ))}
              </div>
              {reasonError ? (
                <p id={`${formId}-reason-error`} role="alert" className="mt-2 text-meta text-danger">
                  {t("report.reasonRequired")}
                </p>
              ) : null}
            </fieldset>

            <div>
              <label htmlFor={`${formId}-note`} className="mb-2 block text-[0.9375rem] font-medium text-ink">
                {t("report.noteLabel")}
              </label>
              <textarea
                id={`${formId}-note`}
                value={note}
                maxLength={NOTE_MAX}
                onChange={(event) => setNote(event.target.value)}
                className="min-h-28 w-full rounded-[var(--radius-control)] border border-rule-strong bg-surface px-4 py-3 text-base leading-relaxed text-ink placeholder:text-ink-3 focus:border-primary focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              />
              <p className="mt-1.5 text-meta text-ink-3 tabular">
                {t("report.noteCount", { count: note.length, max: NOTE_MAX })}
              </p>
            </div>

            {reportError ? <Notice tone="error">{reportError}</Notice> : null}

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" variant="secondary" loading={reportPhase === "sending"}>
                {t("report.send")}
              </Button>
              <Button
                variant="quiet"
                onClick={() => {
                  setReportOpen(false);
                  setReasonError(false);
                  setReportError(null);
                }}
              >
                {t("report.cancel")}
              </Button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            aria-expanded={false}
            className="inline-flex min-h-11 items-center text-[0.9375rem] text-primary underline decoration-primary/30 underline-offset-[0.25em] hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t("report.open")}
          </button>
        )}
      </div>
    </section>
  );
}
