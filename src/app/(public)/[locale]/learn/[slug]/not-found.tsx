import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";

export default function LessonNotFound() {
  const t = useTranslations("lesson");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-12 pb-20 sm:px-6 sm:pt-16 sm:pb-28 lg:px-8">
      <h1 className="text-title font-semibold text-balance">{t("notFoundTitle")}</h1>
      <div className="mt-10">
        <EmptyState
          title={t("notFoundLead")}
          body={t("notFoundBody")}
          art="lantern"
          action={
            <div className="flex flex-wrap gap-3">
              <Button size="lg" href="/paths">
                {t("seeAllPaths")}
              </Button>
              <Button size="lg" variant="secondary" href="/library">
                {t("library")}
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
}
