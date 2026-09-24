"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  PLACEMENT_STORAGE_KEY,
  isCompletePlacement,
  type PlacementAnswers,
  type StoredPlacement,
} from "@/lib/placement";
import { isStageKey, type StageKey } from "@/lib/stages";

export interface LocalPlacement {
  stage: StageKey;
  answers: PlacementAnswers | null;
  takenAt: string;
}

const CHANGE_EVENT = "bd:placement-change";

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(PLACEMENT_STORAGE_KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): LocalPlacement | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown> | null;
    if (!value || typeof value !== "object" || !isStageKey(value.stage)) return null;
    return {
      stage: value.stage,
      answers: isCompletePlacement(value.answers) ? value.answers : null,
      takenAt: typeof value.takenAt === "string" ? value.takenAt : "",
    };
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function serverSnapshot() {
  return null;
}

export function readStoredPlacement(): LocalPlacement | null {
  return parse(readRaw());
}

export function writeStoredPlacement(placement: StoredPlacement): boolean {
  try {
    window.localStorage.setItem(PLACEMENT_STORAGE_KEY, JSON.stringify(placement));
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function useStoredPlacement(): LocalPlacement | null {
  const raw = useSyncExternalStore(subscribe, readRaw, serverSnapshot);
  return useMemo(() => parse(raw), [raw]);
}
