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

import { nodeTypes } from './nodes/nodeTypes';
import { useCanvasStore } from './store/canvasStore';
import Toolbar from './components/Toolbar';
import ApiKeyModal from './components/ApiKeyModal';
import type { IdeaNode, PromptNode, CustomNode, CustomNodeData } from './types';
import { IDEA_COLORS } from './types';

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
        style: { stroke: 'rgba(124,58,237,0.5)', strokeWidth: 1.5 },
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
        colorMode="dark"
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(255,255,255,0.07)" />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={(node) => {
            const d = node.data as CustomNodeData;
            if (d.kind === 'idea') return d.color;
            if (d.kind === 'prompt') return '#2563eb';
            if (d.kind === 'summary') return '#7c3aed';
            if (d.kind === 'generated') return d.color;
            if (d.kind === 'image') return '#0891b2';
            return '#444';
          }}
          style={{ bottom: 12, right: 12 }}
        />

        {nodes.length === 0 && (
          <Panel position="top-center">
            <div style={{
              marginTop: 40, textAlign: 'center', color: 'rgba(255,255,255,0.18)',
              fontSize: 14, pointerEvents: 'none', userSelect: 'none',
            }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>✦</div>
              <p style={{ marginBottom: 4, fontWeight: 500 }}>Your idea canvas is empty</p>
              <p style={{ fontSize: 12 }}>
                Double-click anywhere · Press{' '}
                <kbd style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 3, padding: '1px 6px', fontFamily: 'monospace', fontSize: 11 }}>I</kbd>
                {' '}for idea ·{' '}
                <kbd style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 3, padding: '1px 6px', fontFamily: 'monospace', fontSize: 11 }}>P</kbd>
                {' '}for AI prompt
              </p>
            </div>
          </Panel>
        )}
      </ReactFlow>

      <Toolbar onOpenApiKey={() => setApiKeyOpen(true)} onAddNode={(n) => addNode(n as CustomNode)} />

      <div style={{
        position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)',
        zIndex: 100, background: 'rgba(26,26,46,0.85)',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20,
        padding: '5px 16px', display: 'flex', alignItems: 'center', gap: 8,
        backdropFilter: 'blur(12px)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        pointerEvents: 'none',
      }}>
        <span style={{
          background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em',
        }}>
          IdeaCanvas
        </span>
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>·</span>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
          {nodes.length} node{nodes.length !== 1 ? 's' : ''}
        </span>
        {apiKey && (
          <>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>·</span>
            <span style={{ color: 'rgba(5,150,105,0.8)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
              AI ready
            </span>
          </>
        )}
      </div>

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
