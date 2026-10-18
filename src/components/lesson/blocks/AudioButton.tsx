"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Square, Volume2 } from "lucide-react";
import { track } from "@/lib/analytics";

type Status = "idle" | "loading" | "playing" | "error";

const RATES = [1, 1.5, 2] as const;
const RATE_KEY = "bd.audioRate";
const RATE_EVENT = "bd-audio-rate";

function subscribeRate(onChange: () => void) {
  window.addEventListener(RATE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(RATE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

let memoryRate: number | null = null;

function storedRate(): number {
  if (memoryRate) return memoryRate;
  try {
    const value = Number(window.localStorage.getItem(RATE_KEY));
    return (RATES as readonly number[]).includes(value) ? value : 1;
  } catch {
    return 1;
  }
}

function applyRate(audio: HTMLAudioElement, rate: number) {
  audio.defaultPlaybackRate = rate;
  audio.playbackRate = rate;
  audio.preservesPitch = true;
}

let shared: HTMLAudioElement | null = null;
let resetOwner: (() => void) | null = null;

function player(): HTMLAudioElement {
  if (!shared) {
    shared = new Audio();
    shared.preload = "none";
  }
  return shared;
}

function halt() {
  if (!shared) return;
  shared.onended = null;
  shared.onerror = null;
  shared.onplaying = null;
  shared.onwaiting = null;
  shared.pause();
}

interface AudioButtonProps {
  clips: string[];
  lessonSlug: string;
  className?: string;
}

export function AudioButton({
  clips,
  lessonSlug,
  className = "",
}: AudioButtonProps) {
  const t = useTranslations("blocks");
  const [status, setStatus] = useState<Status>("idle");
  const rate = useSyncExternalStore(subscribeRate, storedRate, () => 1);
  const rateRef = useRef(rate);
  const mounted = useRef(true);
  const reset = useCallback(() => {
    if (mounted.current) setStatus("idle");
  }, []);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  const cycleRate = useCallback(() => {
    const next =
      RATES[
        (RATES.indexOf(rateRef.current as (typeof RATES)[number]) + 1) %
          RATES.length
      ];
    rateRef.current = next;
    memoryRate = next;
    try {
      window.localStorage.setItem(RATE_KEY, String(next));
    } catch {}
    window.dispatchEvent(new Event(RATE_EVENT));
    if (shared && resetOwner === reset) applyRate(shared, next);
  }, [reset]);

  useEffect(() => {
    mounted.current = true;
    const mine = reset;
    return () => {
      mounted.current = false;
      if (resetOwner === mine) {
        halt();
        resetOwner = null;
      }
    };
  }, [reset]);

  const stop = useCallback(() => {
    halt();
    resetOwner = null;
    setStatus("idle");
  }, []);

  const start = useCallback(() => {
    if (resetOwner && resetOwner !== reset) resetOwner();
    halt();
    const audio = player();
    resetOwner = reset;
    let index = 0;

    const fail = () => {
      halt();
      if (resetOwner === reset) resetOwner = null;
      if (mounted.current) setStatus("error");
    };

    const playClip = () => {
      audio.src = clips[index];
      applyRate(audio, rateRef.current);
      setStatus("loading");
      audio.play().catch(fail);
    };

    audio.onplaying = () => mounted.current && setStatus("playing");
    audio.onwaiting = () => mounted.current && setStatus("loading");
    audio.onerror = fail;
    audio.onended = () => {
      index += 1;
      if (index < clips.length) {
        playClip();
        return;
      }
      halt();
      if (resetOwner === reset) resetOwner = null;
      if (mounted.current) setStatus("idle");
    };

    track("audio_played", { lesson: lessonSlug });
    playClip();
  }, [clips, lessonSlug, reset]);

  if (clips.length === 0) return null;

  const active = status === "loading" || status === "playing";
  const Icon = status === "loading" ? Loader2 : active ? Square : Volume2;
  const label =
    status === "error" ? t("audioError") : active ? t("stop") : t("listen");

  return (
    <div className={className}>
      <div className="inline-flex items-center gap-2">
        <button
          type="button"
          onClick={active ? stop : start}
          aria-pressed={active}
          className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-[0.9375rem] font-medium transition-colors duration-150 ${
            status === "error"
              ? "border-danger bg-surface text-danger hover:bg-danger-tint"
              : "border-rule bg-surface text-ink shadow-soft hover:border-rule-strong hover:bg-wash"
          }`}
        >
          <Icon
            aria-hidden="true"
            strokeWidth={2}
            className={`size-4 ${status === "loading" ? "animate-spin motion-reduce:animate-none" : ""}`}
          />
          {label}
        </button>
        <button
          type="button"
          onClick={cycleRate}
          aria-label={t("speedLabel", { rate: `${rate}x` })}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-rule bg-surface px-3 text-[0.9375rem] font-medium text-ink-2 tabular transition-colors duration-150 hover:border-rule-strong hover:bg-wash"
        >
          {rate}x
        </button>
      </div>
      <p aria-live="polite" className="sr-only">
        {status === "loading"
          ? t("audioLoading")
          : status === "error"
            ? t("audioError")
            : ""}
      </p>
    </div>
  );
}
