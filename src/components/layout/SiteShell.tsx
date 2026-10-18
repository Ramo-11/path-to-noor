"use client";

import { Suspense } from "react";
import { usePathname } from "@/i18n/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { isTabBarHidden } from "@/components/layout/tab-bar-visibility";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { AccountDeletedNotice } from "@/components/settings/AccountDeletedNotice";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showTabBar = !isTabBarHidden(pathname);

  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <AccountDeletedNotice />
      </Suspense>
      <main
        id="main"
        className={
          showTabBar
            ? "min-h-screen pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0"
            : "min-h-screen"
        }
      >
        {children}
      </main>
      <Footer />
      {showTabBar ? <MobileTabBar /> : null}
      <InstallPrompt />
      <ServiceWorkerRegister />
    </>
  );
}
