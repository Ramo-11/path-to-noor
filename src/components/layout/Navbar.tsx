"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Menu, X, User, LogOut, Bookmark, Shield, Handshake } from "lucide-react";
import { useLocale } from "next-intl";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoading = !mounted || status === "loading";
  const isLoggedIn = mounted && status === "authenticated" && !!session?.user;
  const isAdmin = isLoggedIn && (session.user.role === "admin" || session.user.role === "super_admin");
  const isRevert = isLoggedIn && session.user.userType === "revert";

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/topics", label: t("topics") },
    { href: "/paths", label: t("paths") },
  ];

  const [langOpen, setLangOpen] = useState(false);
  const localeLabels: Record<string, string> = { en: "EN", ar: "AR", es: "ES" };
  const localeNames: Record<string, string> = { en: "English", ar: "العربية", es: "Español" };
  const allLocales = ["en", "ar", "es"];

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="font-heading text-xl font-bold text-primary-700 dark:text-primary-300"
          >
            {locale === "ar" ? "بسمة دعوة" : "Basmet Dawah"}
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
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors px-2 py-1"
                aria-label={t("switchLanguage")}
                aria-expanded={langOpen}
              >
                {localeLabels[locale] || locale.toUpperCase()}
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setLangOpen(false)} />
                  <div className="absolute end-0 top-full mt-2 w-32 z-40 rounded-lg bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 py-1">
                    {allLocales.filter((l) => l !== locale).map((l) => (
                      <Link
                        key={l}
                        href={pathname}
                        locale={l}
                        onClick={() => setLangOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        {localeNames[l]}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
            <ThemeToggle />

            {isLoading ? (
              <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            ) : isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-700 dark:hover:text-primary-300 transition-colors px-2 py-1"
                  aria-label={t("myAccount")}
                  aria-expanded={profileOpen}
                >
                  <User className="h-4 w-4" />
                  <span className="max-w-[120px] truncate">
                    {session.user.name || t("myAccount")}
                  </span>
                </button>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute end-0 top-full mt-2 w-48 z-40 rounded-lg bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 py-1">
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        {t("myAccount")}
                      </Link>
                      <Link
                        href="/bookmarks"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Bookmark className="h-4 w-4" />
                        {t("bookmarks")}
                      </Link>
                      {isRevert && (
                        <Link
                          href="/mentorship"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Handshake className="h-4 w-4" />
                          {t("mentorship")}
                        </Link>
                      )}
                      {isAdmin && (
                        <a
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-primary-700 dark:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Shield className="h-4 w-4" />
                          {t("adminPortal")}
                        </a>
                      )}
                      <hr className="my-1 border-slate-200 dark:border-slate-800" />
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          signOut({ callbackUrl: `/${locale}` });
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full text-start"
                      >
                        <LogOut className="h-4 w-4" />
                        {t("signOut")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
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
              </>
            )}
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
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
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

            {!isLoading && isLoggedIn && (
              <>
                <Link
                  href="/bookmarks"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  {t("bookmarks")}
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  {t("myAccount")}
                </Link>
                {isRevert && (
                  <Link
                    href="/mentorship"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <Handshake className="h-4 w-4" />
                    {t("mentorship")}
                  </Link>
                )}
                {isAdmin && (
                  <a
                    href="/admin"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary-700 dark:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    {t("adminPortal")}
                  </a>
                )}
              </>
            )}

            <div className="flex items-center gap-3 px-3 pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
              {allLocales.filter((l) => l !== locale).map((l) => (
                <Link
                  key={l}
                  href={pathname}
                  locale={l}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-slate-600 dark:text-slate-400"
                >
                  {localeNames[l]}
                </Link>
              ))}
            </div>

            {!isLoading && (
              <div className="flex gap-2 px-3 pt-2">
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      signOut({ callbackUrl: `/${locale}` });
                    }}
                    className="flex-1 text-center text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 px-4 py-2 rounded-lg"
                  >
                    {t("signOut")}
                  </button>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
