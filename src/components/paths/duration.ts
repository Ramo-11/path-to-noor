import type { PathOutline } from "@/lib/learning-types";

export interface Duration {
  key: "minutes" | "hours";
  count: number;
}

export function durationOf(totalMinutes: number): Duration | null {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return null;
  if (totalMinutes < 60) return { key: "minutes", count: Math.round(totalMinutes) };
  return { key: "hours", count: Math.round(totalMinutes / 30) / 2 };
}

export function pathDuration(path: PathOutline): Duration | null {
  const measured = durationOf(path.totalMinutes);
  if (measured) return measured;
  if (path.totalLessons > 0 && path.estimatedHours > 0) {
    return { key: "hours", count: path.estimatedHours };
  }
  return null;
}
