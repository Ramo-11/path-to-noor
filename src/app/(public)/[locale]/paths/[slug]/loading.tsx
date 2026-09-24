import { useTranslations } from "next-intl";

export default function PathJourneyLoading() {
  const t = useTranslations("common");

  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{t("loading")}</span>
      <div aria-hidden="true" className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="pt-6 sm:pt-8">
          <div className="h-11 w-28 py-3">
            <div className="h-full rounded bg-wash" />
          </div>
        </div>
        <div className="grid pt-6 pb-12 sm:pt-8 sm:pb-16 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-wash" />
              <div className="h-4 w-40 rounded bg-wash" />
            </div>
            <div className="mt-5 h-12 w-full max-w-md rounded-[var(--radius-control)] bg-wash" />
            <div className="mt-4 h-5 w-full max-w-xl rounded bg-wash" />
            <div className="mt-2 h-5 w-2/3 max-w-md rounded bg-wash" />
          </div>
          <div className="mt-8 lg:col-span-5 lg:col-start-8 lg:mt-1">
            <div className="primer-grid">
              <div className="p-5 sm:p-6">
                <div className="h-2 w-full rounded-[2px] bg-wash" />
                <div className="mt-5 h-13 w-full rounded-[var(--radius-control)] bg-wash" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="border-t border-rule">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14 xl:grid-cols-[17rem_minmax(0,1fr)] xl:gap-20">
            <div className="py-3 lg:mt-16 lg:py-0">
              <div className="primer-grid">
                <div className="h-16 lg:h-72" />
              </div>
            </div>
            <div className="pt-10 pb-20 sm:pt-14 lg:pt-16">
              {[0, 1].map((step) => (
                <div
                  key={step}
                  className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3 pb-16 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-x-8"
                >
                  <div className="size-11 rounded-[var(--radius-control)] bg-wash sm:size-20 sm:rounded-[var(--radius-cell)]" />
                  <div className="pt-2 sm:pt-5">
                    <div className="h-7 w-full max-w-xs rounded bg-wash" />
                    <div className="mt-3 h-4 w-40 rounded bg-wash" />
                    <div className="primer-grid mt-6">
                      <div className="h-18" />
                      <div className="h-18" />
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
