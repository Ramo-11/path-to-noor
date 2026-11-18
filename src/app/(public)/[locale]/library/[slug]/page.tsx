import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getPublicTopicBySlug } from "@/lib/data";
import { localized } from "@/lib/stages";
import { artTone, libraryArt } from "@/lib/illustrations";
import { PageBanner } from "@/components/primer/PageBanner";
import { SubjectSections } from "@/components/library/SubjectSections";
import {
  SubjectBannerMember,
  SubjectBodyMember,
  SubjectMemberProvider,
} from "@/components/library/SubjectMember";
import { buildSubjectContent } from "@/components/library/library-data";

export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

interface ParentTopic {
  slug: string;
  name: { en: string; ar?: string; es?: string };
}

const loadTopic = cache((slug: string) => getPublicTopicBySlug(slug));

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const topic = await loadTopic(slug);
  if (!topic) return {};
  return {
    title: localized(topic.name, locale),
    description: localized(topic.description, locale),
  };
}

export default async function LibrarySubjectPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("library");

  const topic = await loadTopic(slug);
  if (!topic) notFound();
  const topicId = topic._id.toString();
  const subjectName = localized(topic.name, locale);

  const content = await buildSubjectContent(topicId, { isGuest: true }, locale);
  const parent = topic.parent as unknown as ParentTopic | null | undefined;

  return (
    <SubjectMemberProvider slug={slug}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-1.5 pt-8 text-meta text-ink-3">
          <Link href="/library" className="inline-flex items-center gap-1.5 hover:text-ink">
            <ArrowLeft className="size-3.5 rtl:rotate-180" aria-hidden="true" />
            {t("backToLibrary")}
          </Link>
          {parent ? (
            <>
              <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
              <Link href={`/library/${parent.slug}`} className="hover:text-ink">
                {localized(parent.name, locale)}
              </Link>
            </>
          ) : null}
        </div>

        <PageBanner
          title={subjectName}
          lead={localized(topic.description, locale)}
          art={libraryArt(topic.slug)}
          tone={artTone(libraryArt(topic.slug))}
        >
          <SubjectBannerMember topicId={topicId} />
        </PageBanner>

        <div className="pt-10 pb-16 sm:pb-24">
          <SubjectBodyMember subjectName={subjectName}>
            <SubjectSections subjectName={subjectName} content={content} completedLessonIds={[]} />
          </SubjectBodyMember>
        </div>
      </div>
    </SubjectMemberProvider>
  );
}
