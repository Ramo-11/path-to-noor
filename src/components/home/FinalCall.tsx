"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { useStoredPlacement } from "@/components/placement/storage";
import { HomeSection } from "./HomeSection";

export function FinalCall() {
  const t = useTranslations("home");
  const stored = useStoredPlacement();
  if (stored) return null;

  return (
    <HomeSection labelledBy="home-final">
      <div className="grid gap-8 md:grid-cols-12 md:items-end md:gap-12">
        <div className="md:col-span-7">
          <h2 id="home-final" className="text-title font-semibold text-balance">
            {t("final.title")}
          </h2>
          <p className="mt-4 max-w-[48ch] text-lg text-ink-2 text-pretty">{t("final.body")}</p>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:items-start md:col-span-5 md:items-end">
          <Button href="/start" size="lg" className="w-full sm:w-auto">
            {t("hero.start")}
            <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-5 shrink-0 rtl:rotate-180" />
          </Button>
          <p className="text-meta text-ink-3">{t("hero.startMeta")}</p>
        </div>
      </div>
    </HomeSection>
  );
}
