"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { isTabBarHidden } from "@/components/layout/tab-bar-visibility";
import { BrandMark } from "@/components/layout/BrandMark";

export function Footer() {
  const t = useTranslations("footer");
  const pathname = usePathname();
  const year = new Date().getFullYear();
  const spaceForTabBar = !isTabBarHidden(pathname);

  const links = [
    { href: "/paths", label: t("paths") },
    { href: "/library", label: t("library") },
    { href: "/mentor", label: t("mentor") },
    { href: "/contact", label: t("contact") },
    { href: "/privacy", label: t("privacy") },
    { href: "/terms", label: t("terms") },
  ];

  return (
    <footer
      className={`mt-10 bg-canvas sm:mt-12 ${
        spaceForTabBar ? "pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0" : ""
      }`}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="flex items-center gap-2.5 text-[19px] font-semibold text-ink">
              <BrandMark />
              {t("wordmark")}
            </p>
            <p className="mt-3 max-w-[40ch] text-ink-2">{t("tagline")}</p>
          </div>

          <nav aria-label={t("footerNav")} className="flex flex-wrap gap-x-6 gap-y-0 md:justify-end">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-11 items-center text-[0.9375rem] text-ink-2 transition-colors duration-150 hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-0 border-t border-rule pt-6 text-[0.875rem] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("copyright", { year })}</p>
          <p className="flex items-center gap-1.5">
            {t("madeBy")}{" "}
            <a
              href="https://sahab-solutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center text-ink-2 underline decoration-rule-strong underline-offset-[0.25em] transition-colors duration-150 hover:text-primary hover:decoration-primary"
            >
              Sahab Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
