import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from '@/nodes/nodeTypes';
import { useCanvasStore } from '@/store/canvasStore';
import Toolbar from '@/components/Toolbar';
import ApiKeyModal from '@/components/ApiKeyModal';
import type { IdeaNode, PromptNode, CustomNode } from '@/types';
import { IDEA_COLORS } from '@/types';

let counter = 0;
function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${counter++}`;
}

function CanvasInner() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useCanvasStore();
  const [apiKeyOpen, setApiKeyOpen] = useState(false);
  const { screenToFlowPosition } = useReactFlow();
  const { apiKey } = useCanvasStore();

  useEffect(() => {
    if (!apiKey) {
      const timer = setTimeout(() => setApiKeyOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const onPaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const pos = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      addNode({
        id: uid('idea'),
        type: 'idea',
        position: { x: pos.x - 100, y: pos.y - 40 },
        data: { kind: 'idea', text: '', color: IDEA_COLORS[0] },
      } as IdeaNode);
    },
    [screenToFlowPosition, addNode]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;

      const cx = window.innerWidth / 2 + Math.random() * 40 - 20;
      const cy = window.innerHeight / 2 + Math.random() * 40 - 20;
      const pos = screenToFlowPosition({ x: cx, y: cy });

      if (e.key === 'i' || e.key === 'I') {
        addNode({ id: uid('idea'), type: 'idea', position: pos, data: { kind: 'idea', text: '', color: IDEA_COLORS[0] } } as IdeaNode);
      }
      if (e.key === 'p' || e.key === 'P') {
        addNode({ id: uid('prompt'), type: 'prompt', position: pos, data: { kind: 'prompt', prompt: '', status: 'idle' } } as PromptNode);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screenToFlowPosition, addNode]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { id, text } = (e as CustomEvent<{ id: string; text: string }>).detail;
      const sourceNode = nodes.find((n) => n.id === id);
      if (!sourceNode) return;

      const newId = uid('prompt');
      addNode({
        id: newId,
        type: 'prompt',
        position: { x: sourceNode.position.x + 280, y: sourceNode.position.y },
        data: { kind: 'prompt', prompt: text, status: 'idle' },
      } as PromptNode);

      useCanvasStore.getState().addEdges([{
        id: uid('edge'),
        source: id,
        target: newId,
        type: 'smoothstep',
        style: { stroke: '#d4d4d4', strokeWidth: 1.5 },
      }]);
    };
    window.addEventListener('expand-generated-node', handler);
    return () => window.removeEventListener('expand-generated-node', handler);
  }, [nodes, addNode]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodes={nodes as any}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onDoubleClick={onPaneDoubleClick}
        minZoom={0.1}
        maxZoom={3}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        fitView={false}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode="Shift"
        panOnDrag={[1, 2]}
        elevateEdgesOnSelect
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(0,0,0,0.08)" />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={() => 'rgba(0,0,0,0.2)'}
          style={{ bottom: 12, right: 12 }}
        />

        {nodes.length === 0 && (
          <Panel position="top-center">
            <div style={{
              marginTop: 40, textAlign: 'center', color: '#a3a3a3',
              fontSize: 14, pointerEvents: 'none', userSelect: 'none',
            }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.25 }}>✦</div>
              <p style={{ marginBottom: 4, fontWeight: 500, color: '#525252' }}>Your idea canvas is empty</p>
              <p style={{ fontSize: 12 }}>
                Double-click anywhere · Press{' '}
                <kbd style={{ background: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: 3, padding: '1px 6px', fontFamily: 'monospace', fontSize: 11, color: '#525252' }}>I</kbd>
                {' '}for idea ·{' '}
                <kbd style={{ background: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: 3, padding: '1px 6px', fontFamily: 'monospace', fontSize: 11, color: '#525252' }}>P</kbd>
                {' '}for AI prompt
              </p>
            </div>
          </Panel>
        )}
      </ReactFlow>

      <Toolbar onOpenApiKey={() => setApiKeyOpen(true)} onAddNode={(n) => addNode(n as CustomNode)} />

      {apiKeyOpen && <ApiKeyModal onClose={() => setApiKeyOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
