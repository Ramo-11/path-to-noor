"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Menu, X } from "lucide-react";
import { useLocale } from "next-intl";

export function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/topics", label: t("topics") },
    { href: "/paths", label: t("paths") },
  ];

  const otherLocale = locale === "en" ? "ar" : "en";

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="font-heading text-xl font-bold text-primary-700 dark:text-primary-300"
          >
            {locale === "ar" ? "طريق النور" : "Path to Noor"}
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors animated-underline ${
                  pathname === link.href
                    ? "text-primary-700 dark:text-primary-300"
                    : "text-slate-600 dark:text-slate-400 hover:text-primary-700 dark:hover:text-primary-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href={pathname}
              locale={otherLocale}
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors px-2 py-1"
            >
              {t("switchLanguage")}
            </Link>
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              {t("login")}
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              {t("register")}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 px-3 pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
              <Link
                href={pathname}
                locale={otherLocale}
                className="text-sm font-medium text-slate-600 dark:text-slate-400"
              >
                {t("switchLanguage")}
              </Link>
            </div>
            <div className="flex gap-2 px-3 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 px-4 py-2 rounded-lg"
              >
                {t("login")}
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center text-sm font-semibold bg-primary-600 text-white px-4 py-2 rounded-lg"
              >
                {t("register")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
