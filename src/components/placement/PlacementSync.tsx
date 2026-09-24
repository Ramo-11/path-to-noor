"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { computePlacement } from "@/lib/placement";
import { readStoredPlacement } from "./storage";

const SYNCED_KEY = "bd.placement.synced";

function alreadySynced(userId: string): boolean {
  try {
    return window.sessionStorage.getItem(SYNCED_KEY) === userId;
  } catch {
    return false;
  }
}

function markSynced(userId: string) {
  try {
    window.sessionStorage.setItem(SYNCED_KEY, userId);
  } catch {
    return;
  }
}

async function post(body: unknown): Promise<boolean> {
  const response = await fetch("/api/user/placement", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return response.ok;
}

export function PlacementSync() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const handledFor = useRef<string | null>(null);
  const userId = session?.user?.id;

  useEffect(() => {
    if (status !== "authenticated" || !userId || handledFor.current === userId) return;
    handledFor.current = userId;

    const stored = readStoredPlacement();
    if (!stored || alreadySynced(userId)) return;

    (async () => {
      try {
        const response = await fetch("/api/user/placement", { cache: "no-store" });
        if (!response.ok) return;
        const body = (await response.json()) as { data?: unknown };
        if (body.data) {
          markSynced(userId);
          return;
        }

        let saved: boolean;
        if (stored.answers) {
          saved = await post({ answers: stored.answers });
          if (saved && computePlacement(stored.answers).stage !== stored.stage) {
            saved = await post({ stage: stored.stage });
          }
        } else {
          saved = await post({ stage: stored.stage });
        }

        if (saved) {
          markSynced(userId);
          router.refresh();
        }
      } catch {
        return;
      }
    })();
  }, [status, userId, router]);

  return null;
}
