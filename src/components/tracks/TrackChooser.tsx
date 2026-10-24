"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Illustration } from "@/components/primer/Illustration";
import { Spinner } from "@/components/primer/Spinner";
import { Link } from "@/i18n/navigation";
import { TRACK_ART } from "@/lib/illustrations";
import { TRACKS, TRACK_HREF, type TrackKey } from "@/lib/tracks";
import { saveAccountTrack, writeStoredTrack } from "./storage";

interface TrackChooserProps {
  headingId: string;
  headingLevel?: "h2" | "h3";
  onSelect?: (track: TrackKey) => void;
  pending?: TrackKey | null;
  className?: string;
}

function CardBody({ track, busy }: { track: TrackKey; busy: boolean }) {
  const t = useTranslations("tracks");

  return (
    <>
      <span className="m-2 block size-20 shrink-0 overflow-hidden rounded-[calc(var(--radius-cell)-0.375rem)] sm:m-0 sm:aspect-[16/9] sm:size-auto sm:rounded-none">
        <Illustration
          name={TRACK_ART[track]}
          sizes="(min-width: 1152px) 360px, (min-width: 640px) 33vw, 80px"
          className="transition-transform duration-500 ease-[var(--ease-fill)] group-hover:scale-[1.03]"
        />
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-3 py-3 pe-4 ps-2 sm:items-end sm:p-5">
        <span className="min-w-0 flex-1 text-start">
          <span className="block text-lg leading-snug font-semibold text-balance text-ink">
            {t(`${track}.title`)}
          </span>
          <span className="mt-1 block text-[0.9375rem] leading-relaxed text-ink-2 text-pretty">
            {t(`${track}.line`)}
          </span>
        </span>
        <span aria-hidden="true" className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary">
          {busy ? (
            <Spinner />
          ) : (
            <ArrowRight
              strokeWidth={2}
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
            />
          )}
        </span>
      </span>
    </>
  );
}

export function TrackChooser({
  headingId,
  headingLevel = "h2",
  onSelect,
  pending = null,
  className = "",
}: TrackChooserProps) {
  const t = useTranslations("tracks");
  const { status, update } = useSession();
  const Heading = headingLevel;

  function rememberChoice(track: TrackKey) {
    writeStoredTrack(track);
    if (status === "authenticated") {
      void saveAccountTrack(track).then((saved) => (saved ? update({ track }) : null));
    }
  }

  const cardClass =
    "card card-link group flex w-full items-center overflow-hidden sm:flex-col sm:items-stretch disabled:pointer-events-none disabled:opacity-60";

  return (
    <div className={className}>
      <Heading id={headingId} className="text-heading font-semibold text-balance">
        {t("question")}
      </Heading>
      <ul aria-labelledby={headingId} className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-5">
        {TRACKS.map((track) => (
          <li key={track} className="flex">
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(track)}
                disabled={pending !== null}
                aria-busy={pending === track || undefined}
                className={cardClass}
              >
                <CardBody track={track} busy={pending === track} />
              </button>
            ) : (
              <Link href={TRACK_HREF[track]} onClick={() => rememberChoice(track)} className={cardClass}>
                <CardBody track={track} busy={false} />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
