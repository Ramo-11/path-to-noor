import { useTranslations } from "next-intl";
import type { PhraseCardAttrs } from "@/lib/lesson-blocks";

export function PhraseCard({ arabic, transliteration, meaning }: PhraseCardAttrs) {
  const t = useTranslations("blocks");
  const hasDetails = transliteration.trim().length > 0 || meaning.trim().length > 0;

  return (
    <div
      role="group"
      aria-label={t("phraseLabel")}
      className="rounded-[var(--radius-cell)] bg-stage1-tint px-6 py-9 text-center sm:px-10 sm:py-12"
    >
      <p>
        <span className="sr-only">{t("phraseArabic")}: </span>
        <span lang="ar" dir="rtl" className="arabic-phrase block text-[2.5rem] leading-snug text-ink sm:text-[3.25rem]">
          {arabic}
        </span>
      </p>
      {hasDetails ? (
        <div className="mt-6 flex flex-col items-center gap-1.5">
          {transliteration.trim() ? (
            <p className="text-lg font-medium text-ink">
              <span className="sr-only">{t("phraseTransliteration")}: </span>
              {transliteration}
            </p>
          ) : null}
          {meaning.trim() ? (
            <p className="text-[1.0625rem] text-ink-2">
              <span className="sr-only">{t("phraseMeaning")}: </span>
              {meaning}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
