import type { NodeTypes } from '@xyflow/react';
import IdeaNodeComponent from './IdeaNode';
import PromptNodeComponent from './PromptNode';
import SummaryNodeComponent from './SummaryNode';
import GeneratedNodeComponent from './GeneratedNode';
import ImageNodeComponent from './ImageNode';

export const nodeTypes: NodeTypes = {
  idea: IdeaNodeComponent as NodeTypes[string],
  prompt: PromptNodeComponent as NodeTypes[string],
  summary: SummaryNodeComponent as NodeTypes[string],
  generated: GeneratedNodeComponent as NodeTypes[string],
  image: ImageNodeComponent as NodeTypes[string],
};
