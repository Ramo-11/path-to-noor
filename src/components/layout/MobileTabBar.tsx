"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Link, usePathname } from "@/i18n/navigation";
import { BookOpen, Compass, House, Route, User } from "lucide-react";
import { isTabBarHidden } from "@/components/layout/tab-bar-visibility";

export function MobileTabBar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isTabBarHidden(pathname)) return null;

  const isLoggedIn = mounted && status === "authenticated" && !!session?.user;

  const tabs = [
    { href: "/", label: t("tabHome"), Icon: House },
    { href: "/paths", label: t("tabPaths"), Icon: Route },
    { href: "/library", label: t("tabLibrary"), Icon: BookOpen },
    isLoggedIn
      ? { href: "/journey", label: t("tabJourney"), Icon: User }
      : { href: "/start", label: t("tabStart"), Icon: Compass },
  ];

  return (
    <nav
      aria-label={t("mobileNavLabel")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-page pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="grid h-16 grid-cols-4">
        {tabs.map((tab) => {
          const active =
            tab.href === "/" ? pathname === "/" : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium transition-colors duration-150 ${
                active ? "text-ink" : "text-ink-3"
              }`}
            >
              {active ? (
                <span
                  className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-ink"
                  aria-hidden="true"
                />
              ) : null}
              <tab.Icon className="size-5" strokeWidth={active ? 2 : 1.75} aria-hidden="true" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
