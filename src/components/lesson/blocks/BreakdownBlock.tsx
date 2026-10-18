import { useTranslations } from "next-intl";
import type { BreakdownAttrs } from "@/lib/lesson-blocks";
import { AudioButton } from "./AudioButton";

export function BreakdownBlock({ parts, result, audio, lessonSlug }: BreakdownAttrs & { lessonSlug: string }) {
  const t = useTranslations("blocks");

  return (
    <div role="group" aria-label={t("breakdownLabel")}>
      <ol dir="rtl" className="flex flex-wrap items-stretch justify-center gap-2.5 sm:gap-3">
        {parts.map((part, index) => (
          <li key={index} className="flex min-w-[5.5rem] flex-1 basis-[5.5rem] items-stretch sm:max-w-[10rem]">
            <div className="flex w-full flex-col items-center rounded-[var(--radius-cell)] border border-rule bg-surface px-3 py-4 text-center shadow-soft">
              <span lang="ar" className="arabic-phrase text-[1.75rem] text-ink sm:text-[2rem]">
                {part.arabic}
              </span>
              <span dir="auto" className="mt-2 text-[0.9375rem] font-semibold text-ink">
                {part.transliteration}
              </span>
              <span dir="auto" className="mt-0.5 text-[0.9375rem] leading-snug text-stage1-text">
                {part.meaning}
              </span>
            </div>
          </li>
        ))}
      </ol>
      {result.trim() ? (
        <p className="mt-4 text-center text-[1.0625rem] font-medium text-ink-2">{result}</p>
      ) : null}
      {audio.length > 0 ? <AudioButton clips={audio} lessonSlug={lessonSlug} className="mt-4 flex justify-center" /> : null}
    </div>
  );
}
