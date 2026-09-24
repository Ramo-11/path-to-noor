import { useTranslations } from "next-intl";
import { StageGrid } from "@/components/placement/StageGrid";

export function StageSection() {
  const t = useTranslations("home.hero");

  return (
    <section aria-labelledby="home-stages" className="mx-auto w-full max-w-6xl px-4 pt-4 pb-6 sm:px-6 sm:pb-10 lg:px-8">
      <h2 id="home-stages" className="text-heading font-semibold text-balance">
        {t("stagesTitle")}
      </h2>
      <div className="mt-6">
        <StageGrid label={t("stagesTitle")} />
      </div>
    </section>
  );
}
