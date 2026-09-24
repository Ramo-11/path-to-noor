import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";

export default function PathNotFound() {
  const t = useTranslations("paths");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <EmptyState
        art="lantern"
        title={t("notFoundTitle")}
        body={t("notFoundBody")}
        action={<Button href="/paths">{t("browseAll")}</Button>}
      />
    </div>
  );
}
