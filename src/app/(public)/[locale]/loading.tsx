import { getTranslations } from "next-intl/server";

export default async function Loading() {
  const t = await getTranslations("system");

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={t("loading")}
      className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="flex flex-col gap-6 pb-10 sm:pb-12">
        <div className="h-9 w-2/3 max-w-sm animate-pulse rounded-[var(--radius-control)] bg-wash sm:h-11" />
        <div className="h-5 w-full max-w-md animate-pulse rounded-[var(--radius-control)] bg-wash" />
      </div>
      <div className="primer-grid grid-cols-1" aria-hidden="true">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="px-6 py-6 sm:px-8">
            <div className="h-4 w-full animate-pulse rounded-[var(--radius-control)] bg-wash" />
          </div>
        ))}
      </div>
    </div>
  );
}
