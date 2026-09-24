import { useTranslations } from "next-intl";
import { STAGE_NUMBER, STAGE_STYLES, type StageKey } from "@/lib/stages";

export function StageChip({ stage, className = "" }: { stage: StageKey; className?: string }) {
  const t = useTranslations("stages");
  const style = STAGE_STYLES[stage];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-meta font-medium ${style.tint} ${style.text} ${className}`}
    >
      <span aria-hidden="true" className={`size-2 rounded-full ${style.fill}`} />
      <span className="sr-only">{t("label", { number: STAGE_NUMBER[stage] })}: </span>
      {t(`${stage}.name`)}
    </span>
  );
}
