"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { sessionTrack } from "@/lib/tracks";
import { readStoredTrack, saveAccountTrack } from "./storage";

export function TrackSync() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const handledFor = useRef<string | null>(null);
  const userId = session?.user?.id;
  const accountTrack = sessionTrack(session?.user);

  useEffect(() => {
    if (status !== "authenticated" || !userId || handledFor.current === userId) return;
    handledFor.current = userId;
    if (accountTrack) return;

    const stored = readStoredTrack();
    if (!stored) return;

    (async () => {
      try {
        const response = await fetch("/api/user/track", { cache: "no-store" });
        if (!response.ok) return;
        const body = (await response.json()) as { data?: unknown };
        if (body.data) return;

        if (await saveAccountTrack(stored)) {
          await update({ track: stored });
          router.refresh();
        }
      } catch {
        return;
      }
    })();
  }, [status, userId, accountTrack, update, router]);

  return null;
}
