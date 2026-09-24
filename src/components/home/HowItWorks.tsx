import { useTranslations } from "next-intl";
import { HomeSection } from "./HomeSection";

const STEPS = ["one", "two", "three"] as const;

export function HowItWorks() {
  const t = useTranslations("home.how");

  return (
    <HomeSection labelledBy="home-how">
      <h2 id="home-how" className="text-title font-semibold text-balance">
        {t("title")}
      </h2>
      <ol className="primer-grid mt-10 grid-cols-1 sm:mt-12 md:grid-cols-3">
        {STEPS.map((key, index) => (
          <li key={key} className="flex gap-5 px-6 py-7 sm:px-8 sm:py-9">
            <span
              aria-hidden="true"
              className="w-9 shrink-0 text-[3rem] leading-[0.85] font-semibold tracking-[-0.04em] tabular"
            >
              {index + 1}
            </span>
            <div className="min-w-0">
              <h3 className="text-xl leading-snug font-semibold text-balance">{t(`${key}.title`)}</h3>
              <p className="mt-2 text-ink-2 text-pretty">{t(`${key}.body`)}</p>
            </div>
          </li>
        ))}
      </ol>
    </HomeSection>
  );
}
