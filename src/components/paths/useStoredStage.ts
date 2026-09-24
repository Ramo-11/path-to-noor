import { useSyncExternalStore } from "react";
import {
  PLACEMENT_STORAGE_KEY,
  computePlacement,
  isCompletePlacement,
} from "@/lib/placement";
import { isStageKey, type StageKey } from "@/lib/stages";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readStoredStage(): StageKey | null {
  try {
    const raw = window.localStorage.getItem(PLACEMENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const record = parsed as { answers?: unknown; stage?: unknown };
    if (isCompletePlacement(record.answers)) return computePlacement(record.answers).stage;
    return isStageKey(record.stage) ? record.stage : null;
  } catch {
    return null;
  }
}

function readServerStage(): StageKey | null {
  return null;
}

export function useStoredStage(enabled: boolean): StageKey | null {
  const stage = useSyncExternalStore(subscribe, readStoredStage, readServerStage);
  return enabled ? stage : null;
}
