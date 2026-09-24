import { localized, type LocalizedText } from "@/lib/stages";

export type StoryVideo = { kind: "youtube"; id: string } | { kind: "upload"; url: string };

export interface StoryView {
  id: string;
  personName: string;
  title: string;
  excerpt: string;
  video: StoryVideo | null;
  thumbnail: string | null;
}

interface StoryRecord {
  _id: unknown;
  personName?: LocalizedText;
  title?: LocalizedText;
  excerpt?: LocalizedText;
  videoUrl?: string;
  videoType?: string;
  thumbnail?: string;
  type?: string;
}

const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  /^([a-zA-Z0-9_-]{11})$/,
];

function youtubeId(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.trim().match(pattern);
    if (match) return match[1];
  }
  return null;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function toVideo(story: StoryRecord): StoryVideo | null {
  const wantsVideo = story.type === "video" || story.type === "both";
  const url = story.videoUrl?.trim() ?? "";
  if (!wantsVideo || !url) return null;
  if (story.videoType === "youtube") {
    const id = youtubeId(url);
    return id ? { kind: "youtube", id } : null;
  }
  if (story.videoType === "upload" && isHttpUrl(url)) {
    return { kind: "upload", url };
  }
  return null;
}

export function toStoryView(story: StoryRecord, locale: string): StoryView | null {
  const title = localized(story.title, locale);
  const personName = localized(story.personName, locale);
  if (!title || !personName) return null;

  const video = toVideo(story);
  const thumbnail =
    story.thumbnail && isHttpUrl(story.thumbnail)
      ? story.thumbnail
      : video?.kind === "youtube"
        ? `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`
        : null;

  return {
    id: String(story._id),
    personName,
    title,
    excerpt: localized(story.excerpt, locale),
    video,
    thumbnail,
  };
}
