"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import { Node, mergeAttributes, NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { BlockPreviewShell, blockShellClass } from "./shared";

function jsonAttribute(key: string, fallback: unknown) {
  const name = `data-${key}`;
  return {
    default: fallback,
    parseHTML: (el: HTMLElement) => {
      try {
        return JSON.parse(el.getAttribute(name) ?? "") ?? fallback;
      } catch {
        return fallback;
      }
    },
    renderHTML: (attrs: Record<string, unknown>) => ({ [name]: JSON.stringify(attrs[key] ?? fallback) }),
  };
}

interface FormProps<T> {
  initial: T;
  onCancel: () => void;
  onSubmit: (attrs: T) => void;
  submitLabel: string;
}

export function createAtomNode<T extends object>(config: {
  name: string;
  label: string;
  defaults: T;
  Form: ComponentType<FormProps<T>>;
  Preview: ComponentType<{ attrs: T }>;
}) {
  const { name, label, defaults, Form, Preview } = config;

  function View({ node, updateAttributes, deleteNode }: ReactNodeViewProps) {
    const attrs = node.attrs as T;
    const [editing, setEditing] = useState(false);
    return (
      <NodeViewWrapper as="div" data-drag-handle draggable className={blockShellClass} contentEditable={false}>
        {editing ? (
          <div className="p-3">
            <Form
              initial={attrs}
              submitLabel="Save"
              onCancel={() => setEditing(false)}
              onSubmit={(next) => {
                updateAttributes(next as Record<string, unknown>);
                setEditing(false);
              }}
            />
          </div>
        ) : (
          <BlockPreviewShell label={label} onEdit={() => setEditing(true)} onRemove={deleteNode}>
            <Preview attrs={attrs} />
          </BlockPreviewShell>
        )}
      </NodeViewWrapper>
    );
  }

  return Node.create({
    name,
    group: "block",
    atom: true,
    draggable: true,
    selectable: true,
    addAttributes() {
      return Object.fromEntries(
        Object.entries(defaults).map(([key, value]) => [key, jsonAttribute(key, value)])
      );
    },
    parseHTML() {
      return [{ tag: `div[data-type="${name}"]` }];
    },
    renderHTML({ HTMLAttributes }) {
      return ["div", mergeAttributes(HTMLAttributes, { "data-type": name })];
    },
    addNodeView() {
      return ReactNodeViewRenderer(View);
    },
  });
}

interface RowListProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  empty: T;
  min: number;
  max: number;
  addLabel: string;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
}

export function RowList<T extends object>({ items, onChange, empty, min, max, addLabel, render }: RowListProps<T>) {
  function update(index: number, patch: Partial<T>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }
  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-1.5 rounded border border-slate-200 dark:border-slate-700 p-2">
          <div className="min-w-0 flex-1 space-y-1.5">{render(item, (patch) => update(index, patch), index)}</div>
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => move(index, -1)}
              disabled={index === 0}
              title="Move up"
              className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => move(index, 1)}
              disabled={index === items.length - 1}
              title="Move down"
              className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              disabled={items.length <= min}
              title="Remove"
              className="p-1 rounded text-slate-400 hover:text-red-500 disabled:opacity-30"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
      {items.length < max ? (
        <button
          type="button"
          onClick={() => onChange([...items, { ...empty }])}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
        >
          <Plus className="h-3.5 w-3.5" />
          {addLabel}
        </button>
      ) : null}
    </div>
  );
}
