import { useTranslations } from "next-intl";
import type { PhraseCardAttrs } from "@/lib/lesson-blocks";

export function PhraseCard({ arabic, transliteration, meaning }: PhraseCardAttrs) {
  const t = useTranslations("blocks");
  const hasDetails = transliteration.trim().length > 0 || meaning.trim().length > 0;

  return (
    <div role="group" aria-label={t("phraseLabel")} className="primer-grid text-center">
      <div className="px-5 py-8 sm:px-10 sm:py-10">
        <p>
          <span className="sr-only">{t("phraseArabic")}: </span>
          <span lang="ar" dir="rtl" className="arabic-phrase block text-[2.25rem] text-ink sm:text-5xl">
            {arabic}
          </span>
        </p>
      </div>
      {hasDetails ? (
        <div className="flex flex-col gap-1.5 px-5 py-5 sm:px-10">
          {transliteration.trim() ? (
            <p className="text-lg text-ink-2">
              <span className="sr-only">{t("phraseTransliteration")}: </span>
              {transliteration}
            </p>
          ) : null}
          {meaning.trim() ? (
            <p className="text-lg text-ink">
              <span className="sr-only">{t("phraseMeaning")}: </span>
              {meaning}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
