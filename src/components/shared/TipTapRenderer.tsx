"use client";

import { useEffect, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";

interface TipTapRendererProps {
  content: unknown;
}

// Allowlist of hosts that can be embedded inside lesson content.
const ALLOWED_IMAGE_HOSTS = new Set([
  "res.cloudinary.com",
  "placehold.co",
  "lh3.googleusercontent.com",
]);
const ALLOWED_YOUTUBE_HOSTS = new Set([
  "www.youtube.com",
  "youtube.com",
  "youtu.be",
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
]);

function isSafeUrl(raw: unknown, allowed: Set<string>): boolean {
  if (typeof raw !== "string" || raw.length === 0) return false;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    return allowed.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

type AnyNode = { type?: string; attrs?: Record<string, unknown>; content?: AnyNode[] } & Record<string, unknown>;

function sanitizeNode(node: AnyNode | null | undefined): AnyNode | null {
  if (!node || typeof node !== "object") return null;
  const type = node.type;

  if (type === "image") {
    const src = node.attrs?.src;
    if (!isSafeUrl(src, ALLOWED_IMAGE_HOSTS)) return null;
  }

  if (type === "youtube") {
    const src = node.attrs?.src;
    if (!isSafeUrl(src, ALLOWED_YOUTUBE_HOSTS)) return null;
  }

  if (Array.isArray(node.content)) {
    node = {
      ...node,
      content: node.content
        .map((child) => sanitizeNode(child as AnyNode))
        .filter((n): n is AnyNode => n !== null),
    };
  }

  return node;
}

export function TipTapRenderer({ content }: TipTapRendererProps) {
  const safeContent = useMemo(() => {
    if (!content || typeof content !== "object") return null;
    return sanitizeNode(content as AnyNode);
  }, [content]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false }),
      Youtube.configure({ inline: false }),
    ],
    content: safeContent as Record<string, unknown> | null,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "rich-text prose prose-slate dark:prose-invert max-w-none",
      },
    },
  });

  useEffect(() => {
    if (editor && safeContent) {
      editor.commands.setContent(safeContent as Record<string, unknown>);
    }
  }, [editor, safeContent]);

  if (!editor) return null;

  return <EditorContent editor={editor} />;
}
