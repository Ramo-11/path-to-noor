import { useTranslations } from "next-intl";

export default function PathsLoading() {
  const t = useTranslations("common");

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto w-full max-w-6xl animate-pulse px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8"
    >
      <span className="sr-only">{t("loading")}</span>
      <div aria-hidden="true" className="mt-4 h-64 rounded-[var(--radius-panel)] bg-wash sm:mt-8 sm:h-56" />
      {[0, 1, 2].map((band) => (
        <div key={band} className="mt-6 rounded-[var(--radius-panel)] bg-wash p-6 first:mt-0 sm:p-8 lg:p-10">
          <div className="flex items-center gap-5">
            <div className="size-14 shrink-0 rounded-2xl bg-surface" />
            <div className="min-w-0 flex-1">
              <div className="h-6 w-40 rounded-full bg-surface" />
              <div className="mt-2 h-4 w-56 max-w-full rounded-full bg-surface" />
            </div>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((card) => (
              <div key={card} className="overflow-hidden rounded-[var(--radius-cell)] bg-surface">
                <div className="aspect-[16/9] bg-wash" />
                <div className="p-5 sm:p-6">
                  <div className="h-5 w-20 rounded-full bg-wash" />
                  <div className="mt-3 h-6 w-3/4 rounded-full bg-wash" />
                  <div className="mt-8 h-3 w-24 rounded-full bg-wash" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
