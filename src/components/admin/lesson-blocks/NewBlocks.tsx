"use client";

import { useState } from "react";
import { Node, mergeAttributes, NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";
import { Trash2 } from "lucide-react";
import {
  BLOCK_LIMITS,
  FACT_ICONS,
  LESSON_BLOCK_DEFAULTS,
  normalizeAudio,
  normalizeBreakdown,
  normalizeCompare,
  normalizeFacts,
  normalizeFlow,
  normalizeMore,
  normalizeScenario,
  normalizeTimeline,
  type BreakdownAttrs,
  type CompareAttrs,
  type FactsAttrs,
  type FlowAttrs,
  type ScenarioAttrs,
  type TimelineAttrs,
} from "@/lib/lesson-blocks";
import { createAtomNode, RowList } from "./atom";
import { blockInputClass, blockLabelClass, blockPanelClass, BlockFormActions, FieldError } from "./shared";

const widePanel = `${blockPanelClass} max-h-[70vh] overflow-y-auto`;

function Field({ label, value, onChange, dir, lang, rows }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dir?: "rtl";
  lang?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className={blockLabelClass}>{label}</label>
      {rows ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className={blockInputClass} />
      ) : (
        <input
          type="text"
          value={value}
          dir={dir}
          lang={lang}
          onChange={(e) => onChange(e.target.value)}
          className={`${blockInputClass} ${dir ? "arabic-phrase text-lg" : ""}`}
        />
      )}
    </div>
  );
}

function AudioField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Field label="Audio paths (optional, comma separated, e.g. /audio/quran/001001.mp3)" value={value} onChange={onChange} />
  );
}

function audioText(audio: string[]): string {
  return audio.join(", ");
}

function parseAudio(value: string): string[] {
  return normalizeAudio(value.split(",").map((item) => item.trim()).filter(Boolean));
}

function audioProblem(value: string): boolean {
  const entries = value.split(",").map((item) => item.trim()).filter(Boolean);
  return entries.length !== parseAudio(value).length;
}

interface FormProps<T> {
  initial: T;
  onCancel: () => void;
  onSubmit: (attrs: T) => void;
  submitLabel: string;
}

export function BreakdownForm({ initial, onCancel, onSubmit, submitLabel }: FormProps<BreakdownAttrs>) {
  const [parts, setParts] = useState(initial.parts);
  const [result, setResult] = useState(initial.result);
  const [audio, setAudio] = useState(audioText(initial.audio));
  const [error, setError] = useState("");
  const [min, max] = BLOCK_LIMITS.breakdownParts;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (audioProblem(audio)) return setError("Audio paths must look like /audio/name.mp3.");
    const next = normalizeBreakdown({ parts, result, audio: parseAudio(audio) });
    if (!next) return setError(`Add ${min} to ${max} words, each with Arabic and a meaning.`);
    setError("");
    onSubmit(next);
  }

  return (
    <form onSubmit={submit} className={widePanel}>
      <RowList
        items={parts}
        onChange={setParts}
        empty={{ arabic: "", transliteration: "", meaning: "" }}
        min={min}
        max={max}
        addLabel="Add word"
        render={(part, update) => (
          <>
            <Field label="Arabic" value={part.arabic} dir="rtl" lang="ar" onChange={(arabic) => update({ arabic })} />
            <Field label="Transliteration" value={part.transliteration} onChange={(transliteration) => update({ transliteration })} />
            <Field label="Meaning" value={part.meaning} onChange={(meaning) => update({ meaning })} />
          </>
        )}
      />
      <Field label="Result (optional)" value={result} onChange={setResult} />
      <AudioField value={audio} onChange={setAudio} />
      <FieldError message={error} />
      <BlockFormActions submitLabel={submitLabel} onCancel={onCancel} />
    </form>
  );
}

