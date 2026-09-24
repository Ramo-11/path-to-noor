"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { isTabBarHidden } from "@/components/layout/tab-bar-visibility";

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
      className={`border-t border-rule ${
        spaceForTabBar ? "pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0" : ""
      }`}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="text-[19px] font-semibold text-ink">{t("wordmark")}</p>
        <p className="mt-2 max-w-[52ch] text-ink-2">{t("tagline")}</p>

        <nav aria-label={t("footerNav")} className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-rule pt-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[0.9375rem] text-ink-2 transition-colors duration-150 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 flex flex-col gap-2 border-t border-rule pt-6 text-meta text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("copyright", { year })}</p>
          <p>
            {t("madeBy")}{" "}
            <a
              href="https://sahab-solutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-2 underline decoration-rule-strong underline-offset-[0.25em] transition-colors duration-150 hover:text-ink hover:decoration-ink"
            >
              Sahab Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
