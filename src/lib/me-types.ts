import type { PathOutline, PlacementSummary } from "@/lib/learning-types";
import type { TrackKey } from "@/lib/tracks";

export interface MeUser {
  id: string;
  name: string | null;
  role: string;
  userType: string | null;
  emailVerified: boolean;
}

export interface MeSignedIn {
  user: MeUser;
  track: TrackKey | null;
  placement: PlacementSummary | null;
  completedLessonIds: string[];
  currentPath: PathOutline | null;
  recommendedPath: PathOutline | null;
  recommendedIsFallback: boolean;
  paths: PathOutline[];
}

export type MePayload = { user: null } | MeSignedIn;