export function CompareForm({ initial, onCancel, onSubmit, submitLabel }: FormProps<CompareAttrs>) {
  const [first, setFirst] = useState({ title: initial.first.title, items: initial.first.items.join("\n") });
  const [second, setSecond] = useState({ title: initial.second.title, items: initial.second.items.join("\n") });
  const [error, setError] = useState("");
  const lines = (value: string) => value.split("\n").map((line) => line.trim()).filter(Boolean);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = normalizeCompare({
      first: { title: first.title, items: lines(first.items) },
      second: { title: second.title, items: lines(second.items) },
    });
    if (!next) return setError("Each side needs a title and 1 to 5 items, one per line.");
    setError("");
    onSubmit(next);
  }

  return (
    <form onSubmit={submit} className={widePanel}>
      {([["First card", first, setFirst], ["Second card", second, setSecond]] as const).map(([label, side, set]) => (
        <div key={label} className="space-y-1.5">
          <Field label={`${label} title`} value={side.title} onChange={(title) => set({ ...side, title })} />
          <Field label={`${label} items (one per line)`} value={side.items} rows={3} onChange={(items) => set({ ...side, items })} />
        </div>
      ))}
      <FieldError message={error} />
      <BlockFormActions submitLabel={submitLabel} onCancel={onCancel} />
    </form>
  );
}

export function FlowForm({ initial, onCancel, onSubmit, submitLabel }: FormProps<FlowAttrs>) {
  const [title, setTitle] = useState(initial.title);
  const [steps, setSteps] = useState(initial.steps);
  const [error, setError] = useState("");
  const [min, max] = BLOCK_LIMITS.flowSteps;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = normalizeFlow({ title, steps });
    if (!next) return setError(`Add ${min} to ${max} steps, each with a label.`);
    setError("");
    onSubmit(next);
  }

  return (
    <form onSubmit={submit} className={widePanel}>
      <Field label="Title (optional)" value={title} onChange={setTitle} />
      <RowList
        items={steps}
        onChange={setSteps}
        empty={{ label: "", text: "" }}
        min={min}
        max={max}
        addLabel="Add step"
        render={(step, update) => (
          <>
            <Field label="Label" value={step.label} onChange={(label) => update({ label })} />
            <Field label="Text" value={step.text} onChange={(text) => update({ text })} />
          </>
        )}
      />
      <FieldError message={error} />
      <BlockFormActions submitLabel={submitLabel} onCancel={onCancel} />
    </form>
  );
}

export function TimelineForm({ initial, onCancel, onSubmit, submitLabel }: FormProps<TimelineAttrs>) {
  const [title, setTitle] = useState(initial.title);
  const [events, setEvents] = useState(initial.events);
  const [error, setError] = useState("");
  const [min, max] = BLOCK_LIMITS.timelineEvents;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = normalizeTimeline({ title, events });
    if (!next) return setError(`Add ${min} to ${max} events, each with a time and text.`);
    setError("");
    onSubmit(next);
  }

  return (
    <form onSubmit={submit} className={widePanel}>
      <Field label="Title (optional)" value={title} onChange={setTitle} />
      <RowList
        items={events}
        onChange={setEvents}
        empty={{ when: "", text: "" }}
        min={min}
        max={max}
        addLabel="Add event"
        render={(event, update) => (
          <>
            <Field label="When" value={event.when} onChange={(when) => update({ when })} />
            <Field label="Text" value={event.text} onChange={(text) => update({ text })} />
          </>
        )}
      />
      <FieldError message={error} />
      <BlockFormActions submitLabel={submitLabel} onCancel={onCancel} />
    </form>
  );
}

