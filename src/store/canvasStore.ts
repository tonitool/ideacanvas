import { create } from 'zustand';
import type { Edge, NodeChange, EdgeChange, Connection } from '@xyflow/react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import type { CustomNode, CustomNodeData } from '../types';

interface CanvasStore {
  nodes: CustomNode[];
  edges: Edge[];
  apiKey: string;
  setApiKey: (key: string) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: CustomNode) => void;
  updateNodeData: (id: string, data: Partial<CustomNodeData>) => void;
  removeNode: (id: string) => void;
  addNodes: (nodes: CustomNode[]) => void;
  addEdges: (edges: Edge[]) => void;
  clearCanvas: () => void;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  nodes: [],
  edges: [],
  apiKey: localStorage.getItem('openrouter_api_key') || '',

  setApiKey: (key) => {
    localStorage.setItem('openrouter_api_key', key);
    set({ apiKey: key });
  },

  onNodesChange: (changes) => {
    set({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      nodes: applyNodeChanges(changes, get().nodes as any) as any as CustomNode[],
    });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(
        {
          ...connection,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#d4d4d4', strokeWidth: 1.5 },
        },
        get().edges
      ),
    });
  },

  addNode: (node) => {
    set({ nodes: [...get().nodes, node] });
  },

  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } as CustomNodeData } as CustomNode : n
      ),
    });
  },

  removeNode: (id) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
    });
  },

  addNodes: (nodes) => {
    set({ nodes: [...get().nodes, ...nodes] });
  },

  addEdges: (edges) => {
    set({ edges: [...get().edges, ...edges] });
  },

  clearCanvas: () => {
    set({ nodes: [], edges: [] });
  },
}));
