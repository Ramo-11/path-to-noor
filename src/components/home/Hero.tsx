import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { StageMark } from "@/components/primer/StageMark";
import { Illustration } from "@/components/primer/Illustration";
import { ChangeTrack } from "@/components/tracks/ChangeTrack";
import { TrackChooser } from "@/components/tracks/TrackChooser";
import { TrackPreparing } from "@/components/tracks/TrackPreparing";
import { STAGE_NUMBER, type StageKey } from "@/lib/stages";
import { TRACK_HREF, type TrackKey } from "@/lib/tracks";
import type { PathView, StartCandidates } from "@/components/placement/recommendations";
import { ContinueCard } from "./ContinueCard";
import { StartAction } from "./StartAction";

const titleClass =
  "text-[clamp(2.4rem,3vw+1.25rem,4rem)] leading-[1.04] font-semibold tracking-[-0.035em] text-balance";
const leadClass = "max-w-[44ch] text-lg text-ink-2 text-pretty sm:text-xl sm:leading-relaxed";

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
    <section aria-labelledby="home-title" className="glow-dawn">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pt-8 pb-12 sm:px-6 sm:pt-14 sm:pb-16 lg:grid-cols-12 lg:gap-14 lg:px-8 lg:pt-16 lg:pb-20">
        <div className="lg:col-span-6">
          <h1 id="home-title" className={titleClass}>
            {title}
          </h1>
          <div className="mt-6">{children}</div>
          {after ? <div className="mt-6">{after}</div> : null}
        </div>
        <div className="lg:col-span-6">{aside}</div>
      </div>
    </section>
  );
}

function HeroArt() {
  return (
    <div className="aspect-[4/3] overflow-hidden rounded-[var(--radius-panel)] shadow-lift">
      <Illustration name="hero-dawn" sizes="(min-width: 1024px) 540px, 100vw" priority />
    </div>
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

function TrackLine({ track }: { track: TrackKey }) {
  const t = useTranslations("tracks");
  return (
    <p className="inline-flex items-center self-start rounded-full bg-primary-tint px-3.5 py-1.5 text-[0.9375rem] font-medium text-primary">
      {t(`${track}.title`)}
    </p>
  );
}

function AfterLinks({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-x-8 gap-y-1">{children}</div>;
}

export function ChooserHero() {
  const t = useTranslations("home.hero");

  return (
    <section aria-labelledby="home-title" className="glow-dawn">
      <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-12 sm:px-6 sm:pt-14 sm:pb-16 lg:px-8 lg:pt-16 lg:pb-20">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <h1 id="home-title" className={titleClass}>
              {t("title")}
            </h1>
            <p className={`mt-6 ${leadClass}`}>{t("lead")}</p>
          </div>
          <div className="hidden lg:col-span-5 lg:block">
            <div className="aspect-[4/3] overflow-hidden rounded-[var(--radius-panel)] shadow-lift">
              <Illustration name="hero-dawn" sizes="440px" priority />
            </div>
          </div>
        </div>
        <div id="where" className="scroll-mt-20">
          <TrackChooser headingId="home-question" className="mt-10 sm:mt-12" />
        </div>
      </div>
    </section>
  );
}

export function NewStartHero({
  candidates,
  reflectStored,
}: {
  candidates: StartCandidates;
  reflectStored: boolean;
}) {
  const t = useTranslations("home.newStart");

  return (
    <HeroFrame
      title={t("title")}
      aside={<HeroArt />}
      after={
        <AfterLinks>
          <ChangeTrack />
        </AfterLinks>
      }
    >
      <div className="flex flex-col gap-6">
        <TrackLine track="new" />
        <p className={leadClass}>{t("lead")}</p>
      </div>
      <div className="mt-8">
        <StartAction candidates={candidates} reflectStored={reflectStored} />
      </div>
    </HeroFrame>
  );
}

export function TrackReadyHero({
  track,
  path,
  firstName,
}: {
  track: Exclude<TrackKey, "new">;
  path: PathView | null;
  firstName: string | null;
}) {
  const t = useTranslations("home.welcome");
  const tReady = useTranslations("home.ready");
  const tHome = useTranslations("home");
  const tLearning = useTranslations("learning");
  const tTracks = useTranslations("tracks");
  const started = Boolean(path?.isStarted);
  const ready = path && path.next && !path.isComplete ? path : null;

  return (
    <HeroFrame
      title={firstName ? t("greeting", { name: firstName }) : t("greetingPlain")}
      aside={
        ready ? (
          <ContinueCard
            path={ready}
            actionLabel={started ? t("continue") : tReady("start")}
            meta={
              started
                ? undefined
                : tHome("paths.counts", {
                    steps: tLearning("stepCount", { count: ready.steps.length }),
                    lessons: tLearning("lessonCount", { count: ready.totalLessons }),
                  })
            }
          />
        ) : (
          <TrackPreparing askLink={track === "curious"} />
        )
      }
      after={
        <AfterLinks>
          {track === "muslim" || !ready ? (
            <Button href={TRACK_HREF[track]} variant="quiet">
              {tTracks(`${track}.seeAll`)}
            </Button>
          ) : null}
          <ChangeTrack />
        </AfterLinks>
      }
    >
      <div className="flex flex-col gap-6">
        <TrackLine track={track} />
        <p className={leadClass}>{started ? t("lead") : tReady("lead")}</p>
      </div>
    </HeroFrame>
  );
}

export function WelcomeHero({
  path,
  stage,
  firstName,
  showChange = false,
}: {
  path: PathView;
  stage: StageKey | null;
  firstName: string | null;
  showChange?: boolean;
}) {
  const t = useTranslations("home.welcome");

  return (
    <HeroFrame
      title={firstName ? t("greeting", { name: firstName }) : t("greetingPlain")}
      aside={<ContinueCard path={path} actionLabel={t("continue")} />}
      after={
        <AfterLinks>
          <Button href="/journey" variant="quiet">
            {t("journey")}
          </Button>
          {showChange ? <ChangeTrack /> : null}
        </AfterLinks>
      }
    >
      <div className="flex flex-col gap-6">
        {stage && path.stage ? <StageLine stage={stage} /> : null}
        <p className={leadClass}>{t("lead")}</p>
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
        <AfterLinks>
          <Button href="/start" variant="quiet">
            {t("retake")}
          </Button>
          <ChangeTrack />
        </AfterLinks>
      }
    >
      <div className="flex flex-col gap-6">
        <StageLine stage={stage} />
        <p className={leadClass}>{t("lead")}</p>
      </div>
    </HeroFrame>
  );
}
