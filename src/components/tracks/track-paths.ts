import type { PathOutline } from "@/lib/learning-types";

export function readyPath(paths: PathOutline[], slug: string): PathOutline | null {
  const path = paths.find((p) => p.slug === slug);
  return path && path.totalLessons > 0 ? path : null;
}
