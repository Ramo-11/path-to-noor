import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth-config";
import { getCompletedLessonIds, getPathOutlineBySlug } from "@/lib/learning";
import { STAGE_NUMBER, STAGE_STYLES, localized } from "@/lib/stages";
import { StageMark } from "@/components/primer/StageMark";
import { JourneyAction } from "@/components/paths/JourneyAction";
import { JourneyEnd } from "@/components/paths/JourneyEnd";
import { MetaList } from "@/components/paths/MetaList";
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

  const [t, tl, ts] = await Promise.all([
    getTranslations("paths"),
    getTranslations("learning"),
    getTranslations("stages"),
  ]);

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

        <header className="grid pt-6 pb-12 sm:pt-8 sm:pb-16 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-7">
            <p className="flex items-center gap-3 font-medium text-ink-2">
              <StageMark stage={path.stage} size="md" />
              {t("stageLine", {
                number: STAGE_NUMBER[path.stage],
                name: ts(`${path.stage}.name`),
              })}
            </p>
            <h1 className="mt-5 text-title font-semibold text-balance">{title}</h1>
            {description ? (
              <p className="mt-4 max-w-[60ch] text-lg text-ink-2 text-pretty">{description}</p>
            ) : null}
            <MetaList
              className="mt-5"
              items={[
                tl("stepCount", { count: path.steps.length }),
                path.totalLessons > 0
                  ? tl("lessonCount", { count: path.totalLessons })
                  : t("lessonsPreparing"),
                duration ? tl(duration.key, { count: duration.count }) : null,
              ]}
            />
          </div>

          <div className="mt-8 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:mt-1 lg:self-start">
            <JourneyAction path={path} locale={locale} signedIn={signedIn} />
          </div>

          {path.outcomes.length > 0 ? (
            <div className="mt-10 lg:col-span-7">
              <h2 className="font-semibold text-ink">{t("outcomesTitle")}</h2>
              <ul className="mt-3 max-w-[60ch] list-disc space-y-2 ps-5 text-ink-2 marker:text-ink">
                {path.outcomes.map((outcome, index) => (
                  <li key={index} className="ps-1 text-pretty">
                    {localized(outcome, locale)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </header>
      </div>

      {path.steps.length > 0 ? (
        <div className="border-t border-rule">
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
