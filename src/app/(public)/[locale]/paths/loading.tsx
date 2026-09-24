import { useTranslations } from "next-intl";

export default function PathsLoading() {
  const t = useTranslations("common");

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8"
    >
      <span className="sr-only">{t("loading")}</span>
      <div aria-hidden="true" className="pt-12 pb-10 sm:pt-16 sm:pb-12">
        <div className="h-12 w-44 rounded-[var(--radius-control)] bg-wash" />
        <div className="mt-5 h-5 w-full max-w-xl rounded bg-wash" />
        <div className="mt-2 h-5 w-2/3 max-w-md rounded bg-wash" />
      </div>
      {[0, 1, 2].map((band) => (
        <div
          key={band}
          aria-hidden="true"
          className="grid gap-8 border-t border-rule py-14 sm:py-20 lg:grid-cols-12 lg:gap-12"
        >
          <div className="lg:col-span-4">
            <div className="size-20 rounded-2xl bg-wash" />
            <div className="mt-6 h-7 w-44 rounded bg-wash" />
            <div className="mt-4 h-4 w-full max-w-xs rounded bg-wash" />
            <div className="mt-2 h-4 w-3/4 max-w-60 rounded bg-wash" />
          </div>
          <div className="lg:col-span-8">
            <div className="primer-grid">
              <div className="px-5 py-7 sm:px-7">
                <div className="h-7 w-2/3 max-w-sm rounded bg-wash" />
                <div className="mt-3 h-4 w-full max-w-lg rounded bg-wash" />
                <div className="mt-5 h-3 w-48 rounded bg-wash" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
