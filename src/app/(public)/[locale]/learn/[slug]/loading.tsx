import { useTranslations } from "next-intl";

export default function LessonLoading() {
  const t = useTranslations("lesson");

  return (
    <div role="status" aria-live="polite" className="animate-pulse">
      <span className="sr-only">{t("loading")}</span>
      <div aria-hidden="true" className="bg-canvas">
        <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="h-6 w-24 rounded-full bg-wash" />
            <div className="h-4 w-32 rounded-full bg-wash" />
          </div>
          <div className="mt-5 h-2 w-full rounded-full bg-wash" />
        </div>
      </div>
      <div aria-hidden="true" className="mx-auto w-full max-w-3xl px-4 pt-10 pb-20 sm:px-6 sm:pt-14 lg:px-8">
        <div className="h-10 w-4/5 rounded-[var(--radius-control)] bg-wash sm:h-12" />
        <div className="mt-4 h-6 w-28 rounded-full bg-wash" />
        <div className="mt-10 aspect-video w-full rounded-[var(--radius-cell)] bg-wash sm:mt-12" />
        <div className="mt-8 flex flex-col gap-3">
          <div className="h-4 w-full rounded-full bg-wash" />
          <div className="h-4 w-11/12 rounded-full bg-wash" />
          <div className="h-4 w-3/5 rounded-full bg-wash" />
        </div>
      </div>
    </div>
  );
}
