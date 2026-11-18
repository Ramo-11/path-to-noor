import type { PathOutline, TrackGroups } from "@/lib/learning-types";
import { STAGES } from "@/lib/stages";
import { TRACK_PATH_SLUGS } from "@/lib/tracks";

function bySlugOrder(outlines: PathOutline[], slugs: string[]): PathOutline[] {
  return [...outlines].sort((a, b) => {
    const ai = slugs.indexOf(a.slug);
    const bi = slugs.indexOf(b.slug);
    return (ai === -1 ? slugs.length : ai) - (bi === -1 ? slugs.length : bi) || a.order - b.order;
  });
}

export function groupPaths(outlines: PathOutline[]): TrackGroups {
  return {
    curious: bySlugOrder(
      outlines.filter((p) => p.tracks.includes("curious")),
      TRACK_PATH_SLUGS.curious
    ),
    new: STAGES.map((stage) => ({ stage, paths: outlines.filter((p) => p.stage === stage) })),
    muslim: bySlugOrder(
      outlines.filter((p) => p.tracks.includes("muslim")),
      TRACK_PATH_SLUGS.muslim
    ),
  };
}
