import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPublicLearningPaths } from "@/lib/data";
import { Container } from "@/components/layout/Container";
import {
  AnimateIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/AnimateIn";
import { Button } from "@/components/ui/Button";
import { Route, Clock, Layers, ArrowRight, ArrowLeft } from "lucide-react";

const difficultyColors: Record<string, string> = {
  beginner:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  intermediate:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  advanced:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default async function PathsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("paths");
  const tLearning = await getTranslations("learning");

  const paths = await getPublicLearningPaths();

  const GoArrow = locale === "ar" ? ArrowLeft : ArrowRight;

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <AnimateIn preset="fade-up" className="text-center mb-16">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl tracking-tight text-slate-900 dark:text-white">
            {t("title")}
          </h1>
          <div className="mt-3 decorative-line-center" />
          <p className="mt-6 max-w-2xl mx-auto text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </AnimateIn>

        {paths.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-12">
            {t("noPaths")}
          </p>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths.map((path: any) => {
              const moduleCount =
                path.modules?.filter((m: any) => m.moduleId).length || 0;

              return (
                <StaggerItem key={path._id.toString()}>
                  <div className="card-hover rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-6 h-full flex flex-col">
                    {/* Icon + difficulty badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600">
                        <Route className="h-6 w-6" />
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          difficultyColors[path.difficulty] ||
                          difficultyColors.beginner
                        }`}
                      >
                        {tLearning(`difficulty.${path.difficulty}`)}
                      </span>
                    </div>

                    {/* Title + description */}
                    <h2 className="font-heading text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {path.title[locale] || path.title.en}
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
                      {path.description[locale] || path.description.en}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-6 mt-auto">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {t("hours", { count: path.estimatedHours })}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" />
                        {t("moduleCount", { count: moduleCount })}
                      </span>
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/paths/${path.slug}`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors px-5 py-2.5 text-sm font-semibold"
                    >
                      {t("startPath")}
                      <GoArrow className="h-4 w-4" />
                    </Link>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </Container>
    </section>
  );
}
