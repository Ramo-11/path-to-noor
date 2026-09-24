"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { Illustration } from "@/components/primer/Illustration";
import { useStoredPlacement } from "@/components/placement/storage";

export function FinalCall() {
  const t = useTranslations("home");
  const stored = useStoredPlacement();
  if (stored) return null;

  return (
    <section aria-labelledby="home-final" className="mx-auto w-full max-w-6xl px-4 pb-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 rounded-[var(--radius-panel)] bg-stage1-tint p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8 lg:p-10">
        <div className="hidden size-28 shrink-0 overflow-hidden rounded-[var(--radius-cell)] sm:block">
          <Illustration name="sprout" sizes="112px" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 id="home-final" className="text-heading font-semibold text-balance">
            {t("final.title")}
          </h2>
          <p className="mt-2 max-w-[48ch] text-ink-2 text-pretty">{t("final.body")}</p>
        </div>
        <Button href="/start" size="lg" className="w-full shrink-0 sm:w-auto">
          {t("hero.start")}
          <ArrowRight aria-hidden="true" strokeWidth={2} className="size-5 shrink-0 rtl:rotate-180" />
        </Button>
      </div>
    </section>
  );
}
