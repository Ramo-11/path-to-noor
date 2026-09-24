import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { Illustration } from "@/components/primer/Illustration";
import { HomeSection } from "./HomeSection";

export function MentorBlock() {
  const t = useTranslations("home.mentor");

  return (
    <HomeSection labelledBy="home-mentor">
      <div className="grid overflow-hidden rounded-[var(--radius-panel)] bg-stage3-tint md:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-10 sm:px-12 sm:py-14">
          <h2 id="home-mentor" className="text-title font-semibold text-balance">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-[40ch] text-lg text-ink-2 text-pretty">{t("body")}</p>
          <Button href="/mentor" variant="secondary" size="lg" className="mt-8 self-start">
            {t("action")}
          </Button>
        </div>
        <div className="px-3 pb-3 md:py-3 md:ps-0">
          <div className="aspect-[4/3] overflow-hidden rounded-[calc(var(--radius-panel)-0.5rem)] md:aspect-auto md:h-full">
            <Illustration name="mentor" sizes="(min-width: 768px) 50vw, 100vw" />
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
