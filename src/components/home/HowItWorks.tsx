import { useTranslations } from "next-intl";
import { Illustration } from "@/components/primer/Illustration";
import { HomeSection } from "./HomeSection";

const STEPS = [
  { key: "one", mark: "bg-stage1 text-on-stage1" },
  { key: "two", mark: "bg-stage2 text-on-stage2" },
  { key: "three", mark: "bg-stage3 text-on-stage3" },
] as const;

export function HowItWorks() {
  const t = useTranslations("home.how");

  return (
    <HomeSection labelledBy="home-how">
      <h2 id="home-how" className="text-title font-semibold text-balance">
        {t("title")}
      </h2>
      <div className="mt-8 aspect-[16/9] overflow-hidden rounded-[var(--radius-panel)] sm:mt-10 sm:aspect-[16/6]">
        <Illustration name="journey" sizes="(min-width: 1152px) 1088px, 100vw" className="rtl:-scale-x-100" />
      </div>
      <ol className="mt-8 grid gap-6 sm:grid-cols-3 sm:gap-8">
        {STEPS.map(({ key, mark }, index) => (
          <li key={key} className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full text-base font-semibold tabular ${mark}`}
            >
              {index + 1}
            </span>
            <div className="min-w-0 pt-1">
              <h3 className="text-lg leading-snug font-semibold text-balance">{t(`${key}.title`)}</h3>
              <p className="mt-1 text-ink-2 text-pretty">{t(`${key}.body`)}</p>
            </div>
          </li>
        ))}
      </ol>
    </HomeSection>
  );
}
