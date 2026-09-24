import {
  normalizeKeyPoint,
  normalizePhraseCard,
  normalizeQuickCheck,
  normalizeStepList,
  type LessonBlockType,
} from "@/lib/lesson-blocks";

export interface TipTapNode {
  type?: unknown;
  attrs?: Record<string, unknown>;
  content?: unknown;
  text?: unknown;
  marks?: unknown;
}

const IMAGE_HOSTS = new Set(["res.cloudinary.com", "placehold.co", "lh3.googleusercontent.com"]);

const YOUTUBE_HOSTS = new Set([
  "www.youtube.com",
  "youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
]);

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

const LINKED_VIDEO_HOSTS: Record<string, string> = {
  "fb.watch": "Facebook",
  "facebook.com": "Facebook",
  "www.facebook.com": "Facebook",
  "m.facebook.com": "Facebook",
  "instagram.com": "Instagram",
  "www.instagram.com": "Instagram",
  "vimeo.com": "Vimeo",
  "www.vimeo.com": "Vimeo",
  "tiktok.com": "TikTok",
  "www.tiktok.com": "TikTok",
};

const BLOCK_NORMALIZERS: Record<LessonBlockType, (attrs: unknown) => unknown> = {
  phraseCard: normalizePhraseCard,
  stepList: normalizeStepList,
  quickCheck: normalizeQuickCheck,
  keyPoint: normalizeKeyPoint,
};

export function asNode(value: unknown): TipTapNode | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as TipTapNode) : null;
}

export function childNodes(node: TipTapNode): TipTapNode[] {
  if (!Array.isArray(node.content)) return [];
  return node.content.map(asNode).filter((child): child is TipTapNode => child !== null);
}

export function nodeMarks(node: TipTapNode): TipTapNode[] {
  if (!Array.isArray(node.marks)) return [];
  return node.marks.map(asNode).filter((mark): mark is TipTapNode => mark !== null);
}

function parseUrl(raw: unknown): URL | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (value.length === 0 || value.length > 2048) return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function safeLink(raw: unknown): { href: string; external: boolean } | null {
  const url = parseUrl(raw);
  if (!url) return null;
  if (url.protocol === "http:" || url.protocol === "https:") return { href: url.href, external: true };
  if (url.protocol === "mailto:") return { href: url.href, external: false };
  return null;
}

export function safeImageSrc(raw: unknown): string | null {
  const url = parseUrl(raw);
  if (!url || (url.protocol !== "https:" && url.protocol !== "http:")) return null;
  const host = url.hostname.toLowerCase();
  if (!IMAGE_HOSTS.has(host)) return null;
  url.protocol = "https:";
  if (
    host === "res.cloudinary.com" &&
    url.pathname.includes("/image/upload/") &&
    !url.pathname.includes("/image/upload/f_auto")
  ) {
    url.pathname = url.pathname.replace("/image/upload/", "/image/upload/f_auto,q_auto,c_limit,w_1600/");
  }
  return url.href;
}

function parseSeconds(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.floor(value));
  if (typeof value !== "string" || value.length === 0) return 0;
  if (/^\d+s?$/.test(value)) return Number.parseInt(value, 10);
  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!match) return 0;
  return Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
}

export function youtubeEmbedUrl(raw: unknown, start?: unknown): string | null {
  const url = parseUrl(raw);
  if (!url || (url.protocol !== "https:" && url.protocol !== "http:")) return null;
  const host = url.hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) return null;

  let id: string | null = null;
  if (host === "youtu.be") {
    id = url.pathname.split("/")[1] ?? null;
  } else if (url.pathname === "/watch") {
    id = url.searchParams.get("v");
  } else {
    id = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/]+)/)?.[1] ?? null;
  }
  if (!id || !YOUTUBE_ID.test(id)) return null;

  const seconds = Math.min(
    parseSeconds(start) || parseSeconds(url.searchParams.get("start")) || parseSeconds(url.searchParams.get("t")),
    86400
  );
  const params = new URLSearchParams({ rel: "0" });
  if (seconds > 0) params.set("start", String(seconds));
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

export function linkedVideo(raw: unknown): { href: string; site: string } | null {
  const url = parseUrl(raw);
  if (!url || url.protocol !== "https:") return null;
  const site = LINKED_VIDEO_HOSTS[url.hostname.toLowerCase()];
  return site ? { href: url.toString(), site } : null;
}

export function isLessonBlock(type: unknown): type is LessonBlockType {
  return typeof type === "string" && Object.prototype.hasOwnProperty.call(BLOCK_NORMALIZERS, type);
}

export function hasRenderableContent(value: unknown): boolean {
  const node = asNode(value);
  if (!node) return false;
  if (node.type === "text") return typeof node.text === "string" && node.text.trim().length > 0;
  if (node.type === "image") return safeImageSrc(node.attrs?.src) !== null;
  if (node.type === "youtube") return youtubeEmbedUrl(node.attrs?.src) !== null;
  if (node.type === "horizontalRule" || node.type === "hardBreak") return false;
  if (isLessonBlock(node.type)) return BLOCK_NORMALIZERS[node.type](node.attrs) !== null;
  return childNodes(node).some(hasRenderableContent);
}

export function plainText(value: unknown): string {
  const parts: string[] = [];
  const walk = (node: TipTapNode) => {
    if (node.type === "text") {
      if (typeof node.text === "string") parts.push(node.text);
      return;
    }
    if (node.type === "hardBreak") {
      parts.push(" ");
      return;
    }
    childNodes(node).forEach(walk);
    parts.push(" ");
  };
  const root = asNode(value);
  if (root) walk(root);
  return parts.join("").replace(/\s+/g, " ").trim();
}

export function excerpt(value: unknown, max = 160): string {
  const text = plainText(value);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > max / 2 ? cut.slice(0, space) : cut).trim()}...`;
}

function containsLink(node: TipTapNode): boolean {
  if (nodeMarks(node).some((mark) => mark.type === "link")) return true;
  return childNodes(node).some(containsLink);
}

export interface LeadVideo {
  src: string;
  caption: string[];
}

export function leadVideo(value: unknown): LeadVideo | null {
  const root = asNode(value);
  if (!root) return null;
  const nodes = childNodes(root).filter(
    (node) => node.type === "youtube" || hasRenderableContent(node)
  );
  const videos = nodes.filter((node) => node.type === "youtube");
  if (videos.length !== 1) return null;

  const src = youtubeEmbedUrl(videos[0].attrs?.src, videos[0].attrs?.start);
  if (!src) return null;

  const rest = nodes.filter((node) => node !== videos[0]);
  if (!rest.every((node) => (node.type === "heading" || node.type === "paragraph") && !containsLink(node))) {
    return null;
  }
  const caption = rest.map(plainText).filter((line) => line.length > 0);
  if (caption.join(" ").length > 320) return null;
  return { src, caption };
}
