import { useTranslations } from "next-intl";
import type { KeyPointAttrs } from "@/lib/lesson-blocks";

export function KeyPoint({ text }: KeyPointAttrs) {
  const t = useTranslations("blocks");

  return (
    <div role="note" className="rounded-[var(--radius-cell)] bg-wash px-5 py-5 sm:px-7 sm:py-6">
      <p className="text-meta font-semibold text-ink">{t("remember")}</p>
      <p className="mt-1.5 whitespace-pre-line text-lg text-ink">{text}</p>
    </div>
  );
}
