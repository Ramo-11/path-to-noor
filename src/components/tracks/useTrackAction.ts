"use client";

import { useSession } from "next-auth/react";
import { TRACK_HREF, sessionTrack, type TrackKey } from "@/lib/tracks";
import { useStoredTrack } from "./storage";

export interface TrackAction {
  track: TrackKey | null;
  href: string;
}

export function useTrackAction(): TrackAction {
  const { data: session } = useSession();
  const stored = useStoredTrack();
  const track = sessionTrack(session?.user) ?? stored;
  return { track, href: track ? TRACK_HREF[track] : "/#where" };
}
