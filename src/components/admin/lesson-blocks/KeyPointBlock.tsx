"use client";

import { useState } from "react";
import { Node, mergeAttributes, NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";
import { Sparkles } from "lucide-react";
import { normalizeKeyPoint, type KeyPointAttrs } from "@/lib/lesson-blocks";
import { blockLabelClass, blockPanelClass, FieldError, BlockFormActions, BlockPreviewShell, blockShellClass } from "./shared";

export const KeyPointNode = Node.create({
  name: "keyPoint",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      text: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-text") || "",
        renderHTML: (attrs) => ({ "data-text": attrs.text || "" }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="keyPoint"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "keyPoint" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(KeyPointView);
  },
});

export function KeyPointForm({
  initial,
  onCancel,
  onSubmit,
  submitLabel,
}: {
  initial: KeyPointAttrs;
  onCancel: () => void;
  onSubmit: (attrs: KeyPointAttrs) => void;
  submitLabel: string;
}) {
  const [text, setText] = useState(initial.text);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizeKeyPoint({ text });
    if (!normalized) {
      setError("Add the key point text before saving.");
      return;
    }
    setError("");
    onSubmit(normalized);
  }

  return (
    <form onSubmit={handleSubmit} className={blockPanelClass}>
      <div>
        <label className={blockLabelClass}>Key point</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          autoFocus
          className="w-full px-2.5 py-1.5 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>
      <FieldError message={error} />
      <BlockFormActions submitLabel={submitLabel} onCancel={onCancel} />
    </form>
  );
}

function KeyPointView({ node, updateAttributes, deleteNode }: ReactNodeViewProps) {
  const attrs = node.attrs as KeyPointAttrs;
  const [editing, setEditing] = useState(false);

  return (
    <NodeViewWrapper as="div" data-drag-handle draggable className={blockShellClass} contentEditable={false}>
      {editing ? (
        <div className="p-3">
          <KeyPointForm
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
        <BlockPreviewShell label="Key point" onEdit={() => setEditing(true)} onRemove={deleteNode}>
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-800 dark:text-slate-200">{attrs.text || "Untitled key point"}</p>
          </div>
        </BlockPreviewShell>
      )}
    </NodeViewWrapper>
  );
}
