"use client";

import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import {
  PLACEMENT_QUESTIONS,
  computePlacement,
  isCompletePlacement,
  type PlacementAnswers,
  type PlacementResult as ComputedPlacement,
} from "@/lib/placement";
import type { StageKey } from "@/lib/stages";
import { track } from "@/lib/analytics";
import { ExistingIntro, NewIntro } from "./PlacementIntro";
import { PlacementResult, type SaveState } from "./PlacementResult";
import { QuestionStep } from "./QuestionStep";
import { QuestionTabs } from "./QuestionTabs";
import type { Recommendations } from "./recommendations";
import { useStoredPlacement, writeStoredPlacement } from "./storage";

type Phase = "intro" | "questions" | "result";

type SaveBody = { answers: PlacementAnswers } | { stage: StageKey };

interface Outcome {
  answers: PlacementAnswers;
  computed: ComputedPlacement;
  stage: StageKey;
}

interface PlacementFlowProps {
  recommendations: Recommendations | null;
  savedStage: StageKey | null;
  isSignedIn: boolean;
}

const ADVANCE_DELAY = 400;
const TOTAL = PLACEMENT_QUESTIONS.length;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function PlacementFlow({ recommendations, savedStage, isSignedIn }: PlacementFlowProps) {
  const t = useTranslations("start");
  const stored = useStoredPlacement();

  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const failedBody = useRef<SaveBody | null>(null);

  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<PlacementAnswers>>({});
  const [flooding, setFlooding] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [sessionStage, setSessionStage] = useState<StageKey | null>(null);
  const [save, setSave] = useState<SaveState>("idle");
  const [deviceSaved, setDeviceSaved] = useState(true);
  const [interacted, setInteracted] = useState(false);

  const existingStage = sessionStage ?? savedStage ?? stored?.stage ?? null;

  const bringIntoView = useCallback((focusHeading: boolean) => {
    const root = rootRef.current;
    if (root && root.getBoundingClientRect().top < 0) root.scrollIntoView({ block: "start" });
    if (focusHeading) headingRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!interacted) return;
    bringIntoView(phase !== "questions");
  }, [phase, index, interacted, bringIntoView]);

  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    },
    []
  );

  const send = useCallback((body: SaveBody) => {
    setSave("saving");
    saveQueue.current = saveQueue.current.then(async () => {
      try {
        const response = await fetch("/api/user/placement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error(`Placement save failed with ${response.status}`);
        failedBody.current = null;
        setSave("saved");
      } catch {
        failedBody.current = body;
        setSave("error");
      }
    });
  }, []);

  function persist(complete: PlacementAnswers, stage: StageKey, body: SaveBody) {
    setSessionStage(stage);
    if (isSignedIn) {
      send(body);
      return;
    }
    setDeviceSaved(writeStoredPlacement({ answers: complete, stage, takenAt: new Date().toISOString() }));
  }

  function clearAdvance() {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    setFlooding(null);
  }

  function finish(collected: Partial<PlacementAnswers>) {
    if (!isCompletePlacement(collected)) {
      const missing = PLACEMENT_QUESTIONS.findIndex((question) => !collected[question.id]);
      setIndex(Math.max(0, missing));
      return;
    }
    const computed = computePlacement(collected);
    setOutcome({ answers: collected, computed, stage: computed.stage });
    setPhase("result");
    track("placement_completed", { stage: computed.stage });
    persist(collected, computed.stage, { answers: collected });
  }

  function select(optionId: string) {
    if (advanceTimer.current) return;
    const question = PLACEMENT_QUESTIONS[index];
    const collected: Partial<PlacementAnswers> = { ...answers, [question.id]: optionId };
    setInteracted(true);
    setAnswers(collected);
    setFlooding(optionId);
    advanceTimer.current = setTimeout(
      () => {
        advanceTimer.current = null;
        setFlooding(null);
        if (index < TOTAL - 1) {
          setIndex(index + 1);
          return;
        }
        finish(collected);
      },
      prefersReducedMotion() ? 0 : ADVANCE_DELAY
    );
  }

  function begin() {
    clearAdvance();
    setInteracted(true);
    setIndex(0);
    setPhase("questions");
    track("placement_started");
  }

  function retake() {
    clearAdvance();
    setInteracted(true);
    setAnswers({});
    setIndex(0);
    setOutcome(null);
    setSave("idle");
    failedBody.current = null;
    setPhase("questions");
    track("placement_started");
  }

  function back() {
    clearAdvance();
    setInteracted(true);
    if (index === 0) {
      setPhase("intro");
      return;
    }
    setIndex(index - 1);
  }

  function chooseStage(stage: StageKey) {
    if (!outcome) return;
    if (stage !== outcome.stage) {
      setOutcome({ ...outcome, stage });
      persist(outcome.answers, stage, { stage });
    }
    requestAnimationFrame(() => bringIntoView(true));
  }

  function retrySave() {
    if (failedBody.current) send(failedBody.current);
  }

  if (phase === "result" && outcome) {
    return (
      <div ref={rootRef} className="scroll-mt-24 pt-6 pb-20 sm:pt-10 sm:pb-24">
        <PlacementResult
          stage={outcome.stage}
          computedStage={outcome.computed.stage}
          reasons={outcome.computed.reasons}
          learningAlone={outcome.computed.learningAlone}
          recommendation={recommendations ? recommendations[outcome.stage] : null}
          isSignedIn={isSignedIn}
          deviceSaved={deviceSaved}
          save={save}
          headingRef={headingRef}
          onRetrySave={retrySave}
          onChooseStage={chooseStage}
          onRetake={retake}
        />
      </div>
    );
  }

  if (phase === "intro" && existingStage) {
    return (
      <div ref={rootRef} className="scroll-mt-24 pt-6 pb-20 sm:pt-10 sm:pb-24">
        <ExistingIntro
          stage={existingStage}
          recommendation={recommendations ? recommendations[existingStage] : null}
          headingRef={headingRef}
          onRetake={retake}
        />
      </div>
    );
  }

  const question = PLACEMENT_QUESTIONS[index];
  const answered = PLACEMENT_QUESTIONS.map((item) => Boolean(answers[item.id]));

  return (
    <div ref={rootRef} className="scroll-mt-24 pt-6 pb-20 sm:pt-10 sm:pb-24">
      {phase === "intro" ? (
        <NewIntro headingRef={headingRef} onBegin={begin} />
      ) : (
        <div className="mx-auto max-w-2xl">
          <h1 className="sr-only">{t("intro.title")}</h1>
          <QuestionTabs total={TOTAL} current={index} answered={answered} />
          <p aria-live="polite" className="sr-only">
            {t("flow.progress", { current: index + 1, total: TOTAL })}
          </p>
          <div className="mt-8 sm:mt-10">
            <QuestionStep
              key={question.id}
              question={question}
              selected={answers[question.id]}
              flooding={flooding}
              autoFocus={interacted}
              onSelect={select}
            />
          </div>
          <div className="mt-8">
            <Button variant="quiet" onClick={back}>
              <ArrowLeft aria-hidden="true" strokeWidth={1.75} className="size-4 rtl:rotate-180" />
              {t("flow.back")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
