"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import NextLink from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Link, usePathname } from "@/i18n/navigation";
import { Bookmark, Handshake, LogOut, Mail, Search, Settings, Shield, User } from "lucide-react";
import { Button } from "@/components/primer/Button";
import { PreferencesMenu } from "@/components/layout/PreferencesMenu";
import { BrandMark } from "@/components/layout/BrandMark";
import { useMounted } from "@/lib/use-mounted";
import { clearOfflinePages } from "@/components/pwa/offline-cache";
import { useTrackAction } from "@/components/tracks/useTrackAction";

const NAV_LINKS = [
  { href: "/paths", key: "paths" },
  { href: "/library", key: "library" },
  { href: "/mentor", key: "mentor" },
  { href: "/contact", key: "contact" },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const mounted = useMounted();
  const primary = useTrackAction();
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
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
    { href: "/contact", label: t("contact"), Icon: Mail },
  ];

  return (
    <nav className="sticky top-0 z-40 h-16 border-b border-rule bg-page/85 backdrop-blur-md supports-[backdrop-filter]:bg-page/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex h-full items-center gap-4 md:gap-6 lg:gap-8">
          <Link href="/" className="flex min-h-11 items-center gap-2.5 whitespace-nowrap text-[19px] font-semibold text-ink">
            <BrandMark />
            <span className="max-sm:sr-only">{t("wordmark")}</span>
          </Link>

          <div className="hidden h-full items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-10 items-center rounded-full px-3.5 text-[0.9375rem] font-medium transition-colors duration-150 ${
                    active
                      ? "bg-wash text-ink"
                      : "text-ink-2 hover:bg-wash hover:text-ink"
                  }`}
                >
                  {t(link.key)}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <Link
            href="/search"
            aria-label={t("search")}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink-2 transition-colors duration-150 hover:bg-wash hover:text-ink active:bg-wash/70"
          >
            <Search className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </Link>

          <PreferencesMenu />

          {isLoading ? (
            <div className="h-11 w-24 animate-pulse rounded-full bg-wash" aria-hidden="true" />
          ) : isLoggedIn ? (
            <>
              <Link
                href="/journey"
                className="hidden h-11 items-center whitespace-nowrap rounded-full px-4 text-[0.9375rem] font-medium text-ink-2 transition-colors duration-150 hover:bg-wash hover:text-ink md:inline-flex"
              >
                {t("myJourney")}
              </Link>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen((v) => !v);
                                }}
                  aria-label={t("accountMenu")}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  className="inline-flex h-10 items-center gap-2 rounded-full px-1 text-[0.9375rem] font-medium text-ink transition-colors duration-150 hover:bg-wash lg:pe-3"
                >
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-[0.8125rem] font-semibold text-on-primary">
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
                      className="absolute end-0 top-full z-40 mt-2 w-60 rounded-[var(--radius-cell)] border border-rule bg-surface p-1.5 shadow-lift"
                    >
                      {accountMenuItems.map((item) => (
                        <Link
                          key={item.href}
                          role="menuitem"
                          href={item.href}
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-[0.9375rem] text-ink-2 transition-colors duration-150 hover:bg-wash hover:text-ink"
                        >
                          <item.Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                          {item.label}
                        </Link>
                      ))}
                      {isAdmin ? (
                        <NextLink
                          role="menuitem"
                          href="/admin"
                          prefetch={false}
                          className="flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-[0.9375rem] text-ink-2 transition-colors duration-150 hover:bg-wash hover:text-ink"
                        >
                          <Shield className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                          {t("adminPortal")}
                        </NextLink>
                      ) : null}
                      <div className="my-1.5 border-t border-rule" />
                      <button
                        type="button"
                        role="menuitem"
                        onClick={async () => {
                          setAccountOpen(false);
                          await clearOfflinePages();
                          await signOut({ callbackUrl: `/${locale}` });
                        }}
                        className="flex w-full items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-start text-[0.9375rem] text-ink-2 transition-colors duration-150 hover:bg-wash hover:text-ink"
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
              <Link
                href="/login"
                className="inline-flex h-10 items-center whitespace-nowrap rounded-full px-3 text-[0.9375rem] font-medium text-ink-2 transition-colors duration-150 hover:bg-wash hover:text-ink sm:px-4"
              >
                {t("signIn")}
              </Link>
              <span className="ms-1.5 hidden lg:inline-flex">
                <Button href={primary.href} variant="primary" size="md">
                  {t(`primary.${primary.track ?? "none"}`)}
                </Button>
              </span>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
