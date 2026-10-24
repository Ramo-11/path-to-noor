"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { Illustration } from "@/components/primer/Illustration";
import { Notice } from "@/components/primer/Notice";
import { Spinner } from "@/components/primer/Spinner";
import { TrackChooser } from "@/components/tracks/TrackChooser";
import { saveAccountTrack, useStoredTrack, writeStoredTrack } from "@/components/tracks/storage";
import { useMounted } from "@/lib/use-mounted";
import { PLACEMENT_STORAGE_KEY, type StoredPlacement } from "@/lib/placement";
import { isStageKey } from "@/lib/stages";
import { TRACK_HREF, sessionTrack, type TrackKey } from "@/lib/tracks";

function hasStoredPlacement(): boolean {
  try {
    const raw = window.localStorage.getItem(PLACEMENT_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Partial<StoredPlacement>;
    return Boolean(parsed && isStageKey(parsed.stage) && parsed.takenAt);
  } catch {
    return false;
  }
}

function destinationFor(track: TrackKey): string {
  if (track === "new") return hasStoredPlacement() ? "/" : TRACK_HREF.new;
  return TRACK_HREF[track];
}

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const accountTrack = sessionTrack(session?.user);

  const storedTrack = useStoredTrack();
  const mounted = useMounted();
  const [pending, setPending] = useState<TrackKey | null>(null);
  const [manual, setManual] = useState(false);
  const [error, setError] = useState("");
  const started = useRef(false);

  const choose = useCallback(
    async (track: TrackKey) => {
      setPending(track);
      setError("");
      writeStoredTrack(track);

      if (status !== "authenticated") {
        router.replace(destinationFor(track));
        return;
      }

      if (!(await saveAccountTrack(track))) {
        setPending(null);
        setManual(true);
        setError(t("errorDefault"));
        return;
      }

      await update({ track });
      router.replace(destinationFor(track));
    },
    [router, status, t, update]
  );

  const autoTrack = accountTrack ?? (status === "authenticated" ? storedTrack : null);
  const waiting = !mounted || status === "loading" || (autoTrack !== null && !manual);

  useEffect(() => {
    if (status === "loading" || started.current || !autoTrack || manual) return;
    started.current = true;

    if (accountTrack) {
      writeStoredTrack(accountTrack);
      router.replace(destinationFor(accountTrack));
      return;
    }

    void Promise.resolve(autoTrack).then(choose);
  }, [status, autoTrack, accountTrack, manual, choose, router]);

  if (waiting) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mx-auto flex min-h-[50vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 py-16 text-center sm:px-6"
      >
        <Spinner className="size-6 text-primary" />
        <p className="text-lg text-ink-2">{t("saving")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14 sm:pb-24 lg:px-8">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto aspect-[3/4] w-24 overflow-hidden rounded-[var(--radius-panel)] sm:w-28">
          <Illustration name="welcome" sizes="112px" priority />
        </div>
        <h1 className="mt-7 text-title font-semibold text-balance">{t("title")}</h1>
        <p className="mt-2.5 text-lg text-ink-2 text-pretty">{t("lead")}</p>
      </div>

      {error ? (
        <div className="mx-auto mt-8 max-w-xl">
          <Notice tone="error">{error}</Notice>
        </div>
      ) : null}

      <TrackChooser
        headingId="onboarding-question"
        onSelect={(track) => void choose(track)}
        pending={pending}
        className="mt-10 sm:mt-12"
      />
    </div>
  );
}
