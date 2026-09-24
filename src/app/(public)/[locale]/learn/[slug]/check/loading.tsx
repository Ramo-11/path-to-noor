import { useTranslations } from "next-intl";

export default function KnowledgeCheckLoading() {
  const t = useTranslations("check");

  return (
    <div role="status" aria-live="polite" className="mx-auto w-full max-w-3xl animate-pulse px-4 pt-8 pb-20 sm:px-6 sm:pt-10 lg:px-8">
      <span className="sr-only">{t("loading")}</span>
      <div aria-hidden="true">
        <div className="flex min-h-11 items-center">
          <div className="h-4 w-32 rounded-full bg-wash" />
        </div>
        <div className="mt-6 h-10 w-2/3 rounded-[var(--radius-control)] bg-wash sm:h-12" />
        <div className="mt-5 h-4 w-4/5 rounded-full bg-wash" />
        <div className="mt-10 h-2 w-full rounded-full bg-wash" />
        <div className="mt-5 flex gap-2 sm:mt-6">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="size-11 rounded-full bg-wash" />
          ))}
        </div>
        <div className="mt-8 h-7 w-3/4 rounded-[var(--radius-control)] bg-wash" />
        <div className="mt-6 flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-14 rounded-full bg-wash" />
          ))}
        </div>
      </div>
    </div>
  );
}
