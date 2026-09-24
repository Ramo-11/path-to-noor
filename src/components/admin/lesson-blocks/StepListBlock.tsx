"use client";

import { useState } from "react";
import { Node, mergeAttributes, NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";
import { normalizeStepList, type StepListAttrs } from "@/lib/lesson-blocks";
import { blockInputClass, blockLabelClass, blockPanelClass, FieldError, BlockFormActions, BlockPreviewShell, blockShellClass, StringListEditor } from "./shared";

export const StepListNode = Node.create({
  name: "stepList",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      title: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-title") || "",
        renderHTML: (attrs) => ({ "data-title": attrs.title || "" }),
      },
      steps: {
        default: [],
        parseHTML: (el) => {
          try {
            return JSON.parse(el.getAttribute("data-steps") || "[]");
          } catch {
            return [];
          }
        },
        renderHTML: (attrs) => ({ "data-steps": JSON.stringify(attrs.steps || []) }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="stepList"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "stepList" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(StepListView);
  },
});

export function StepListForm({
  initial,
  onCancel,
  onSubmit,
  submitLabel,
}: {
  initial: StepListAttrs;
  onCancel: () => void;
  onSubmit: (attrs: StepListAttrs) => void;
  submitLabel: string;
}) {
  const [title, setTitle] = useState(initial.title);
  const [steps, setSteps] = useState<string[]>(initial.steps.length > 0 ? initial.steps : [""]);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizeStepList({ title, steps });
    if (!normalized) {
      setError("Add at least one step before saving.");
      return;
    }
    setError("");
    onSubmit(normalized);
  }

  return (
    <form onSubmit={handleSubmit} className={blockPanelClass}>
      <div>
        <label className={blockLabelClass}>Title (optional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          className={blockInputClass}
        />
      </div>
      <div>
        <label className={blockLabelClass}>Steps</label>
        <StringListEditor
          items={steps}
          onChange={setSteps}
          placeholder="Step text"
          addLabel="Add step"
        />
      </div>
      <FieldError message={error} />
      <BlockFormActions submitLabel={submitLabel} onCancel={onCancel} />
    </form>
  );
}

function StepListView({ node, updateAttributes, deleteNode }: ReactNodeViewProps) {
  const attrs = node.attrs as StepListAttrs;
  const [editing, setEditing] = useState(false);

  return (
    <NodeViewWrapper as="div" data-drag-handle draggable className={blockShellClass} contentEditable={false}>
      {editing ? (
        <div className="p-3">
          <StepListForm
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
        <BlockPreviewShell label="Steps" onEdit={() => setEditing(true)} onRemove={deleteNode}>
          {attrs.title && (
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">{attrs.title}</p>
          )}
          <ol className="space-y-1 list-decimal ps-5">
            {(attrs.steps || []).map((step, i) => (
              <li key={i} className="text-sm text-slate-700 dark:text-slate-300">
                {step}
              </li>
            ))}
          </ol>
        </BlockPreviewShell>
      )}
    </NodeViewWrapper>
  );
}
