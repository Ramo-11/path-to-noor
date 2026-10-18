"use client";

import { useState } from "react";
import { Node, mergeAttributes, NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";
import { normalizeAudio, normalizePhraseCard, type PhraseCardAttrs } from "@/lib/lesson-blocks";
import { blockInputClass, blockLabelClass, blockPanelClass, FieldError, BlockFormActions, BlockPreviewShell, blockShellClass } from "./shared";

export const PhraseCardNode = Node.create({
  name: "phraseCard",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      arabic: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-arabic") || "",
        renderHTML: (attrs) => ({ "data-arabic": attrs.arabic || "" }),
      },
      transliteration: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-transliteration") || "",
        renderHTML: (attrs) => ({ "data-transliteration": attrs.transliteration || "" }),
      },
      meaning: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-meaning") || "",
        renderHTML: (attrs) => ({ "data-meaning": attrs.meaning || "" }),
      },
      audio: {
        default: [],
        parseHTML: (el) => {
          try {
            return normalizeAudio(JSON.parse(el.getAttribute("data-audio") || "[]"));
          } catch {
            return [];
          }
        },
        renderHTML: (attrs) => ({ "data-audio": JSON.stringify(attrs.audio || []) }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="phraseCard"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "phraseCard" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PhraseCardView);
  },
});

export function PhraseCardForm({
  initial,
  onCancel,
  onSubmit,
  submitLabel,
}: {
  initial: PhraseCardAttrs;
  onCancel: () => void;
  onSubmit: (attrs: PhraseCardAttrs) => void;
  submitLabel: string;
}) {
  const [arabic, setArabic] = useState(initial.arabic);
  const [transliteration, setTransliteration] = useState(initial.transliteration);
  const [meaning, setMeaning] = useState(initial.meaning);
  const [audio, setAudio] = useState((initial.audio ?? []).join(", "));
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const entries = audio.split(",").map((item) => item.trim()).filter(Boolean);
    const clips = normalizeAudio(entries);
    if (clips.length !== entries.length) {
      setError("Audio paths must look like /audio/name.mp3.");
      return;
    }
    const normalized = normalizePhraseCard({ arabic, transliteration, meaning, audio: clips });
    if (!normalized) {
      setError("Add the Arabic phrase before saving.");
      return;
    }
    setError("");
    onSubmit(normalized);
  }

  return (
    <form onSubmit={handleSubmit} className={blockPanelClass}>
      <div>
        <label className={blockLabelClass}>Arabic</label>
        <input
          type="text"
          value={arabic}
          onChange={(e) => setArabic(e.target.value)}
          dir="rtl"
          lang="ar"
          autoFocus
          className={`${blockInputClass} arabic-phrase text-lg`}
        />
      </div>
      <div>
        <label className={blockLabelClass}>Transliteration</label>
        <input
          type="text"
          value={transliteration}
          onChange={(e) => setTransliteration(e.target.value)}
          className={blockInputClass}
        />
      </div>
      <div>
        <label className={blockLabelClass}>Meaning in this language</label>
        <input
          type="text"
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          className={blockInputClass}
        />
      </div>
      <div>
        <label className={blockLabelClass}>Audio paths (optional, comma separated)</label>
        <input
          type="text"
          value={audio}
          onChange={(e) => setAudio(e.target.value)}
          placeholder="/audio/quran/001001.mp3"
          className={blockInputClass}
        />
      </div>
      <FieldError message={error} />
      <BlockFormActions submitLabel={submitLabel} onCancel={onCancel} />
    </form>
  );
}

function PhraseCardView({ node, updateAttributes, deleteNode }: ReactNodeViewProps) {
  const attrs = node.attrs as PhraseCardAttrs;
  const [editing, setEditing] = useState(false);

  return (
    <NodeViewWrapper as="div" data-drag-handle draggable className={blockShellClass} contentEditable={false}>
      {editing ? (
        <div className="p-3">
          <PhraseCardForm
            initial={attrs}
            submitLabel="Save"
            onCancel={() => setEditing(false)}
            onSubmit={(next) => {
              updateAttributes(next);
              setEditing(false);
            }}
          />
        </div>
      ) : (
        <BlockPreviewShell label="Arabic phrase" onEdit={() => setEditing(true)} onRemove={deleteNode}>
          <p dir="rtl" lang="ar" className="arabic-phrase text-2xl text-slate-900 dark:text-white">
            {attrs.arabic || "Untitled phrase"}
          </p>
          {attrs.transliteration && (
            <p className="mt-1 text-sm italic text-slate-500 dark:text-slate-400">{attrs.transliteration}</p>
          )}
          {attrs.meaning && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{attrs.meaning}</p>
          )}
        </BlockPreviewShell>
      )}
    </NodeViewWrapper>
  );
}
