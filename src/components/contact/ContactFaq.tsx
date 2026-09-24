import { getTranslations } from "next-intl/server";
import { ChevronDown } from "lucide-react";

export async function ContactFaq() {
  const t = await getTranslations("contact");

  const faqs = [
    { q: t("faq1q"), a: t("faq1a") },
    { q: t("faq2q"), a: t("faq2a") },
    { q: t("faq3q"), a: t("faq3a") },
    { q: t("faq4q"), a: t("faq4a") },
    { q: t("faq5q"), a: t("faq5a") },
    { q: t("faq6q"), a: t("faq6a") },
    { q: t("faq7q"), a: t("faq7a") },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-heading font-semibold">{t("faqTitle")}</h2>
        <div className="primer-grid mt-6 grid-cols-1">
          {faqs.map((faq, i) => (
            <details key={i} className="group px-6 py-1 sm:px-8">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium text-ink [&::-webkit-details-marker]:hidden">
                <span>{faq.q}</span>
                <ChevronDown
                  aria-hidden="true"
                  className="size-4 shrink-0 text-ink-3 transition-transform duration-150 group-open:rotate-180"
                />
              </summary>
              <p className="pb-5 text-ink-2">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      <p className="text-ink-2">
        {t("emailDirect")}{" "}
        <a
          href="mailto:admin@basmetdawah.org"
          className="font-medium text-ink underline decoration-rule-strong underline-offset-[0.25em] hover:decoration-ink"
        >
          admin@basmetdawah.org
        </a>
      </p>
    </div>
  );
}
