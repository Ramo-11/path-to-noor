import { getTranslations } from "next-intl/server";

export default async function StartLoading() {
  const t = await getTranslations("common");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-20 sm:px-6 sm:pt-14 lg:px-8 lg:pt-20" aria-busy="true">
      <p role="status" className="sr-only">
        {t("loading")}
      </p>
      <div aria-hidden="true" className="max-w-3xl">
        <div className="h-12 w-4/5 rounded-[var(--radius-control)] bg-wash sm:h-16" />
        <div className="mt-3 h-12 w-3/5 rounded-[var(--radius-control)] bg-wash sm:h-16" />
        <div className="mt-8 h-5 w-full max-w-[52ch] rounded bg-wash" />
        <div className="mt-3 h-5 w-2/3 max-w-[40ch] rounded bg-wash" />
        <div className="primer-grid mt-10 w-max grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="size-10 sm:size-11" />
          ))}
        </div>
        <div className="mt-10 h-13 w-40 rounded-[var(--radius-control)] bg-wash" />
      </div>
    </div>
  );
}
