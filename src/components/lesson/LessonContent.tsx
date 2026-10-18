import { ChevronDown } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  normalizeBreakdown,
  normalizeCompare,
  normalizeFacts,
  normalizeFlow,
  normalizeKeyPoint,
  normalizeMore,
  normalizePhraseCard,
  normalizeQuickCheck,
  normalizeScenario,
  normalizeStepList,
  normalizeTimeline,
} from "@/lib/lesson-blocks";
import {
  asNode,
  childNodes,
  hasRenderableContent,
  isLessonBlock,
  nodeMarks,
  plainText,
  safeImageSrc,
  safeLink,
  linkedVideo,
  youtubeEmbedUrl,
  type TipTapNode,
} from "./tiptap";
import { LessonVideo, LinkedVideo } from "./LessonVideo";
import { PhraseCard } from "./PhraseCard";
import { KeyPoint } from "./KeyPoint";
import { StepListBlock } from "./StepListBlock";
import { QuickCheckBlock } from "./QuickCheckBlock";
import { BreakdownBlock } from "./blocks/BreakdownBlock";
import { CompareBlock } from "./blocks/CompareBlock";
import { FlowBlock } from "./blocks/FlowBlock";
import { TimelineBlock } from "./blocks/TimelineBlock";
import { FactsBlock } from "./blocks/FactsBlock";
import { ScenarioBlock } from "./blocks/ScenarioBlock";
import { MoreBlock } from "./blocks/MoreBlock";

interface RenderContext {
  slug: string;
  videoTitle: string;
  newTabLabel: string;
  watchOn: (site: string) => string;
  blockCount: number;
}

interface LessonContentProps {
  doc: unknown;
  lessonSlug: string;
  videoTitle: string;
  className?: string;
}

const SOURCES_HEADINGS = new Set(["Sources", "المصادر", "Fuentes"]);

interface SourcesSplit {
  before: TipTapNode[];
  list: TipTapNode;
  after: TipTapNode[];
  count: number;
}

function splitSources(children: TipTapNode[]): SourcesSplit | null {
  for (let i = 0; i < children.length - 1; i++) {
    const node = children[i];
    if (node.type !== "heading") continue;
    if (!SOURCES_HEADINGS.has(plainText(node).trim())) continue;
    const list = children[i + 1];
    if (list.type !== "bulletList") continue;
    return {
      before: children.slice(0, i),
      list,
      after: children.slice(i + 2),
      count: childNodes(list).length,
    };
  }
  return null;
}

function SourcesDisclosure({ count, children }: { count: number; children: ReactNode }) {
  const t = useTranslations("blocks");
  return (
    <details className="group my-2 overflow-hidden rounded-[var(--radius-cell)] border border-rule bg-canvas">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-[0.9375rem] font-semibold text-ink [&::-webkit-details-marker]:hidden">
        {t("sourcesCount", { count })}
        <ChevronDown
          aria-hidden="true"
          strokeWidth={2}
          className="size-4 shrink-0 text-ink-3 transition-transform duration-200 group-open:rotate-180"
        />
      </summary>
      <div className="border-t border-rule px-5 pt-4 pb-1 sm:px-6">{children}</div>
    </details>
  );
}

export function LessonContent({ doc, lessonSlug, videoTitle, className = "" }: LessonContentProps) {
  const t = useTranslations("blocks");
  const root = asNode(doc);
  if (!root) return null;

  const ctx: RenderContext = {
    slug: lessonSlug,
    videoTitle,
    newTabLabel: t("opensInNewTab"),
    watchOn: (site: string) => t("watchOn", { site }),
    blockCount: 0,
  };

  const children = childNodes(root);
  const sources = splitSources(children);

  if (!sources) {
    return <div className={`lesson-prose ${className}`}>{renderNodeList(children, ctx)}</div>;
  }

  return (
    <div className={`lesson-prose ${className}`}>
      {renderNodeList(sources.before, ctx)}
      <SourcesDisclosure count={sources.count}>{renderNodeList([sources.list], ctx)}</SourcesDisclosure>
      {renderNodeList(sources.after, ctx)}
    </div>
  );
}

function linkOf(node: TipTapNode) {
  if (node.type !== "text") return null;
  const mark = nodeMarks(node).find((m) => m.type === "link");
  return mark ? safeLink(mark.attrs?.href) : null;
}

function renderChildren(node: TipTapNode, ctx: RenderContext): ReactNode[] {
  return renderNodeList(childNodes(node), ctx);
}

function renderNodeList(children: TipTapNode[], ctx: RenderContext): ReactNode[] {
  const output: ReactNode[] = [];

  for (let i = 0; i < children.length; i++) {
    const link = linkOf(children[i]);
    if (!link) {
      output.push(<Fragment key={i}>{renderNode(children[i], ctx)}</Fragment>);
      continue;
    }

    const run: ReactNode[] = [];
    let j = i;
    while (j < children.length && linkOf(children[j])?.href === link.href) {
      run.push(<Fragment key={j}>{renderText(children[j])}</Fragment>);
      j++;
    }
    output.push(
      <a
        key={i}
        href={link.href}
        {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {run}
        {link.external ? <span className="sr-only"> ({ctx.newTabLabel})</span> : null}
      </a>
    );
    i = j - 1;
  }

  return output;
}

function renderText(node: TipTapNode): ReactNode {
  if (typeof node.text !== "string" || node.text.length === 0) return null;
  return nodeMarks(node).reduce<ReactNode>((content, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong>{content}</strong>;
      case "italic":
        return <em>{content}</em>;
      case "underline":
        return <u>{content}</u>;
      case "strike":
        return <s>{content}</s>;
      case "code":
        return <code>{content}</code>;
      default:
        return content;
    }
  }, node.text);
}