export function FactsForm({ initial, onCancel, onSubmit, submitLabel }: FormProps<FactsAttrs>) {
  const [title, setTitle] = useState(initial.title);
  const [items, setItems] = useState(initial.items);
  const [error, setError] = useState("");
  const [min, max] = BLOCK_LIMITS.factItems;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = normalizeFacts({ title, items });
    if (!next) return setError(`Add ${min} to ${max} cards, each with a label.`);
    setError("");
    onSubmit(next);
  }

  return (
    <form onSubmit={submit} className={widePanel}>
      <Field label="Title (optional)" value={title} onChange={setTitle} />
      <RowList
        items={items}
        onChange={setItems}
        empty={{ icon: "", label: "", text: "" }}
        min={min}
        max={max}
        addLabel="Add card"
        render={(item, update) => (
          <>
            <div>
              <label className={blockLabelClass}>Icon (optional, shows the number without one)</label>
              <select
                value={item.icon}
                onChange={(e) => update({ icon: e.target.value as FactsAttrs["items"][number]["icon"] })}
                className={blockInputClass}
              >
                <option value="">No icon</option>
                {FACT_ICONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>
            <Field label="Label" value={item.label} onChange={(label) => update({ label })} />
            <Field label="Text (optional)" value={item.text} onChange={(text) => update({ text })} />
          </>
        )}
      />
      <FieldError message={error} />
      <BlockFormActions submitLabel={submitLabel} onCancel={onCancel} />
    </form>
  );
}

export function ScenarioForm({ initial, onCancel, onSubmit, submitLabel }: FormProps<ScenarioAttrs>) {
  const [situation, setSituation] = useState(initial.situation);
  const [lines, setLines] = useState(initial.lines);
  const [error, setError] = useState("");
  const [min, max] = BLOCK_LIMITS.scenarioLines;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = normalizeScenario({ situation, lines });
    if (!next) return setError(`Add ${min} to ${max} lines of conversation.`);
    setError("");
    onSubmit(next);
  }

  return (
    <form onSubmit={submit} className={widePanel}>
      <Field label="Situation (optional)" value={situation} onChange={setSituation} />
      <RowList
        items={lines}
        onChange={setLines}
        empty={{ from: "them", text: "" }}
        min={min}
        max={max}
        addLabel="Add line"
        render={(line, update) => (
          <>
            <div>
              <label className={blockLabelClass}>Who says it</label>
              <select
                value={line.from}
                onChange={(e) => update({ from: e.target.value === "you" ? "you" : "them" })}
                className={blockInputClass}
              >
                <option value="them">Them</option>
                <option value="you">You</option>
              </select>
            </div>
            <Field label="Text" value={line.text} onChange={(text) => update({ text })} />
          </>
        )}
      />
      <FieldError message={error} />
      <BlockFormActions submitLabel={submitLabel} onCancel={onCancel} />
    </form>
  );
}

