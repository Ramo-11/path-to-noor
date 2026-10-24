import { useTranslations } from "next-intl";

export function TrackPageLoading({ cards }: { cards: number }) {
  const t = useTranslations("common");

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto w-full max-w-6xl animate-pulse px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8"
    >
      <span className="sr-only">{t("loading")}</span>
      <div aria-hidden="true" className="mt-4 h-72 rounded-[var(--radius-panel)] bg-wash sm:mt-8 sm:h-64" />
      <div aria-hidden="true" className="mt-10 h-7 w-48 rounded-full bg-wash sm:mt-14" />
      <div aria-hidden="true" className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-5">
        {Array.from({ length: cards }, (_, index) => (
          <div key={index} className="h-28 rounded-[var(--radius-cell)] bg-wash" />
        ))}
      </div>
    </div>
  );
}
