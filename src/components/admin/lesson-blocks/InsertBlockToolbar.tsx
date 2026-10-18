"use client";

import { useState, type ComponentType } from "react";
import type { Editor } from "@tiptap/react";
import {
  Languages,
  ListOrdered,
  HelpCircle,
  Sparkles,
  Columns2,
  Scale,
  Workflow,
  History,
  LayoutGrid,
  MessageCircle,
  ChevronsUpDown,
} from "lucide-react";
import { LESSON_BLOCK_DEFAULTS, type LessonBlockAttrs, type LessonBlockType } from "@/lib/lesson-blocks";
import { PhraseCardForm } from "./PhraseCardBlock";
import { StepListForm } from "./StepListBlock";
import { QuickCheckForm } from "./QuickCheckBlock";
import { KeyPointForm } from "./KeyPointBlock";
import { BreakdownForm, CompareForm, FactsForm, FlowForm, ScenarioForm, TimelineForm } from "./NewBlocks";

interface FormProps<T> {
  initial: T;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (attrs: T) => void;
}

type FormBlock = Exclude<LessonBlockType, "moreBlock">;

const FORMS: { [K in FormBlock]: ComponentType<FormProps<LessonBlockAttrs[K]>> } = {
  phraseCard: PhraseCardForm,
  stepList: StepListForm,
  quickCheck: QuickCheckForm,
  keyPoint: KeyPointForm,
  breakdown: BreakdownForm,
  compare: CompareForm,
  flow: FlowForm,
  timeline: TimelineForm,
  facts: FactsForm,
  scenario: ScenarioForm,
};

const BLOCK_BUTTONS: { type: FormBlock; label: string; icon: typeof Languages }[] = [
  { type: "phraseCard", label: "Arabic phrase", icon: Languages },
  { type: "breakdown", label: "Word by word", icon: Columns2 },
  { type: "stepList", label: "Steps", icon: ListOrdered },
  { type: "quickCheck", label: "Quick question", icon: HelpCircle },
  { type: "keyPoint", label: "Key point", icon: Sparkles },
  { type: "compare", label: "Compare", icon: Scale },
  { type: "flow", label: "Flow", icon: Workflow },
  { type: "timeline", label: "Timeline", icon: History },
  { type: "facts", label: "Fact cards", icon: LayoutGrid },
  { type: "scenario", label: "Conversation", icon: MessageCircle },
];

export function InsertBlockToolbar({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState<FormBlock | null>(null);

  function insert(type: LessonBlockType, attrs: object) {
    editor.chain().focus().insertContent({ type, attrs }).run();
    setOpen(null);
  }

  function insertMore() {
    editor
      .chain()
      .focus()
      .insertContent({ type: "moreBlock", attrs: { title: "" }, content: [{ type: "paragraph" }] })
      .run();
  }

  const buttonClass = (active: boolean) =>
    `flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
      active
        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-0.5">
      {BLOCK_BUTTONS.map(({ type, label, icon: Icon }) => {
        const Form = FORMS[type] as ComponentType<FormProps<object>>;
        return (
          <div key={type} className="relative">
            <button
              type="button"
              onClick={() => setOpen(open === type ? null : type)}
              title={label}
              className={buttonClass(open === type)}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
            {open === type && (
              <div className="absolute top-full left-0 mt-1 z-50">
                <Form
                  initial={LESSON_BLOCK_DEFAULTS[type]}
                  submitLabel="Insert"
                  onCancel={() => setOpen(null)}
                  onSubmit={(attrs) => insert(type, attrs)}
                />
              </div>
            )}
          </div>
        );
      })}
      <button type="button" onClick={insertMore} title="Collapsible section" className={buttonClass(false)}>
        <ChevronsUpDown className="h-3.5 w-3.5" />
        More section
      </button>
    </div>
  );
}
