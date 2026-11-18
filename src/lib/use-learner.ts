"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { MePayload, MeSignedIn } from "@/lib/me-types";

export type LearnerStatus = "loading" | "guest" | "signedIn" | "error";

export interface LearnerSnapshot {
  status: LearnerStatus;
  me: MeSignedIn | null;
}

const STALE_MS = 30_000;
const LOADING: LearnerSnapshot = { status: "loading", me: null };

let snapshot: LearnerSnapshot = LOADING;
let fetchedAt = 0;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function publish(next: LearnerSnapshot) {
  snapshot = next;
  if (next.status !== "signedIn" && next.status !== "loading") {
    document.documentElement.removeAttribute("data-learner");
  }
  listeners.forEach((listener) => listener());
}

async function load() {
  try {
    const response = await fetch("/api/me", { cache: "no-store", credentials: "same-origin" });
    if (!response.ok) throw new Error(String(response.status));
    const data = (await response.json()) as MePayload;
    fetchedAt = Date.now();
    publish(data.user ? { status: "signedIn", me: data } : { status: "guest", me: null });
  } catch {
    fetchedAt = 0;
    publish(snapshot.me ? snapshot : { status: "error", me: null });
  }
}

export function refreshLearner(): Promise<void> {
  if (!inflight) {
    inflight = load().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useLearner(): LearnerSnapshot {
  const current = useSyncExternalStore(subscribe, () => snapshot, () => LOADING);
  useEffect(() => {
    if (Date.now() - fetchedAt > STALE_MS) void refreshLearner();
  }, []);
  return current;
}
