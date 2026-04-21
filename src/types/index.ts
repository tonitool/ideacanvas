import type { Node } from '@xyflow/react';

export type NodeKind = 'idea' | 'prompt' | 'summary' | 'generated' | 'image';

export interface IdeaNodeData extends Record<string, unknown> {
  kind: 'idea';
  text: string;
  color: string;
  label?: string;
}

export interface PromptNodeData extends Record<string, unknown> {
  kind: 'prompt';
  prompt: string;
  status: 'idle' | 'loading' | 'done' | 'error';
  error?: string;
  label?: string;
}

export interface SummaryNodeData extends Record<string, unknown> {
  kind: 'summary';
  summary: string;
  sourcePrompt?: string;
  label?: string;
}

export interface GeneratedNodeData extends Record<string, unknown> {
  kind: 'generated';
  text: string;
  index: number;
  color: string;
  label?: string;
}

export interface ImageNodeData extends Record<string, unknown> {
  kind: 'image';
  url: string;
  caption?: string;
  label?: string;
}

export type IdeaNode = Node<IdeaNodeData, 'idea'>;
export type PromptNode = Node<PromptNodeData, 'prompt'>;
export type SummaryNode = Node<SummaryNodeData, 'summary'>;
export type GeneratedNode = Node<GeneratedNodeData, 'generated'>;
export type ImageNode = Node<ImageNodeData, 'image'>;

export type CustomNode = IdeaNode | PromptNode | SummaryNode | GeneratedNode | ImageNode;
export type CustomNodeData =
  | IdeaNodeData
  | PromptNodeData
  | SummaryNodeData
  | GeneratedNodeData
  | ImageNodeData;

export interface AIGenerateResult {
  summary: string;
  ideas: string[];
}

export const IDEA_COLORS = [
  '#7c3aed',
  '#2563eb',
  '#059669',
  '#d97706',
  '#dc2626',
  '#db2777',
  '#0891b2',
  '#7c3aed',
];

export const GENERATED_COLORS = [
  '#4f46e5',
  '#0284c7',
  '#0d9488',
  '#ca8a04',
  '#9333ea',
];
