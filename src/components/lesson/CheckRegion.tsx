"use client";

import { notFound } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";
import { Notice } from "@/components/primer/Notice";
import { useLearner } from "@/lib/use-learner";
import type { ClientQuiz } from "./check-quiz";
import { KnowledgeCheck } from "./KnowledgeCheck";
import type { LessonPlace } from "./lesson-context";
import type { CheckMemberPayload } from "./member-types";
import { useMemberResource } from "./use-member-resource";

interface CheckRegionProps {
  slug: string;
  lessonTitle: string;
  lessonHref: string;
  guestQuiz: ClientQuiz | null | undefined;
  guestPlace: LessonPlace | null;
  wall: React.ReactNode;
}

function Interactive({
  slug,
  lessonTitle,
  lessonHref,
  quiz,
  place,
  signedIn,
}: {
  slug: string;
  lessonTitle: string;
  lessonHref: string;
  quiz: ClientQuiz | null;
  place: LessonPlace | null;
  signedIn: boolean;
}) {
  const t = useTranslations("check");

  if (!quiz) {
    return (
      <div className="mt-10">
        <EmptyState
          title={t("emptyTitle")}
          body={t("emptyBody")}
          art="lantern"
          action={
            <Button size="lg" href={lessonHref}>
              {t("backToLesson")}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <>
      <p className="mt-4 max-w-[60ch] text-lg text-ink-2 text-pretty">
        {t("lead", { lesson: lessonTitle, count: quiz.questions.length })}
      </p>
      <KnowledgeCheck
        slug={slug}
        quizId={quiz.id}
        questions={quiz.questions}
        signedIn={signedIn}
        upNext={place?.upNext ? { slug: place.upNext.slug, title: place.upNext.title } : null}
        path={place?.path ? { slug: place.path.slug, title: place.path.title, stage: place.path.stage } : null}
      />
    </>
  );
}

export function CheckRegion({ slug, lessonTitle, lessonHref, guestQuiz, guestPlace, wall }: CheckRegionProps) {
  const locale = useLocale();
  const t = useTranslations("common");
  const { status } = useLearner();
  const resource = useMemberResource<CheckMemberPayload>(
    `/api/me/learn/${encodeURIComponent(slug)}/check?locale=${encodeURIComponent(locale)}`
  );
  const signedIn = status === "signedIn";
  const common = { slug, lessonTitle, lessonHref, signedIn };

  if (resource.kind === "ready" && resource.data.access === "hidden") notFound();
  const member = resource.kind === "ready" && resource.data.access === "open" ? resource.data : null;

  if (guestQuiz !== undefined) {
    return <Interactive {...common} quiz={guestQuiz} place={member?.place ?? guestPlace} />;
  }

  if (member) {
    return (
      <div className="settle">
        <Interactive {...common} quiz={member.quiz} place={member.place} />
      </div>
    );
  }

  if (resource.kind === "error") {
    return (
      <div className="mt-10 flex flex-col items-start gap-3">
        <Notice tone="error">{t("error")}</Notice>
        <Button variant="quiet" onClick={resource.retry}>
          {t("tryAgain")}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div data-guest-only>{wall}</div>
      {resource.kind === "loading" ? (
        <div data-member-skeleton aria-hidden="true" className="mt-10 h-96 animate-pulse rounded-[var(--radius-panel)] bg-primary-tint" />
      ) : null}
    </>
  );
}
