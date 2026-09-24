"use client";

import { useTranslations } from "next-intl";
import { STAGE_STYLES, type StageKey } from "@/lib/stages";
import { useStoredStage } from "./useStoredStage";

interface YourStageFlagProps {
  stage: StageKey;
  signedIn: boolean;
  serverStage: StageKey | null;
}

export function YourStageFlag({ stage, signedIn, serverStage }: YourStageFlagProps) {
  const ts = useTranslations("stages");
  const storedStage = useStoredStage(!signedIn);
  const learnerStage = signedIn ? serverStage : storedStage;
  if (learnerStage !== stage) return null;

  const style = STAGE_STYLES[stage];
  return (
    <span
      className={`inline-flex min-h-6 items-center rounded-md px-2 text-meta font-medium ${style.fill} ${style.onFill}`}
    >
      {ts("yourStage")}
    </span>
  );
}