function codeText(node: TipTapNode): string {
  return childNodes(node)
    .map((child) => (typeof child.text === "string" ? child.text : child.type === "hardBreak" ? "\n" : ""))
    .join("");
}

function renderBlock(node: TipTapNode, ctx: RenderContext): ReactNode {
  const index = ctx.blockCount;
  ctx.blockCount += 1;

  switch (node.type) {
    case "phraseCard": {
      const attrs = normalizePhraseCard(node.attrs);
      return attrs ? (
        <div className="lesson-block py-3">
          <PhraseCard {...attrs} lessonSlug={ctx.slug} />
        </div>
      ) : null;
    }
    case "stepList": {
      const attrs = normalizeStepList(node.attrs);
      return attrs ? (
        <div className="lesson-block py-3">
          <StepListBlock {...attrs} storageKey={`bd.steps.${ctx.slug}.${index}`} />
        </div>
      ) : null;
    }
    case "quickCheck": {
      const attrs = normalizeQuickCheck(node.attrs);
      return attrs ? (
        <div className="lesson-block py-3">
          <QuickCheckBlock {...attrs} />
        </div>
      ) : null;
    }
    case "keyPoint": {
      const attrs = normalizeKeyPoint(node.attrs);
      return attrs ? (
        <div className="lesson-block py-3">
          <KeyPoint {...attrs} />
        </div>
      ) : null;
    }
    case "breakdown": {
      const attrs = normalizeBreakdown(node.attrs);
      return attrs ? (
        <div className="lesson-block py-3">
          <BreakdownBlock {...attrs} lessonSlug={ctx.slug} />
        </div>
      ) : null;
    }
    case "compare": {
      const attrs = normalizeCompare(node.attrs);
      return attrs ? (
        <div className="lesson-block py-3">
          <CompareBlock {...attrs} />
        </div>
      ) : null;
    }
    case "flow": {
      const attrs = normalizeFlow(node.attrs);
      return attrs ? (
        <div className="lesson-block py-3">
          <FlowBlock {...attrs} />
        </div>
      ) : null;
    }
    case "timeline": {
      const attrs = normalizeTimeline(node.attrs);
      return attrs ? (
        <div className="lesson-block py-3">
          <TimelineBlock {...attrs} />
        </div>
      ) : null;
    }
    case "facts": {
      const attrs = normalizeFacts(node.attrs);
      return attrs ? (
        <div className="lesson-block py-3">
          <FactsBlock {...attrs} />
        </div>
      ) : null;
    }
    case "scenario": {
      const attrs = normalizeScenario(node.attrs);
      return attrs ? (
        <div className="lesson-block py-3">
          <ScenarioBlock {...attrs} />
        </div>
      ) : null;
    }
    case "moreBlock": {
      if (!hasRenderableContent(node)) return null;
      const { title } = normalizeMore(node.attrs);
      return (
        <div className="py-3">
          <MoreBlock title={title}>{renderChildren(node, ctx)}</MoreBlock>
        </div>
      );
    }
    default:
      return null;
  }
}

function renderNode(node: TipTapNode, ctx: RenderContext): ReactNode {
  const attrs = node.attrs ?? {};

  if (isLessonBlock(node.type)) return renderBlock(node, ctx);

  switch (node.type) {
    case "doc":
      return renderChildren(node, ctx);
    case "text":
      return renderText(node);
    case "hardBreak":
      return <br />;
    case "horizontalRule":
      return <hr />;
    case "paragraph":
      return hasRenderableContent(node) ? <p>{renderChildren(node, ctx)}</p> : null;
    case "heading": {
      if (!hasRenderableContent(node)) return null;
      const rawLevel = attrs.level;
      const level = typeof rawLevel === "number" ? rawLevel : 2;
      const content = renderChildren(node, ctx);
      if (level <= 1) return <h2>{content}</h2>;
      if (level === 2) return <h3>{content}</h3>;
      return <h4 className="pt-2 text-[1.125rem] font-semibold leading-snug">{content}</h4>;
    }
    case "bulletList":
      return hasRenderableContent(node) ? <ul>{renderChildren(node, ctx)}</ul> : null;
    case "orderedList": {
      if (!hasRenderableContent(node)) return null;
      const rawStart = attrs.start;
      const start =
        typeof rawStart === "number" && Number.isInteger(rawStart) && rawStart !== 1 ? rawStart : undefined;
      return <ol start={start}>{renderChildren(node, ctx)}</ol>;
    }
    case "listItem":
      return hasRenderableContent(node) ? <li>{renderChildren(node, ctx)}</li> : null;
    case "blockquote":
      return hasRenderableContent(node) ? <blockquote>{renderChildren(node, ctx)}</blockquote> : null;
    case "codeBlock": {
      const code = codeText(node);
      return code.trim() ? (
        <pre dir="ltr">
          <code>{code}</code>
        </pre>
      ) : null;
    }
    case "image": {
      const src = safeImageSrc(attrs.src);
      if (!src) return null;
      const rawAlt = attrs.alt;
      const alt = typeof rawAlt === "string" ? rawAlt.slice(0, 300) : "";
      return <img src={src} alt={alt} loading="lazy" decoding="async" />;
    }
    case "youtube": {
      const src = youtubeEmbedUrl(attrs.src, attrs.start);
      if (src) return <LessonVideo src={src} title={ctx.videoTitle} />;
      const linked = linkedVideo(attrs.src);
      return linked ? (
        <LinkedVideo href={linked.href} label={ctx.watchOn(linked.site)} newTabLabel={ctx.newTabLabel} />
      ) : null;
    }
    default: {
      const content = renderChildren(node, ctx);
      return content.length > 0 ? content : null;
    }
  }
}
