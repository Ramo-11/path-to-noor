import { useTranslations } from "next-intl";

export default function PathJourneyLoading() {
  const t = useTranslations("common");

  return (
    <div role="status" aria-live="polite" className="animate-pulse">
      <span className="sr-only">{t("loading")}</span>
      <div aria-hidden="true" className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="pt-6 sm:pt-8">
          <div className="h-11 w-28 py-3">
            <div className="h-full rounded-full bg-wash" />
          </div>
        </div>
        <div className="mt-6 h-72 rounded-[var(--radius-panel)] bg-wash sm:mt-8 sm:h-64" />
        <div className="mt-8 h-32 max-w-2xl rounded-[var(--radius-cell)] bg-wash sm:mt-10" />
      </div>
      <div aria-hidden="true" className="mt-10 border-t border-rule sm:mt-14">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14 xl:grid-cols-[17rem_minmax(0,1fr)] xl:gap-20">
            <div className="flex gap-3 py-6 lg:mt-16 lg:flex-col lg:py-0">
              {[0, 1, 2, 3].map((tab) => (
                <div key={tab} className="h-16 w-40 shrink-0 rounded-[var(--radius-control)] bg-wash lg:w-full" />
              ))}
            </div>
            <div className="pt-10 pb-20 sm:pt-14 lg:pt-16">
              {[0, 1].map((step) => (
                <div
                  key={step}
                  className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3 pb-16 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-x-8"
                >
                  <div className="size-11 rounded-full bg-wash sm:size-20" />
                  <div className="pt-2 sm:pt-5">
                    <div className="h-7 w-full max-w-xs rounded-full bg-wash" />
                    <div className="mt-3 h-4 w-40 rounded-full bg-wash" />
                    <div className="mt-6 flex flex-col gap-2">
                      <div className="h-16 rounded-[var(--radius-control)] bg-wash" />
                      <div className="h-16 rounded-[var(--radius-control)] bg-wash" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
