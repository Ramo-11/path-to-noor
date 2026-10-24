import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Illustration } from "@/components/primer/Illustration";
import { HomeSection } from "./HomeSection";

type MentorChoice = "contact" | "request" | "volunteer";

const MENTOR_HREF: Record<MentorChoice, string> = {
  contact: "/contact?topic=mentor",
  request: "/mentor",
  volunteer: "/mentor/volunteer",
};

export function MentorBlock({ mentorChoice = "contact" }: { mentorChoice?: MentorChoice }) {
  const t = useTranslations("home.help");

  const choices = [
    { key: "question", href: "/contact?topic=question", title: t("question.title"), line: t("question.line") },
    {
      key: "mentor",
      href: MENTOR_HREF[mentorChoice],
      title: t(`${mentorChoice}.title`),
      line: t(`${mentorChoice}.line`),
    },
  ];

  return (
    <HomeSection labelledBy="home-help">
      <div className="grid overflow-hidden rounded-[var(--radius-panel)] bg-stage3-tint md:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-10 sm:px-12 sm:py-14">
          <h2 id="home-help" className="text-title font-semibold text-balance">
            {t("title")}
          </h2>
          <ul className="mt-6 grid gap-3">
            {choices.map((choice) => (
              <li key={choice.key}>
                <Link
                  href={choice.href}
                  className="card block rounded-[var(--radius-panel)] px-5 py-4 transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <span className="block font-semibold">{choice.title}</span>
                  <span className="mt-1 block text-ink-2">{choice.line}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="px-3 pb-3 md:py-3 md:ps-0">
          <div className="aspect-[4/3] overflow-hidden rounded-[calc(var(--radius-panel)-0.5rem)] md:aspect-auto md:h-full">
            <Illustration name="mentor" sizes="(min-width: 768px) 50vw, 100vw" />
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
