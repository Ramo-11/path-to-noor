import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPublicTopics } from "@/lib/data";
import { Container } from "@/components/layout/Container";
import {
  AnimateIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/AnimateIn";
import { TopicIconPublic } from "@/components/shared/TopicIconPublic";

export default async function TopicsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("topics");
  const topics = await getPublicTopics();

  // Only show root topics (no parent)
  const rootTopics = topics.filter((topic: any) => !topic.parent);

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

        {rootTopics.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-12">
            {t("noTopics")}
          </p>
        ) : (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rootTopics.map((topic: any) => {
              return (
                <StaggerItem key={topic._id.toString()}>
                  <Link href={`/topics/${topic.slug}`} className="block group">
                    <div className="card-hover rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-6 h-full">
                      {topic.icon && (
                        <TopicIconPublic name={topic.icon} />
                      )}
                      <h2 className="font-heading text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {(topic.name as any)[locale] || topic.name.en}
                      </h2>
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3">
                        {(topic.description as any)[locale] ||
                          topic.description.en}
                      </p>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </Container>
    </section>
  );
}
