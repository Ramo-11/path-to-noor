import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  getPublicTopicBySlug,
  getPublicSubtopics,
  getPublicModulesByTopic,
} from "@/lib/data";
import { Container } from "@/components/layout/Container";
import {
  AnimateIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/AnimateIn";
import {
  BookOpen,
  FolderOpen,
  ArrowLeft,
  ArrowRight,
  Clock,
  FileText,
} from "lucide-react";
import { TopicIconPublic } from "@/components/shared/TopicIconPublic";

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations("topics");
  const tLearning = await getTranslations("learning");
  const tCommon = await getTranslations("common");

  const topic = await getPublicTopicBySlug(slug);
  if (!topic) notFound();

  const topicAny = topic as any;
  const subtopics = await getPublicSubtopics(topicAny._id.toString());
  const modules = await getPublicModulesByTopic(topicAny._id.toString());

  const BackArrow = locale === "ar" ? ArrowRight : ArrowLeft;

  return (
    <section className="py-16 sm:py-24">
      <Container>
        {/* Back link */}
        <AnimateIn preset="fade-in">
          <Link
            href="/topics"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-8"
          >
            <BackArrow className="h-4 w-4" />
            {tCommon("back")}
          </Link>
        </AnimateIn>

        {/* Topic header */}
        <AnimateIn preset="fade-up" className="mb-16">
          <div className="flex items-start gap-4">
            {topicAny.icon && (
              <TopicIconPublic name={topicAny.icon} size="lg" />
            )}
            <div>
              <h1 className="font-heading text-3xl font-bold sm:text-4xl tracking-tight text-slate-900 dark:text-white">
                {topicAny.name[locale] || topicAny.name.en}
              </h1>
              <div className="mt-3 decorative-line" />
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                {topicAny.description[locale] || topicAny.description.en}
              </p>
            </div>
          </div>

          {/* Parent breadcrumb */}
          {topicAny.parent && (
            <div className="mt-4 ms-18">
              <Link
                href={`/topics/${topicAny.parent.slug}`}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                {topicAny.parent.name[locale] || topicAny.parent.name.en}
              </Link>
            </div>
          )}
        </AnimateIn>

        {/* Subtopics section */}
        {subtopics.length > 0 && (
          <div className="mb-16">
            <AnimateIn preset="fade-up">
              <h2 className="font-heading text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <FolderOpen className="h-6 w-6 text-primary-600" />
                {t("subtopics")}
              </h2>
            </AnimateIn>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subtopics.map((sub: any) => (
                <StaggerItem key={sub._id.toString()}>
                  <Link
                    href={`/topics/${sub.slug}`}
                    className="block group"
                  >
                    <div className="card-hover rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-6 h-full">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 mb-3">
                        <FolderOpen className="h-5 w-5" />
                      </div>
                      <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {sub.name[locale] || sub.name.en}
                      </h3>
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">
                        {sub.description[locale] || sub.description.en}
                      </p>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        )}

        {/* Modules section */}
        {modules.length > 0 && (
          <div>
            <AnimateIn preset="fade-up">
              <h2 className="font-heading text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-primary-600" />
                {t("modules")}
              </h2>
            </AnimateIn>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modules.map((mod: any) => {
                const lessonCount = mod.lessons?.length || 0;
                const totalMinutes = mod.lessons?.reduce(
                  (sum: number, l: any) =>
                    sum + (l.lessonId?.estimatedMinutes || 0),
                  0
                );
                const firstLesson = mod.lessons?.sort(
                  (a: any, b: any) => a.order - b.order
                )[0];

                return (
                  <StaggerItem key={mod._id.toString()}>
                    <div className="card-hover rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-6 h-full flex flex-col">
                      <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {mod.title[locale] || mod.title.en}
                      </h3>
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                        {mod.description[locale] || mod.description.en}
                      </p>

                      {/* Meta info */}
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
                        <span className="inline-flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" />
                          {lessonCount} {tLearning("lessons")}
                        </span>
                        {totalMinutes > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {tLearning("estimatedTime", {
                              minutes: totalMinutes,
                            })}
                          </span>
                        )}
                      </div>

                      {/* Lesson list */}
                      {mod.lessons?.length > 0 && (
                        <ul className="space-y-2 mt-auto">
                          {mod.lessons
                            .sort(
                              (a: any, b: any) => a.order - b.order
                            )
                            .map((entry: any) => {
                              const lesson = entry.lessonId;
                              if (!lesson) return null;
                              return (
                                <li key={lesson._id.toString()}>
                                  <Link
                                    href={`/learn/${lesson.slug}`}
                                    className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-1"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400 dark:bg-primary-500 shrink-0" />
                                    {lesson.title[locale] ||
                                      lesson.title.en}
                                  </Link>
                                </li>
                              );
                            })}
                        </ul>
                      )}
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        )}

        {/* Empty state — no subtopics and no modules */}
        {subtopics.length === 0 && modules.length === 0 && (
          <AnimateIn preset="fade-in">
            <p className="text-center text-slate-500 dark:text-slate-400 py-12">
              {t("noTopics")}
            </p>
          </AnimateIn>
        )}
      </Container>
    </section>
  );
}
