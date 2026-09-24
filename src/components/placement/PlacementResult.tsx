"use client";

import { AlertCircle, Check } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { Spinner } from "@/components/primer/Spinner";
import { Link } from "@/i18n/navigation";
import type { PlacementReason } from "@/lib/placement";
import { STAGE_NUMBER, type StageKey } from "@/lib/stages";
import type { Recommendation } from "./recommendations";
import { RecommendedPath } from "./RecommendedPath";
import { StageChooser } from "./StageChooser";
import { StageFill } from "./StageFill";

export type SaveState = "idle" | "saving" | "saved" | "error";

interface PlacementResultProps {
  stage: StageKey;
  computedStage: StageKey;
  reasons: PlacementReason[];
  learningAlone: boolean;
  recommendation: Recommendation | null;
  isSignedIn: boolean;
  deviceSaved: boolean;
  save: SaveState;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onRetrySave: () => void;
  onChooseStage: (stage: StageKey) => void;
  onRetake: () => void;
}

function SaveStatus({ save, onRetry }: { save: SaveState; onRetry: () => void }) {
  const t = useTranslations("start.result.save");

  return (
    <div aria-live="polite" className="mt-6 min-h-11 text-[0.9375rem]">
      {save === "saving" ? (
        <p className="inline-flex min-h-11 items-center gap-2.5 text-ink-2">
          <Spinner className="text-ink-3" />
          {t("saving")}
        </p>
      ) : save === "saved" ? (
        <p className="inline-flex min-h-11 items-center gap-2.5 text-ink-2">
          <Check aria-hidden="true" strokeWidth={2.25} className="size-4 text-stage2-text" />
          {t("saved")}
        </p>
      ) : save === "error" ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <p className="inline-flex min-h-11 items-center gap-2.5 text-ink">
            <AlertCircle aria-hidden="true" strokeWidth={2} className="size-4 shrink-0 text-danger" />
            {t("error")}
          </p>
          <Button variant="quiet" onClick={onRetry}>
            {t("retry")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function PlacementResult({
  stage,
  computedStage,
  reasons,
  learningAlone,
  recommendation,
  isSignedIn,
  deviceSaved,
  save,
  headingRef,
  onRetrySave,
  onChooseStage,
  onRetake,
}: PlacementResultProps) {
  const t = useTranslations("start.result");
  const tStages = useTranslations("stages");
  const [adjusting, setAdjusting] = useState(false);
  const chosen = stage !== computedStage;

  function choose(next: StageKey) {
    setAdjusting(false);
    onChooseStage(next);
  }

  return (
    <div className="settle">
      <section aria-labelledby="placement-result-title" className="grid gap-8 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-12">
        <StageFill key={stage} stage={stage} animate />
        <div className="min-w-0">
          <h1
            id="placement-result-title"
            ref={headingRef}
            tabIndex={-1}
            className="text-title font-semibold text-balance focus-visible:outline-none!"
          >
            {t("title", { number: STAGE_NUMBER[stage], name: tStages(`${stage}.name`) })}
          </h1>
          <p className="mt-4 max-w-[60ch] text-lg text-ink-2 text-pretty">{tStages(`${stage}.long`)}</p>

          {chosen ? (
            <p className="mt-6 text-ink-2">{t("chosen")}</p>
          ) : reasons.length > 0 ? (
            <div className="mt-8">
              <h2 className="font-semibold">{t("reasonsTitle")}</h2>
              <ol className="mt-3 border-t border-rule">
                {reasons.map((reason, index) => (
                  <li key={reason} className="flex gap-4 border-b border-rule py-3.5">
                    <span aria-hidden="true" className="w-4 shrink-0 pt-px font-semibold text-ink-3 tabular">
                      {index + 1}
                    </span>
                    <span className="text-pretty">{t(`reasons.${reason}`)}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {isSignedIn ? <SaveStatus save={save} onRetry={onRetrySave} /> : null}
        </div>
      </section>

      <section aria-labelledby="placement-path-title" className="mt-16 border-t border-rule pt-12 sm:mt-20 sm:pt-16">
        <RecommendedPath recommendation={recommendation} stage={stage} />
      </section>

      {learningAlone ? (
        <section aria-labelledby="placement-mentor-title" className="primer-grid mt-12">
          <div className="flex flex-col items-start gap-6 px-6 py-7 sm:px-8 md:flex-row md:items-center md:justify-between md:gap-12">
            <div className="max-w-[56ch]">
              <h2 id="placement-mentor-title" className="text-heading font-semibold text-balance">
                {t("mentor.title")}
              </h2>
              <p className="mt-2 text-ink-2 text-pretty">{t("mentor.body")}</p>
            </div>
            <Button href="/mentor" variant="secondary" className="shrink-0">
              {t("mentor.action")}
            </Button>
          </div>
        </section>
      ) : null}

      {isSignedIn ? null : (
        <p className="mt-12 max-w-[60ch] text-ink-2 text-pretty">
          {t.rich(deviceSaved ? "guest" : "guestUnsaved", {
            link: (chunks) => (
              <Link
                href="/register"
                className="font-medium text-ink underline decoration-rule-strong transition-colors duration-150 hover:decoration-ink"
              >
                {chunks}
              </Link>
            ),
          })}
        </p>
      )}

      <div className="mt-12 border-t border-rule pt-8">
        <div className="flex flex-col items-start gap-x-8 gap-y-1 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={() => setAdjusting((open) => !open)}
            aria-expanded={adjusting}
            aria-controls="placement-stage-chooser"
            className="inline-flex min-h-11 items-center text-start text-[0.9375rem] font-medium text-ink underline decoration-rule-strong transition-colors duration-150 hover:decoration-ink"
          >
            {adjusting ? t("adjust.close") : t("adjust.open")}
          </button>
          <Button variant="quiet" onClick={onRetake}>
            {t("retake")}
          </Button>
        </div>
        <div id="placement-stage-chooser" hidden={!adjusting} className="settle mt-6">
          {adjusting ? (
            <>
              <h2 className="text-heading font-semibold">{t("adjust.title")}</h2>
              <p className="mt-2 max-w-[60ch] text-ink-2 text-pretty">{t("adjust.hint")}</p>
              <div className="mt-6">
                <StageChooser current={stage} label={t("adjust.title")} onChoose={choose} />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
