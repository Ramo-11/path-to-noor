import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, BookOpen, Clock, Layers } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth-config";
import { getCompletedLessonIds, getPathOutlineBySlug } from "@/lib/learning";
import { STAGE_STYLES, localized } from "@/lib/stages";
import { Illustration } from "@/components/primer/Illustration";
import { StageChip } from "@/components/primer/StageChip";
import { pathArt } from "@/lib/illustrations";
import { JourneyAction } from "@/components/paths/JourneyAction";
import { JourneyEnd } from "@/components/paths/JourneyEnd";
import { MetaChips } from "@/components/paths/MetaChips";
import { OutcomesCard } from "@/components/paths/OutcomesCard";
import { StepSection } from "@/components/paths/StepSection";
import { StepTabs, type StepState, type StepTab } from "@/components/paths/StepTabs";
import { pathDuration } from "@/components/paths/duration";

type Params = Promise<{ locale: string; slug: string }>;

const loadPath = cache(
  async (slug: string, userId: string | undefined, userType: string | undefined) => {
    const completed = await getCompletedLessonIds(userId);
    return getPathOutlineBySlug(slug, completed, { userType, isGuest: !userId });
  }
);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const session = await auth();
  const path = await loadPath(slug, session?.user?.id, session?.user?.userType);
  if (!path) {
    const t = await getTranslations({ locale, namespace: "paths" });
    return { title: t("notFoundTitle") };
  }
  return {
    title: localized(path.title, locale),
    description: localized(path.description, locale),
  };
}

export default async function PathJourneyPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  const path = await loadPath(slug, userId, session?.user?.userType);
  if (!path) notFound();

  const [t, tl] = await Promise.all([getTranslations("paths"), getTranslations("learning")]);

  const signedIn = Boolean(userId);
  const started = signedIn && path.completedLessons > 0;
  const complete = signedIn && path.isComplete;
  const next = complete ? null : path.nextLesson;
  const currentStepIndex = next ? next.stepIndex : -1;
  const spineSplit = started ? Math.max(0, complete ? path.steps.length - 1 : currentStepIndex) : 0;
  const title = localized(path.title, locale);
  const description = localized(path.description, locale);
  const duration = pathDuration(path);
  const stageStyle = STAGE_STYLES[path.stage];

  const states: StepState[] = path.steps.map((step, index) => {
    if (step.isPreparing) return "preparing";
    if (signedIn && step.isComplete) return "complete";
    if (index === currentStepIndex) return "current";
    return "upcoming";
  });

  const tabs: StepTab[] = path.steps.map((step, index) => {
    const number = index + 1;
    const state = states[index];
    const base = {
      id: `step-${number}`,
      number,
      numberLabel: tl("stepNumber", { number }),
      title: localized(step.title, locale),
      state,
    };
    if (state === "preparing") return { ...base, status: tl("comingSoon") };
    if (state === "complete") return { ...base, status: tl("done") };
    if (state === "current") return { ...base, status: started ? t("youAreHere") : t("startHere") };
    if (signedIn) {
      const counts = { done: step.completedCount, total: step.lessons.length };
      return { ...base, status: t("stepFraction", counts), statusLabel: tl("lessonsDone", counts) };
    }
    return { ...base, status: tl("lessonCount", { count: step.lessons.length }) };
  });

  const sections = path.steps.map((step, index) => (
    <StepSection
      key={step.id}
      step={step}
      number={index + 1}
      isLast={index === path.steps.length - 1}
      state={states[index]}
      stage={path.stage}
      locale={locale}
      signedIn={signedIn}
      nextLessonId={next?.id ?? null}
    />
  ));
  const passed = sections.slice(0, spineSplit);
  const ahead = sections.slice(spineSplit);

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="pt-6 sm:pt-8">
          <Link
            href="/paths"
            className="inline-flex min-h-11 items-center gap-2 text-[0.9375rem] text-ink-2 transition-colors duration-150 hover:text-ink"
          >
            <ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
            {t("allPaths")}
          </Link>
        </div>

        <header
          className={`mt-6 grid overflow-hidden rounded-[var(--radius-panel)] sm:mt-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] ${stageStyle.tint}`}
        >
          <div className="flex flex-col justify-center px-6 pt-8 pb-6 sm:px-10 sm:pt-12 md:py-14 lg:px-14">
            <h1 className="text-title font-semibold text-balance">{title}</h1>
            {description ? (
              <p className="mt-3 line-clamp-2 max-w-[52ch] text-lg text-ink-2 text-pretty">{description}</p>
            ) : null}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <StageChip stage={path.stage} />
              <MetaChips
                items={[
                  { icon: Layers, label: tl("stepCount", { count: path.steps.length }) },
                  {
                    icon: BookOpen,
                    label:
                      path.totalLessons > 0
                        ? tl("lessonCount", { count: path.totalLessons })
                        : t("lessonsPreparing"),
                  },
                  duration ? { icon: Clock, label: tl(duration.key, { count: duration.count }) } : null,
                ]}
              />
            </div>
            <div className="mt-7">
              <JourneyAction path={path} locale={locale} signedIn={signedIn} />
            </div>
          </div>

          <div className="px-3 pb-3 md:py-3 md:ps-0">
            <div className="aspect-[16/9] overflow-hidden rounded-[calc(var(--radius-panel)-0.5rem)] md:aspect-auto md:h-full md:min-h-[16rem]">
              <Illustration
                name={pathArt(path.slug, path.stage)}
                sizes="(min-width: 768px) 48vw, 100vw"
                priority
              />
            </div>
          </div>
        </header>

        {path.outcomes.length > 0 ? (
          <div className="pt-8 sm:pt-10">
            <OutcomesCard title={t("outcomesTitle")} outcomes={path.outcomes} stage={path.stage} locale={locale} />
          </div>
        ) : null}
      </div>

      {path.steps.length > 0 ? (
        <div className="mt-10 border-t border-rule sm:mt-14">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14 xl:grid-cols-[17rem_minmax(0,1fr)] xl:gap-20">
              <StepTabs tabs={tabs} stage={path.stage} label={t("stepsNav")} />

              <div className="min-w-0 pt-10 pb-20 sm:pt-14 sm:pb-24 lg:pt-16">
                {passed.length > 0 ? (
                  <div className="relative">
                    <span
                      aria-hidden="true"
                      className={`fill-up absolute inset-y-0 start-[calc(1.375rem-1px)] z-[5] w-0.5 -scale-y-100 sm:start-[calc(2.5rem-1px)] ${stageStyle.fill}`}
                    />
                    {passed}
                  </div>
                ) : null}
                {ahead}
                <JourneyEnd
                  complete={complete}
                  stage={path.stage}
                  title={title}
                  totalLessons={path.totalLessons}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
