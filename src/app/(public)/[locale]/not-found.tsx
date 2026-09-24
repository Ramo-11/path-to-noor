import { getTranslations } from "next-intl/server";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";

export default async function NotFound() {
  const t = await getTranslations("system");

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <EmptyState
        art="lantern"
        title={t("notFoundTitle")}
        action={
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button href="/" variant="primary">
              {t("goHome")}
            </Button>
            <Button href="/paths" variant="secondary">
              {t("goPaths")}
            </Button>
          </div>
        }
      />
    </div>
  );
}
