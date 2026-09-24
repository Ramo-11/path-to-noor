import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { HomeSection } from "./HomeSection";

export function MentorBlock() {
  const t = useTranslations("home.mentor");

  return (
    <HomeSection labelledBy="home-mentor">
      <div className="grid gap-6 md:grid-cols-12 md:gap-12">
        <h2 id="home-mentor" className="text-title font-semibold text-balance md:col-span-5">
          {t("title")}
        </h2>
        <div className="md:col-span-7">
          <p className="max-w-[56ch] text-lg text-ink-2 text-pretty sm:text-xl sm:leading-relaxed">
            {t("body")}
          </p>
          <Button href="/mentor" variant="secondary" size="lg" className="mt-8">
            {t("action")}
          </Button>
        </div>
      </div>
    </HomeSection>
  );
}
