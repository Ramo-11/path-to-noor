import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { PageIntro } from "@/components/primer/PageIntro";

export default function PathNotFound() {
  const t = useTranslations("paths");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
      <PageIntro title={t("notFoundTitle")} lead={t("notFoundBody")} />
      <Button href="/paths">{t("browseAll")}</Button>
    </div>
  );
}
