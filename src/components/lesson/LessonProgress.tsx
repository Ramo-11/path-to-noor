"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { track } from "@/lib/analytics";
import { STAGE_STYLES, type StageKey } from "@/lib/stages";

type SaveStatus = "idle" | "saving" | "error";

interface LessonProgressValue {
  done: boolean;
  justDone: boolean;
  status: SaveStatus;
  markDone: () => Promise<void>;
}

const LessonProgressContext = createContext<LessonProgressValue | null>(null);

interface ProviderProps {
  lessonId: string;
  lessonSlug?: string;
  initialDone: boolean;
  children: React.ReactNode;
}

export function LessonProgressProvider({ lessonId, lessonSlug, initialDone, children }: ProviderProps) {
  const analyticsKey = lessonSlug ?? lessonId;
  const started = useRef<string | null>(null);
  useEffect(() => {
    if (started.current === analyticsKey) return;
    started.current = analyticsKey;
    track("lesson_started", { lesson: analyticsKey });
  }, [analyticsKey]);
  const router = useRouter();
  const [done, setDone] = useState(initialDone);
  const [justDone, setJustDone] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const inFlight = useRef(false);

  const markDone = useCallback(async () => {
    if (done || inFlight.current) return;
    inFlight.current = true;
    setDone(true);
    setJustDone(true);
    setStatus("saving");
    try {
      const res = await fetch("/api/user/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      if (!res.ok) throw new Error(`progress ${res.status}`);
      setStatus("idle");
      track("lesson_completed", { lesson: analyticsKey });
      try {
        const visits = Number.parseInt(window.localStorage.getItem("bd.visits") ?? "0", 10);
        if (!Number.isFinite(visits) || visits < 2) window.localStorage.setItem("bd.visits", "2");
      } catch {}
      router.refresh();
    } catch {
      setDone(false);
      setJustDone(false);
      setStatus("error");
    } finally {
      inFlight.current = false;
    }
  }, [done, lessonId, router, analyticsKey]);

  const value = useMemo(() => ({ done, justDone, status, markDone }), [done, justDone, status, markDone]);

  return <LessonProgressContext.Provider value={value}>{children}</LessonProgressContext.Provider>;
}

export function useLessonProgress(): LessonProgressValue {
  const value = useContext(LessonProgressContext);
  if (!value) throw new Error("useLessonProgress must be used inside LessonProgressProvider");
  return value;
}

interface StepCellsProps {
  cells: Array<{ id: string; completed: boolean }>;
  currentId: string;
  stage: StageKey;
  className?: string;
}

export function StepCells({ cells, currentId, stage, className = "" }: StepCellsProps) {
  const t = useTranslations("lesson");
  const { done, justDone } = useLessonProgress();
  const style = STAGE_STYLES[stage];
  const total = cells.length;
  const filledCount = cells.filter((cell) => (cell.id === currentId ? done : cell.completed)).length;
  const segmented = total <= 24;

  return (
    <div
      role="progressbar"
      aria-label={t("stepProgressLabel")}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={filledCount}
      aria-valuetext={t("stepProgress", { done: filledCount, total })}
      className={`flex h-2 w-full gap-[3px] ${className}`}
    >
      {segmented ? (
        cells.map((cell) => {
          const isCurrent = cell.id === currentId;
          const filled = isCurrent ? done : cell.completed;
          return (
            <span
              key={cell.id}
              className={`relative h-full flex-1 overflow-hidden rounded-full ${
                isCurrent && !filled ? `${style.fill} opacity-40` : "bg-rule"
              }`}
            >
              {filled ? (
                <span
                  className={`absolute inset-0 ${style.fill} ${isCurrent && justDone ? "fill-in" : ""}`}
                />
              ) : null}
            </span>
          );
        })
      ) : (
        <span className="relative h-full flex-1 overflow-hidden rounded-full bg-rule">
          <span
            className={`absolute inset-y-0 start-0 ${style.fill}`}
            style={{ width: `${Math.round((filledCount / Math.max(total, 1)) * 100)}%` }}
          />
        </span>
      )}
    </div>
  );
}

export function DoneMark() {
  const t = useTranslations("lesson");
  const { done } = useLessonProgress();
  if (!done) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-stage2-tint px-2.5 py-1 text-meta font-medium text-stage2-text">
      <Check aria-hidden="true" strokeWidth={2} className="size-3.5" />
      {t("doneStatus")}
    </span>
  );
}
