import { getTranslations } from "next-intl/server";
import { Button } from "@/components/primer/Button";

const STEP_STYLES = [
  { tint: "bg-stage1-tint", mark: "bg-stage1 text-on-stage1" },
  { tint: "bg-stage2-tint", mark: "bg-stage2 text-on-stage2" },
  { tint: "bg-stage3-tint", mark: "bg-stage3 text-on-stage3" },
] as const;

export async function GuestIntro() {
  const t = await getTranslations("mentor");

  const steps = [t("step1"), t("step2"), t("step3")];

  return (
    <div className="flex flex-col gap-10 pt-10 pb-24">
      <div>
        <h2 className="text-heading font-semibold">{t("howItWorksTitle")}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => {
            const style = STEP_STYLES[i];
            return (
              <div key={i} className={`flex items-start gap-3 rounded-[var(--radius-cell)] p-5 ${style.tint}`}>
                <span
                  aria-hidden="true"
                  className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular ${style.mark}`}
                >
                  {i + 1}
                </span>
                <p className="pt-0.5 text-ink text-pretty">{step}</p>
              </div>
            );
          })}
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
