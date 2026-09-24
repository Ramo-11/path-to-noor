"use client";

import { useState } from "react";
import { Node, mergeAttributes, NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";
import { CheckCircle2, Circle } from "lucide-react";
import { normalizeQuickCheck, type QuickCheckAttrs } from "@/lib/lesson-blocks";
import { blockInputClass, blockLabelClass, blockPanelClass, FieldError, BlockFormActions, BlockPreviewShell, blockShellClass, StringListEditor } from "./shared";

export const QuickCheckNode = Node.create({
  name: "quickCheck",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      question: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-question") || "",
        renderHTML: (attrs) => ({ "data-question": attrs.question || "" }),
      },
      options: {
        default: [],
        parseHTML: (el) => {
          try {
            return JSON.parse(el.getAttribute("data-options") || "[]");
          } catch {
            return [];
          }
        },
        renderHTML: (attrs) => ({ "data-options": JSON.stringify(attrs.options || []) }),
      },
      correctIndex: {
        default: 0,
        parseHTML: (el) => Number(el.getAttribute("data-correct-index") || 0),
        renderHTML: (attrs) => ({ "data-correct-index": String(attrs.correctIndex ?? 0) }),
      },
      explanation: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-explanation") || "",
        renderHTML: (attrs) => ({ "data-explanation": attrs.explanation || "" }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="quickCheck"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "quickCheck" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(QuickCheckView);
  },
});

export function QuickCheckForm({
  initial,
  onCancel,
  onSubmit,
  submitLabel,
}: {
  initial: QuickCheckAttrs;
  onCancel: () => void;
  onSubmit: (attrs: QuickCheckAttrs) => void;
  submitLabel: string;
}) {
  const [question, setQuestion] = useState(initial.question);
  const [options, setOptions] = useState<string[]>(initial.options.length > 0 ? initial.options : ["", ""]);
  const [correctIndex, setCorrectIndex] = useState(initial.correctIndex);
  const [explanation, setExplanation] = useState(initial.explanation);
  const [error, setError] = useState("");

  function updateOptions(next: string[]) {
    setOptions(next);
    if (correctIndex >= next.length) {
      setCorrectIndex(Math.max(0, next.length - 1));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!question.trim()) {
      setError("Add a question before saving.");
      return;
    }
    if (options.some((o) => !o.trim())) {
      setError("Fill in every answer choice, or remove the empty one.");
      return;
    }
    if (options.length < 2) {
      setError("Add at least two answer choices.");
      return;
    }
    if (correctIndex < 0 || correctIndex >= options.length) {
      setError("Choose the correct answer.");
      return;
    }

    const normalized = normalizeQuickCheck({
      question,
      options,
      correctIndex,
      explanation,
    });
    if (!normalized) {
      setError("Add a question, at least two answer choices, and mark the correct one.");
      return;
    }
    setError("");
    onSubmit(normalized);
  }

  return (
    <form onSubmit={handleSubmit} className={blockPanelClass}>
      <div>
        <label className={blockLabelClass}>Question</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          autoFocus
          className={blockInputClass}
        />
      </div>
      <div>
        <label className={blockLabelClass}>Answer choices (select the correct one)</label>
        <StringListEditor
          items={options}
          onChange={updateOptions}
          placeholder="Answer choice"
          addLabel="Add choice"
          renderLeading={(index) => (
            <button
              type="button"
              onClick={() => setCorrectIndex(index)}
              className="p-1 rounded text-slate-400 hover:text-emerald-600 shrink-0"
              title="Mark as correct"
            >
              {index === correctIndex ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </button>
          )}
        />
      </div>
      <div>
        <label className={blockLabelClass}>Explanation (optional)</label>
        <input
          type="text"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          className={blockInputClass}
        />
      </div>
      <FieldError message={error} />
      <BlockFormActions submitLabel={submitLabel} onCancel={onCancel} />
    </form>
  );
}

function QuickCheckView({ node, updateAttributes, deleteNode }: ReactNodeViewProps) {
  const attrs = node.attrs as QuickCheckAttrs;
  const [editing, setEditing] = useState(false);

  return (
    <NodeViewWrapper as="div" data-drag-handle draggable className={blockShellClass} contentEditable={false}>
      {editing ? (
        <div className="p-3">
          <QuickCheckForm
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
        <BlockPreviewShell label="Quick question" onEdit={() => setEditing(true)} onRemove={deleteNode}>
          <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">
            {attrs.question || "Untitled question"}
          </p>
          <ul className="space-y-1">
            {(attrs.options || []).map((option, i) => (
              <li
                key={i}
                className={`flex items-center gap-1.5 text-sm ${
                  i === attrs.correctIndex
                    ? "text-emerald-700 dark:text-emerald-400 font-medium"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {i === attrs.correctIndex ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <Circle className="h-3.5 w-3.5 shrink-0" />
                )}
                {option}
              </li>
            ))}
          </ul>
          {attrs.explanation && (
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{attrs.explanation}</p>
          )}
        </BlockPreviewShell>
      )}
    </NodeViewWrapper>
  );
}
