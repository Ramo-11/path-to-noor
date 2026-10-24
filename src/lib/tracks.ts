import { z } from "zod";

export const TRACKS = ["curious", "new", "muslim"] as const;

export type TrackKey = (typeof TRACKS)[number];

export const TRACK_LABELS: Record<TrackKey, string> = {
  curious: "Curious about Islam",
  new: "New to Islam",
  muslim: "Muslim, and want to learn more",
};

export const TRACK_STORAGE_KEY = "bd.track";

export const DEFAULT_PATH_TRACKS: TrackKey[] = ["new"];

export const CURIOUS_PATH_SLUG = "discover-islam";
export const MUSLIM_PRIMARY_PATH_SLUG = "growing-deeper";
export const MUSLIM_SECONDARY_PATH_SLUG = "walk-with-a-new-muslim";

export const TRACK_PATH_SLUGS: Record<Exclude<TrackKey, "new">, string[]> = {
  curious: [CURIOUS_PATH_SLUG],
  muslim: [MUSLIM_PRIMARY_PATH_SLUG, MUSLIM_SECONDARY_PATH_SLUG],
};

export const TRACK_HREF: Record<TrackKey, string> = {
  curious: "/curious",
  new: "/start",
  muslim: "/muslim",
};

export function isTrackKey(value: unknown): value is TrackKey {
  return typeof value === "string" && (TRACKS as readonly string[]).includes(value);
}

export function normalizeTracks(value: unknown): TrackKey[] {
  if (!Array.isArray(value)) return [...DEFAULT_PATH_TRACKS];
  const tracks = TRACKS.filter((track) => value.includes(track));
  return tracks.length > 0 ? tracks : [...DEFAULT_PATH_TRACKS];
}

export function sessionTrack(user: unknown): TrackKey | null {
  if (!user || typeof user !== "object") return null;
  const track = (user as { track?: unknown }).track;
  return isTrackKey(track) ? track : null;
}

export const trackBodySchema = z.object({ track: z.enum(TRACKS) }).strict();

export const pathTracksSchema = z
  .array(z.enum(TRACKS))
  .min(1, "Choose at least one track")
  .max(TRACKS.length)
  .transform((tracks) => TRACKS.filter((track) => tracks.includes(track)));

export type TrackBody = z.infer<typeof trackBodySchema>;
