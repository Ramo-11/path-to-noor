export interface SavedLessonRow {
  id: string;
  slug: string;
  title: string;
  minutes: number;
  context: { type: "path"; title: string; slug: string } | { type: "step"; title: string } | null;
}

export type SavedMePayload = { signedIn: false } | { signedIn: true; lessons: SavedLessonRow[] };
