"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";

interface TipTapRendererProps {
  content: unknown;
}

export function TipTapRenderer({ content }: TipTapRendererProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false }),
      Youtube.configure({ inline: false }),
    ],
    content: content as Record<string, unknown> | null,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "rich-text prose prose-slate dark:prose-invert max-w-none",
      },
    },
  });

  // Sync content when prop changes (useEditor only reads content on mount)
  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content as Record<string, unknown>);
    }
  }, [editor, content]);

  if (!editor) return null;

  return <EditorContent editor={editor} />;
}
