"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/layout/Container";
import { AnimateIn, StaggerContainer, StaggerItem } from "@/components/shared/AnimateIn";
import { Button } from "@/components/ui/Button";
import { BookOpen, Route, BarChart3, Languages } from "lucide-react";

const featureIcons = [BookOpen, Route, BarChart3, Languages];
const featureKeys = [
  "structuredPaths",
  "browseTopics",
  "trackProgress",
  "bilingual",
] as const;

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-mesh noise-overlay">
        <Container className="relative z-10 py-24 sm:py-32 lg:py-40">
          <AnimateIn preset="fade-up" className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-slate-900 dark:text-white">
              <span className="gradient-text">{t("hero.title")}</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button href="/paths" size="lg">
                {t("hero.explorePaths")}
              </Button>
              <Button href="/register" variant="outline" size="lg">
                {t("hero.createAccount")}
              </Button>
            </div>
          </AnimateIn>
        </Container>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 section-divider">
        <Container>
          <AnimateIn preset="fade-up" className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl tracking-tight text-slate-900 dark:text-white">
              {t("features.title")}
            </h2>
            <div className="mt-3 decorative-line-center" />
            <p className="mt-6 max-w-2xl mx-auto text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              {t("features.subtitle")}
            </p>
          </AnimateIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureKeys.map((key, i) => {
              const Icon = featureIcons[i];
              return (
                <StaggerItem key={key}>
                  <div className="card-hover rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-6 h-full">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {t(`features.${key}.title`)}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {t(`features.${key}.description`)}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </Container>
      </section>
    </>
  );
}
