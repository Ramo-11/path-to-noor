import { useTranslations } from "next-intl";

export default function LessonLoading() {
  const t = useTranslations("lesson");

  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{t("loading")}</span>
      <div aria-hidden="true" className="border-b border-rule">
        <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="h-3.5 w-40 rounded-[4px] bg-wash" />
          <div className="mt-2.5 h-4 w-64 max-w-full rounded-[4px] bg-wash" />
          <div className="mt-5 flex h-2 gap-[3px]">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className="h-full flex-1 rounded-[2px] bg-rule" />
            ))}
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="mx-auto w-full max-w-3xl px-4 pt-10 pb-20 sm:px-6 sm:pt-14 lg:px-8">
        <div className="h-10 w-4/5 rounded-[var(--radius-control)] bg-wash sm:h-12" />
        <div className="mt-4 h-3.5 w-24 rounded-[4px] bg-wash" />
        <div className="mt-10 aspect-video w-full rounded-[var(--radius-cell)] bg-wash sm:mt-12" />
        <div className="mt-8 flex flex-col gap-3">
          <div className="h-4 w-full rounded-[4px] bg-wash" />
          <div className="h-4 w-11/12 rounded-[4px] bg-wash" />
          <div className="h-4 w-3/5 rounded-[4px] bg-wash" />
        </div>
      </div>
    </div>
  );
}
