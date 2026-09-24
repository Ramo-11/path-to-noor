import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { StageMark } from "@/components/primer/StageMark";
import { StageGrid } from "@/components/placement/StageGrid";
import { STAGE_NUMBER, type StageKey } from "@/lib/stages";
import type { PathView, StartCandidates } from "@/components/placement/recommendations";
import { ContinueCard } from "./ContinueCard";
import { StartAction } from "./StartAction";

function HeroFrame({
  title,
  aside,
  after,
  children,
}: {
  title: React.ReactNode;
  aside: React.ReactNode;
  after?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby="home-title"
      className="mx-auto w-full max-w-6xl px-4 pt-10 pb-16 sm:px-6 sm:pt-16 sm:pb-24 lg:px-8 lg:pt-20"
    >
      <h1 id="home-title" className="text-display font-semibold text-balance">
        {title}
      </h1>
      <div className="mt-6 grid gap-10 sm:mt-8 sm:gap-12 lg:mt-12 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-6">
        <div className="lg:col-span-5 lg:col-start-1 lg:row-start-1">{children}</div>
        <div className="lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">{aside}</div>
        {after ? <div className="lg:col-span-5 lg:col-start-1 lg:row-start-2">{after}</div> : null}
      </div>
    </section>
  );
}

function StageLine({ stage }: { stage: StageKey }) {
  const t = useTranslations("home.welcome");
  const tStages = useTranslations("stages");
  return (
    <p className="flex items-center gap-3 text-lg font-medium">
      <StageMark stage={stage} size="md" />
      <span>{t("stageLine", { number: STAGE_NUMBER[stage], name: tStages(`${stage}.name`) })}</span>
    </p>
  );
}

export function DefaultHero({
  candidates,
  reflectStored,
}: {
  candidates: StartCandidates;
  reflectStored: boolean;
}) {
  const t = useTranslations("home.hero");

  return (
    <HeroFrame
      title={
        <>
          <span className="block">{t("titleLine1")}</span>
          <span className="block">{t("titleLine2")}</span>
        </>
      }
      aside={<StageGrid label={t("stagesTitle")} />}
    >
      <p className="max-w-[46ch] text-lg text-ink-2 text-pretty sm:text-xl sm:leading-relaxed">
        {t("lead")}
      </p>
      <div className="mt-8">
        <StartAction candidates={candidates} reflectStored={reflectStored} />
      </div>
      <Button href="/paths" variant="quiet" className="mt-3">
        {t("browse")}
      </Button>
    </HeroFrame>
  );
}

export function WelcomeHero({
  path,
  stage,
  firstName,
}: {
  path: PathView;
  stage: StageKey | null;
  firstName: string | null;
}) {
  const t = useTranslations("home.welcome");
  const tHero = useTranslations("home.hero");

  return (
    <HeroFrame
      title={firstName ? t("greeting", { name: firstName }) : t("greetingPlain")}
      aside={<ContinueCard path={path} actionLabel={t("continue")} />}
      after={
        <div className="flex flex-wrap items-center gap-x-8">
          <Button href="/journey" variant="quiet">
            {t("journey")}
          </Button>
          <Button href="/paths" variant="quiet">
            {tHero("browse")}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {stage ? <StageLine stage={stage} /> : null}
        <p className="max-w-[46ch] text-lg text-ink-2 text-pretty sm:text-xl sm:leading-relaxed">
          {t("lead")}
        </p>
      </div>
    </HeroFrame>
  );
}

export function ReadyHero({
  path,
  stage,
  isFallback,
  firstName,
}: {
  path: PathView;
  stage: StageKey;
  isFallback: boolean;
  firstName: string | null;
}) {
  const t = useTranslations("home.ready");
  const tHome = useTranslations("home");
  const tLearning = useTranslations("learning");

  return (
    <HeroFrame
      title={firstName ? t("greeting", { name: firstName }) : t("greetingPlain")}
      aside={
        <ContinueCard
          path={path}
          actionLabel={t("start")}
          meta={tHome("paths.counts", {
            steps: tLearning("stepCount", { count: path.steps.length }),
            lessons: tLearning("lessonCount", { count: path.totalLessons }),
          })}
          note={isFallback ? t("fallback") : undefined}
        />
      }
      after={
        <div className="flex flex-wrap items-center gap-x-8">
          <Button href="/start" variant="quiet">
            {t("retake")}
          </Button>
          <Button href="/paths" variant="quiet">
            {tHome("hero.browse")}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <StageLine stage={stage} />
        <p className="max-w-[46ch] text-lg text-ink-2 text-pretty sm:text-xl sm:leading-relaxed">
          {t("lead")}
        </p>
      </div>
    </HeroFrame>
  );
}