function Lines({ items }: { items: string[] }) {
  return (
    <ul className="space-y-0.5 text-sm text-slate-700 dark:text-slate-300">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function Heading({ text }: { text: string }) {
  return text ? <p className="mb-1 text-sm font-semibold text-slate-900 dark:text-white">{text}</p> : null;
}

export const BreakdownNode = createAtomNode<BreakdownAttrs>({
  name: "breakdown",
  label: "Word by word",
  defaults: LESSON_BLOCK_DEFAULTS.breakdown,
  Form: BreakdownForm,
  Preview: ({ attrs }) => (
    <div>
      <div dir="rtl" className="flex flex-wrap gap-2">
        {(attrs.parts || []).map((part, i) => (
          <div key={i} className="rounded border border-slate-200 dark:border-slate-700 px-2 py-1 text-center">
            <p lang="ar" className="arabic-phrase text-lg text-slate-900 dark:text-white">{part.arabic}</p>
            <p className="text-xs text-slate-500">{part.transliteration}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">{part.meaning}</p>
          </div>
        ))}
      </div>
      {attrs.result ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{attrs.result}</p> : null}
    </div>
  ),
});

export const CompareNode = createAtomNode<CompareAttrs>({
  name: "compare",
  label: "Compare",
  defaults: LESSON_BLOCK_DEFAULTS.compare,
  Form: CompareForm,
  Preview: ({ attrs }) => (
    <div className="grid grid-cols-2 gap-2">
      {[attrs.first, attrs.second].map((side, i) => (
        <div key={i}>
          <Heading text={side?.title ?? ""} />
          <Lines items={side?.items ?? []} />
        </div>
      ))}
    </div>
  ),
});

export const FlowNode = createAtomNode<FlowAttrs>({
  name: "flow",
  label: "Flow",
  defaults: LESSON_BLOCK_DEFAULTS.flow,
  Form: FlowForm,
  Preview: ({ attrs }) => (
    <div>
      <Heading text={attrs.title} />
      <ol className="list-decimal ps-5 space-y-0.5 text-sm text-slate-700 dark:text-slate-300">
        {(attrs.steps || []).map((step, i) => (
          <li key={i}>
            <strong>{step.label}</strong> {step.text}
          </li>
        ))}
      </ol>
    </div>
  ),
});

export const TimelineNode = createAtomNode<TimelineAttrs>({
  name: "timeline",
  label: "Timeline",
  defaults: LESSON_BLOCK_DEFAULTS.timeline,
  Form: TimelineForm,
  Preview: ({ attrs }) => (
    <div>
      <Heading text={attrs.title} />
      <ul className="space-y-0.5 text-sm text-slate-700 dark:text-slate-300">
        {(attrs.events || []).map((event, i) => (
          <li key={i}>
            <strong>{event.when}</strong> {event.text}
          </li>
        ))}
      </ul>
    </div>
  ),
});

export const FactsNode = createAtomNode<FactsAttrs>({
  name: "facts",
  label: "Fact cards",
  defaults: LESSON_BLOCK_DEFAULTS.facts,
  Form: FactsForm,
  Preview: ({ attrs }) => (
    <div>
      <Heading text={attrs.title} />
      <ul className="grid grid-cols-2 gap-1.5 text-sm text-slate-700 dark:text-slate-300">
        {(attrs.items || []).map((item, i) => (
          <li key={i} className="rounded border border-slate-200 dark:border-slate-700 px-2 py-1">
            <strong>{item.label}</strong>
            {item.text ? <span className="block text-xs">{item.text}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  ),
});

export const ScenarioNode = createAtomNode<ScenarioAttrs>({
  name: "scenario",
  label: "Conversation",
  defaults: LESSON_BLOCK_DEFAULTS.scenario,
  Form: ScenarioForm,
  Preview: ({ attrs }) => (
    <div>
      <Heading text={attrs.situation} />
      <ul className="space-y-1 text-sm">
        {(attrs.lines || []).map((line, i) => (
          <li
            key={i}
            className={`max-w-[85%] rounded-xl px-2.5 py-1 text-slate-800 dark:text-slate-200 ${
              line.from === "you" ? "ms-auto bg-primary-100 dark:bg-primary-900/30" : "bg-slate-200 dark:bg-slate-700"
            }`}
          >
            {line.text}
          </li>
        ))}
      </ul>
    </div>
  ),
});

function MoreView({ node, updateAttributes, deleteNode }: ReactNodeViewProps) {
  const { title } = normalizeMore(node.attrs);
  return (
    <NodeViewWrapper as="div" className="my-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 p-2" contentEditable={false}>
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">More (closed by default)</span>
        <input
          type="text"
          value={title}
          placeholder="Title, e.g. More examples"
          onChange={(e) => updateAttributes({ title: e.target.value })}
          className={blockInputClass}
        />
        <button
          type="button"
          onClick={deleteNode}
          title="Remove"
          className="p-1 rounded text-slate-500 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <NodeViewContent className="p-3" />
    </NodeViewWrapper>
  );
}

export const MoreNode = Node.create({
  name: "moreBlock",
  group: "block",
  content: "block+",
  defining: true,
  isolating: true,
  draggable: true,

  addAttributes() {
    return {
      title: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-title") || "",
        renderHTML: (attrs) => ({ "data-title": attrs.title || "" }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="moreBlock"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "moreBlock" }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MoreView);
  },
});
