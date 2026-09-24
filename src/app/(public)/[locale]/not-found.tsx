import { getTranslations } from "next-intl/server";
import { Button } from "@/components/primer/Button";

export default async function NotFound() {
  const t = await getTranslations("system");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-6 px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <p className="text-display font-semibold tabular text-ink-3" aria-hidden="true">
        404
      </p>
      <h1 className="text-title font-semibold text-balance">{t("notFoundTitle")}</h1>
      <p className="max-w-[52ch] text-ink-2">{t("notFoundBody")}</p>
      <div className="flex flex-wrap gap-3">
        <Button href="/" variant="primary">
          {t("goHome")}
        </Button>
        <Button href="/paths" variant="secondary">
          {t("goPaths")}
        </Button>
      </div>
    </div>
  );
}
