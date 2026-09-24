import { getTranslations } from "next-intl/server";
import { Button } from "@/components/primer/Button";

export async function GuestIntro() {
  const t = await getTranslations("mentor");

  const steps = [
    t("step1"),
    t("step2"),
    t("step3"),
  ];

  return (
    <div className="flex flex-col gap-12 pb-24">
      <p className="max-w-[64ch] text-lg text-ink-2 text-pretty">{t("whatIsMentor")}</p>

      <div>
        <h2 className="text-heading font-semibold">{t("howItWorksTitle")}</h2>
        <div className="primer-grid mt-6 grid-cols-1 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col gap-3 px-6 py-8 sm:px-8">
              <span className="text-display font-semibold tabular text-ink" aria-hidden="true">
                {i + 1}
              </span>
              <p className="text-ink-2">{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button href="/login" variant="primary" size="lg">
          {t("signInCta")}
        </Button>
        <Button href="/register" variant="secondary" size="lg">
          {t("createAccountCta")}
        </Button>
      </div>
    </div>
  );
}
