"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { Link, usePathname } from "@/i18n/navigation";
import { Bookmark, Handshake, LogOut, Settings, Shield, User } from "lucide-react";
import { Button } from "@/components/primer/Button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const NAV_LINKS = [
  { href: "/paths", key: "paths" },
  { href: "/library", key: "library" },
  { href: "/mentor", key: "mentor" },
] as const;

const LOCALES = ["en", "ar", "es"] as const;
const LOCALE_CODES: Record<(typeof LOCALES)[number], string> = {
  en: "EN",
  ar: "AR",
  es: "ES",
};
const LOCALE_NAMES: Record<(typeof LOCALES)[number], string> = {
  en: "English",
  ar: "العربية",
  es: "Español",
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale() as (typeof LOCALES)[number];
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setLangOpen(false);
      setAccountOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const isLoading = !mounted || status === "loading";
  const isLoggedIn = mounted && status === "authenticated" && !!session?.user;
  const isAdmin =
    isLoggedIn && (session?.user?.role === "admin" || session?.user?.role === "super_admin");
  const userName = session?.user?.name ?? "";
  const initial = (userName.trim()[0] || "?").toUpperCase();

  const accountMenuItems = [
    { href: "/journey", label: t("myJourney"), Icon: User },
    { href: "/saved", label: t("saved"), Icon: Bookmark },
    { href: "/settings", label: t("settings"), Icon: Settings },
    { href: "/mentor", label: t("talkToMentor"), Icon: Handshake },
  ];

  return (
    <nav className="sticky top-0 z-40 h-16 border-b border-rule bg-page">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex h-full items-center gap-8">
          <Link href="/" className="whitespace-nowrap text-[19px] font-semibold text-ink">
            {t("wordmark")}
          </Link>

          <div className="hidden h-full items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex h-full items-center text-[0.9375rem] font-medium transition-colors duration-150 ${
                    active
                      ? "text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-ink"
                      : "text-ink-2 hover:text-ink"
                  }`}
                >
                  {t(link.key)}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setLangOpen((v) => !v);
                setAccountOpen(false);
              }}
              aria-label={t("languageMenu")}
              aria-haspopup="menu"
              aria-expanded={langOpen}
              className="inline-flex h-10 min-w-10 items-center justify-center rounded-[var(--radius-control)] px-2 text-[0.8125rem] font-semibold tabular text-ink-2 transition-colors duration-150 hover:bg-wash hover:text-ink"
            >
              {LOCALE_CODES[locale] ?? locale.toUpperCase()}
            </button>
            {langOpen ? (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setLangOpen(false)}
                  aria-hidden="true"
                />
                <div
                  role="menu"
                  aria-label={t("languageMenu")}
                  className="absolute end-0 top-full z-40 mt-2 w-36 rounded-[var(--radius-cell)] border border-rule bg-page py-1"
                >
                  {LOCALES.map((l) => (
                    <Link
                      key={l}
                      role="menuitem"
                      href={pathname}
                      locale={l}
                      onClick={() => setLangOpen(false)}
                      aria-current={l === locale ? "true" : undefined}
                      className={`block px-4 py-2 text-[0.9375rem] ${
                        l === locale ? "text-ink" : "text-ink-2 hover:text-ink"
                      }`}
                    >
                      {LOCALE_NAMES[l]}
                    </Link>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          <ThemeToggle
            darkLabel={t("switchToDarkMode")}
            lightLabel={t("switchToLightMode")}
          />

          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-[var(--radius-control)] bg-wash" aria-hidden="true" />
          ) : isLoggedIn ? (
            <>
              <Link
                href="/journey"
                className="hidden h-10 items-center text-[0.9375rem] font-medium text-ink-2 transition-colors duration-150 hover:text-ink md:inline-flex"
              >
                {t("myJourney")}
              </Link>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen((v) => !v);
                    setLangOpen(false);
                  }}
                  aria-label={t("accountMenu")}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-control)] px-2 text-[0.9375rem] font-medium text-ink transition-colors duration-150 hover:bg-wash"
                >
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-[0.8125rem] font-semibold text-page">
                    {initial}
                  </span>
                  <span className="hidden max-w-[120px] truncate lg:inline">
                    {userName}
                  </span>
                </button>

                {accountOpen ? (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setAccountOpen(false)}
                      aria-hidden="true"
                    />
                    <div
                      role="menu"
                      aria-label={t("accountMenu")}
                      className="absolute end-0 top-full z-40 mt-2 w-56 rounded-[var(--radius-cell)] border border-rule bg-page py-1"
                    >
                      {accountMenuItems.map((item) => (
                        <Link
                          key={item.href}
                          role="menuitem"
                          href={item.href}
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-[0.9375rem] text-ink-2 transition-colors duration-150 hover:bg-wash hover:text-ink"
                        >
                          <item.Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                          {item.label}
                        </Link>
                      ))}
                      {isAdmin ? (
                        <a
                          role="menuitem"
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-[0.9375rem] text-ink-2 transition-colors duration-150 hover:bg-wash hover:text-ink"
                        >
                          <Shield className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                          {t("adminPortal")}
                        </a>
                      ) : null}
                      <div className="my-1 border-t border-rule" />
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setAccountOpen(false);
                          signOut({ callbackUrl: `/${locale}` });
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-start text-[0.9375rem] text-ink-2 transition-colors duration-150 hover:bg-wash hover:text-ink"
                      >
                        <LogOut className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                        {t("signOut")}
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <Button href="/login" variant="quiet" size="md">
                {t("signIn")}
              </Button>
              <span className="hidden lg:inline-flex">
                <Button href="/start" variant="primary" size="md">
                  {t("findStart")}
                </Button>
              </span>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
