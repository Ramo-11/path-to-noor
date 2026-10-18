"use client";

import Image from "next/image";
import { Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { StoryView } from "./story-view";
import { HomeSection } from "./HomeSection";

const COLUMNS: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
};

function StoryCell({
  story,
  single,
  onWatch,
}: {
  story: StoryView;
  single: boolean;
  onWatch: (story: StoryView) => void;
}) {
  const t = useTranslations("home.stories");

  return (
    <li className={`flex snap-start flex-col ${single ? "md:grid md:grid-cols-2" : ""}`}>
      {story.video ? (
        <button
          type="button"
          onClick={() => onWatch(story)}
          aria-label={t("watch", { name: story.personName })}
          className={`group relative block aspect-video w-full overflow-hidden bg-wash focus-visible:outline-offset-[-4px]! ${
            single ? "md:aspect-auto md:h-full md:min-h-72" : ""
          }`}
        >
          {story.thumbnail ? (
            <Image
              src={story.thumbnail}
              alt=""
              fill
              unoptimized
              sizes="(min-width: 768px) 33vw, 82vw"
              className="object-cover"
            />
          ) : null}
          <span className="absolute start-4 bottom-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-[0.875rem] font-medium text-on-primary shadow-soft transition-colors duration-150 group-hover:bg-primary-hover">
            <Play aria-hidden="true" strokeWidth={2} className="size-4" fill="currentColor" />
            {t("play")}
          </span>
        </button>
      ) : null}
      <div className="flex flex-1 flex-col px-6 py-7 sm:px-7">
        <h3 className="text-xl leading-snug font-semibold text-balance">{story.title}</h3>
        {story.excerpt ? (
          <p className="mt-3 line-clamp-5 text-ink-2 text-pretty">{story.excerpt}</p>
        ) : null}
        <p className="mt-auto pt-6 text-[0.9375rem] font-medium text-ink">{story.personName}</p>
      </div>
    </li>
  );
}

export function Stories({ stories }: { stories: StoryView[] }) {
  const t = useTranslations("home.stories");
  const [playing, setPlaying] = useState<StoryView | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (playing && !dialog.open) dialog.showModal();
    if (!playing && dialog.open) dialog.close();
  }, [playing]);

  if (stories.length === 0) return null;

  const single = stories.length === 1;

  function watch(story: StoryView) {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPlaying(story);
  }

  function handleClose() {
    setPlaying(null);
    returnFocus.current?.focus();
  }

  return (
    <HomeSection labelledBy="home-stories">
      <h2 id="home-stories" className="text-title font-semibold text-balance">
        {t("title")}
      </h2>
      <p className="mt-4 max-w-[60ch] text-lg text-ink-2 text-pretty">{t("lead")}</p>

      <div className="-mx-4 mt-10 snap-x snap-mandatory scroll-px-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:mt-12 sm:scroll-px-6 sm:px-6 md:mx-0 md:overflow-visible md:px-0 md:pb-0">
        <ul
          className={`primer-grid w-max auto-cols-[min(20rem,80vw)] grid-flow-col md:w-full md:auto-cols-auto md:grid-flow-row ${
            COLUMNS[Math.min(stories.length, 3)]
          }`}
        >
          {stories.map((story) => (
            <StoryCell key={story.id} story={story} single={single} onWatch={watch} />
          ))}
        </ul>
      </div>

      <dialog
        ref={dialogRef}
        onClose={handleClose}
        onClick={(event) => {
          if (event.target === event.currentTarget) setPlaying(null);
        }}
        aria-labelledby="story-video-title"
        className="m-auto w-[min(56rem,calc(100vw-2rem))] max-w-none overflow-hidden rounded-[var(--radius-cell)] border border-rule bg-surface p-0 text-ink shadow-lift backdrop:bg-ink/60"
      >
        {playing ? (
          <div>
            <div className="flex items-center justify-between gap-4 border-b border-rule ps-5 pe-2">
              <p id="story-video-title" className="min-w-0 truncate py-3 font-medium">
                {t("videoTitle", { name: playing.personName })}
              </p>
              <button
                type="button"
                onClick={() => setPlaying(null)}
                aria-label={t("close")}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink-2 transition-colors duration-150 hover:bg-wash hover:text-ink"
              >
                <X aria-hidden="true" strokeWidth={1.75} className="size-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-wash">
              {playing.video?.kind === "youtube" ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${playing.video.id}?autoplay=1&rel=0`}
                  title={t("videoTitle", { name: playing.personName })}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="size-full border-0"
                />
              ) : playing.video?.kind === "upload" ? (
                <video src={playing.video.url} controls autoPlay playsInline className="size-full">
                  <track kind="captions" />
                </video>
              ) : null}
            </div>
          </div>
        ) : null}
      </dialog>
    </HomeSection>
  );
}
