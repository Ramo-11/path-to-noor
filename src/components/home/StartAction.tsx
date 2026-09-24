"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { Link } from "@/i18n/navigation";
import { STAGES, STAGE_NUMBER, type StageKey } from "@/lib/stages";
import type { StartCandidates } from "@/components/placement/recommendations";
import { useStoredPlacement } from "@/components/placement/storage";

interface StartActionProps {
  candidates: StartCandidates;
  reflectStored: boolean;
}

function Variant({
  visible,
  animate,
  children,
}: {
  visible: boolean;
  animate?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      inert={!visible}
      aria-hidden={visible ? undefined : true}
      className={`col-start-1 row-start-1 flex flex-col items-stretch gap-3 sm:items-start ${
        visible ? (animate ? "settle" : "") : "invisible"
      }`}
    >
      {children}
    </div>
  );
}

export function StartAction({ candidates, reflectStored }: StartActionProps) {
  const t = useTranslations("home.hero");
  const tStages = useTranslations("stages");
  const stored = useStoredPlacement();

  const active: StageKey | null =
    reflectStored && stored && candidates[stored.stage] ? stored.stage : null;

  const arrow = <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-5 shrink-0 rtl:rotate-180" />;

  return (
    <div className="grid">
      <Variant visible={active === null}>
        <Button href="/start" size="lg" className="w-full sm:w-auto">
          {t("start")}
          {arrow}
        </Button>
        <p className="text-meta text-ink-3">{t("startMeta")}</p>
      </Variant>
      {reflectStored
        ? STAGES.map((stage) => {
            const candidate = candidates[stage];
            if (!candidate) return null;
            return (
              <Variant key={stage} visible={active === stage} animate>
                <Button
                  href={candidate.href}
                  size="lg"
                  className="w-full py-3 text-center whitespace-normal! sm:w-auto"
                >
                  {t("continueWith", { title: candidate.title })}
                  {arrow}
                </Button>
                <Link
                  href="/start"
                  className="text-meta text-ink-2 underline decoration-rule-strong transition-colors duration-150 hover:decoration-ink"
                >
                  {t("yourStartingPoint", {
                    number: STAGE_NUMBER[stage],
                    name: tStages(`${stage}.name`),
                  })}
                </Link>
              </Variant>
            );
          })
        : null}
    </div>
  );
}
