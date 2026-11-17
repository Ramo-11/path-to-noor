import { getTranslations } from "next-intl/server";

export default async function StartLoading() {
  const t = await getTranslations("common");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-20 sm:px-6 sm:pt-10 sm:pb-24 lg:px-8" aria-busy="true">
      <p role="status" className="sr-only">
        {t("loading")}
      </p>
      <div aria-hidden="true">
        <div className="h-72 w-full rounded-[var(--radius-panel)] bg-wash sm:h-80" />
        <div className="mt-8 grid grid-cols-3 gap-3 sm:mt-10 sm:gap-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="aspect-[4/3] rounded-[var(--radius-cell)] bg-wash" />
          ))}
        </div>
      </div>
    </div>
  );
}
