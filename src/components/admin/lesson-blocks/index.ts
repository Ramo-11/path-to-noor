import { PhraseCardNode } from "./PhraseCardBlock";
import { StepListNode } from "./StepListBlock";
import { QuickCheckNode } from "./QuickCheckBlock";
import { KeyPointNode } from "./KeyPointBlock";
import { BreakdownNode, CompareNode, FactsNode, FlowNode, MoreNode, ScenarioNode, TimelineNode } from "./NewBlocks";

export const LESSON_BLOCK_EXTENSIONS = [
  PhraseCardNode,
  StepListNode,
  QuickCheckNode,
  KeyPointNode,
  BreakdownNode,
  CompareNode,
  FlowNode,
  TimelineNode,
  FactsNode,
  ScenarioNode,
  MoreNode,
];

export { InsertBlockToolbar } from "./InsertBlockToolbar";
