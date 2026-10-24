import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Readex_Pro, Amiri } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { SessionProvider } from "next-auth/react";
import { GoogleAnalytics } from "@/components/shared/GoogleAnalytics";
import { OnboardingRedirect } from "@/components/shared/OnboardingRedirect";
import { PlacementSync } from "@/components/placement/PlacementSync";
import { TrackSync } from "@/components/tracks/TrackSync";
import { VerifyEmailBanner } from "@/components/auth/VerifyEmailBanner";
import { SiteShell } from "@/components/layout/SiteShell";
import { getSiteUrl } from "@/config/env";
import "@/app/globals.css";

const readex = Readex_Pro({
  subsets: ["latin", "latin-ext", "arabic"],
  weight: "variable",
  display: "swap",
  variable: "--font-readex",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-amiri",
});

const siteDescription =
  "Learn Islam one clear step at a time. Free, short lessons for anyone curious, anyone new to Islam, and Muslims who want to learn more, in English, Arabic, and Spanish.";

export const metadata: Metadata = {
  title: {
    default: "Basmet Dawah",
    template: "%s | Basmet Dawah",
  },
  description: siteDescription,
  metadataBase: new URL(getSiteUrl()),
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Basmet Dawah", statusBarStyle: "default" },
  alternates: {
    canonical: "/",
    languages: {
      en: "/en",
      ar: "/ar",
      es: "/es",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["ar_SA", "es_ES"],
    siteName: "Basmet Dawah",
    title: "Basmet Dawah",
    description: siteDescription,
    url: getSiteUrl(),
  },
  twitter: {
    card: "summary_large_image",
    title: "Basmet Dawah",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1124" },
  ],
};

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }, { locale: "es" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const messages = await getMessages();
  const t = await getTranslations("nav");
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang={locale} dir={dir} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${readex.variable} ${amiri.variable} font-sans bg-page text-ink`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-5 focus:py-2.5 focus:text-on-primary focus:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--page)]"
        >
          {t("skipToContent")}
        </a>
        <SessionProvider>
          <NextIntlClientProvider messages={messages}>
            <PlacementSync />
            <TrackSync />
            <OnboardingRedirect />
            <VerifyEmailBanner />
            <SiteShell>{children}</SiteShell>
          </NextIntlClientProvider>
        </SessionProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
