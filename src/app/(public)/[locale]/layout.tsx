import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Arabic } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { SessionProvider } from "next-auth/react";
import { GoogleAnalytics } from "@/components/shared/GoogleAnalytics";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { OnboardingRedirect } from "@/components/shared/OnboardingRedirect";
import { getSiteUrl } from "@/config/env";
import "@/app/globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans",
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-noto-sans-arabic",
});

const siteDescription =
  "A guided learning platform for new Muslims — explore Islam at your own pace with structured paths, trusted content, and bilingual support.";

export const metadata: Metadata = {
  title: {
    default: "Basmet Dawah",
    template: "%s | Basmet Dawah",
  },
  description: siteDescription,
  metadataBase: new URL(getSiteUrl()),
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
    title: "Basmet Dawah — A guided path for new Muslims",
    description: siteDescription,
    url: getSiteUrl(),
  },
  twitter: {
    card: "summary_large_image",
    title: "Basmet Dawah — A guided path for new Muslims",
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

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <script
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
        className={`${notoSans.variable} ${notoSansArabic.variable} font-sans`}
      >
        <SessionProvider>
          <NextIntlClientProvider messages={messages}>
            <OnboardingRedirect />
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </NextIntlClientProvider>
        </SessionProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
