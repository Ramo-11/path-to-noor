"use client";

import { useLocale } from "next-intl";
import { HowItWorks } from "./HowItWorks";
import { LearnerRegion } from "./LearnerRegion";
import { PathsByStage } from "./PathsByStage";
import type { PathOutline } from "@/lib/learning-types";

export function HomeHowItWorks() {
  return <LearnerRegion member={(me) => (me.currentPath ? null : <HowItWorks />)}><HowItWorks /></LearnerRegion>;
}

export function HomePaths({ paths }: { paths: PathOutline[] }) {
  const locale = useLocale();
  return (
    <LearnerRegion
      skeletonClass="min-h-[40rem]"
      member={(me) => (me.paths.length > 0 ? <PathsByStage paths={me.paths} locale={locale} /> : null)}
    >
      {paths.length > 0 ? <PathsByStage paths={paths} locale={locale} /> : null}
    </LearnerRegion>
  );
}
