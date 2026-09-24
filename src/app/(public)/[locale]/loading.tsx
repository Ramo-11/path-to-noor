import { getTranslations } from "next-intl/server";

export default async function Loading() {
  const t = await getTranslations("system");

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={t("loading")}
      className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
    >
      <div className="h-40 w-full animate-pulse rounded-[var(--radius-panel)] bg-wash sm:h-56" />
      <div className="mt-10 h-8 w-2/3 max-w-sm animate-pulse rounded-[var(--radius-control)] bg-wash sm:h-9" />
      <div className="mt-4 h-5 w-full max-w-md animate-pulse rounded-[var(--radius-control)] bg-wash" />
      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-[var(--radius-cell)] bg-wash" />
        ))}
      </div>
    </div>
  );
}
