import { memo, useCallback, useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import type { NodeProps, Edge } from '@xyflow/react';
import { Sparkles, Trash2, AlertCircle, RotateCcw } from 'lucide-react';
import type { PromptNode, SummaryNodeData, GeneratedNodeData, CustomNodeData, CustomNode } from '../types';
import { GENERATED_COLORS } from '../types';
import { useCanvasStore } from '../store/canvasStore';
import { generateIdeas } from '../services/aiService';

function PromptNodeComponent({ id, data, selected, positionAbsoluteX, positionAbsoluteY }: NodeProps<PromptNode>) {
  const { updateNodeData, removeNode, addNodes, addEdges, apiKey, edges } = useCanvasStore();
  const [localPrompt, setLocalPrompt] = useState(data.prompt);
  const { getNodes } = useReactFlow();

  const getConnectedContext = useCallback(() => {
    const allNodes = getNodes();
    const incomingEdges = edges.filter((e) => e.target === id);
    return incomingEdges
      .map((e) => {
        const sourceNode = allNodes.find((n) => n.id === e.source);
        if (!sourceNode) return null;
        const d = sourceNode.data as CustomNodeData;
        if (d.kind === 'idea') return d.text;
        if (d.kind === 'generated') return d.text;
        if (d.kind === 'summary') return d.summary;
        return null;
      })
      .filter(Boolean) as string[];
  }, [id, edges, getNodes]);

  const onGenerate = useCallback(async () => {
    if (!localPrompt.trim()) return;
    if (!apiKey) {
      updateNodeData(id, { status: 'error', error: 'No API key set. Click the key icon in the toolbar.' });
      return;
    }

    updateNodeData(id, { status: 'loading', prompt: localPrompt });

    try {
      const context = getConnectedContext();
      const result = await generateIdeas(apiKey, localPrompt, context);

      const baseX = positionAbsoluteX ?? 0;
      const baseY = positionAbsoluteY ?? 0;
      const now = Date.now();

      const summaryId = `summary-${now}`;
      const summaryNode: CustomNode = {
        id: summaryId,
        type: 'summary',
        position: { x: baseX + 380, y: baseY - 20 },
        data: { kind: 'summary', summary: result.summary, sourcePrompt: localPrompt } as SummaryNodeData,
      };

      const generatedNodes: CustomNode[] = result.ideas.map((idea, i): CustomNode => ({
        id: `gen-${now}-${i}`,
        type: 'generated',
        position: { x: baseX + 760, y: baseY - 60 + i * 130 },
        data: {
          kind: 'generated',
          text: idea,
          index: i,
          color: GENERATED_COLORS[i % GENERATED_COLORS.length],
        } as GeneratedNodeData,
      }));

      const newEdges: Edge[] = [
        {
          id: `e-prompt-summary-${now}`,
          source: id,
          target: summaryId,
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'rgba(124,58,237,0.8)', strokeWidth: 2 },
        },
        ...generatedNodes.map((gn) => ({
          id: `e-summary-${gn.id}`,
          source: summaryId,
          target: gn.id,
          type: 'smoothstep',
          animated: false,
          style: { stroke: 'rgba(79,70,229,0.5)', strokeWidth: 1.5 },
        })),
      ];

      addNodes([summaryNode, ...generatedNodes]);
      addEdges(newEdges);
      updateNodeData(id, { status: 'done', prompt: localPrompt });
    } catch (err) {
      updateNodeData(id, {
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, [localPrompt, apiKey, id, updateNodeData, getConnectedContext, addNodes, addEdges, positionAbsoluteX, positionAbsoluteY]);

  const onReset = useCallback(() => {
    updateNodeData(id, { status: 'idle' });
  }, [id, updateNodeData]);

  const isLoading = data.status === 'loading';

  return (
    <div
      className={`node-enter ${isLoading ? 'ai-loading' : ''}`}
      style={{
        background: isLoading ? undefined : 'rgba(37,99,235,0.12)',
        border: `1.5px solid ${selected ? '#2563eb' : 'rgba(37,99,235,0.45)'}`,
        borderRadius: 12,
        minWidth: 260,
        backdropFilter: 'blur(8px)',
        boxShadow: selected
          ? '0 0 0 2px #2563eb, 0 8px 32px rgba(0,0,0,0.4)'
          : '0 4px 20px rgba(0,0,0,0.3)',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      <div
        style={{
          background: 'rgba(37,99,235,0.2)',
          borderBottom: '1px solid rgba(37,99,235,0.3)',
          borderRadius: '10px 10px 0 0',
          padding: '7px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Sparkles size={12} color="#60a5fa" />
        <span style={{ color: '#60a5fa', fontSize: 11, fontWeight: 600, flex: 1 }}>AI PROMPT</span>
        {data.status === 'error' && (
          <button className="nodrag" onClick={onReset}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: 2, display: 'flex' }}>
            <RotateCcw size={12} />
          </button>
        )}
        <button className="nodrag" onClick={() => removeNode(id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 2, display: 'flex' }}>
          <Trash2 size={12} />
        </button>
      </div>

      <div style={{ padding: '10px 12px 12px' }}>
        <textarea
          className="node-textarea nodrag"
          value={localPrompt}
          onChange={(e) => setLocalPrompt(e.target.value)}
          placeholder="Enter your prompt for AI expansion..."
          rows={4}
          disabled={isLoading}
          style={{ color: 'rgba(255,255,255,0.88)', fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}
        />

        {data.status === 'error' && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 6,
            background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)',
            borderRadius: 6, padding: '6px 8px', marginBottom: 8,
          }}>
            <AlertCircle size={12} color="#f87171" style={{ marginTop: 1, flexShrink: 0 }} />
            <span style={{ color: '#fca5a5', fontSize: 11, lineHeight: 1.4 }}>{data.error}</span>
          </div>
        )}

        <button
          className="nodrag"
          onClick={onGenerate}
          disabled={isLoading || !localPrompt.trim()}
          style={{
            width: '100%', padding: '8px 12px',
            background: isLoading ? 'rgba(37,99,235,0.2)' : 'rgba(37,99,235,0.8)',
            border: '1px solid rgba(37,99,235,0.6)', borderRadius: 7,
            color: '#fff', fontSize: 12, fontWeight: 600,
            cursor: isLoading || !localPrompt.trim() ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'background 0.2s ease',
            opacity: !localPrompt.trim() ? 0.5 : 1,
          }}
        >
          {isLoading ? (
            <>
              <div className="spin" style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%' }} />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={12} />
              {data.status === 'done' ? 'Regenerate' : 'Generate Ideas'}
            </>
          )}
        </button>
      </div>

      <Handle type="target" position={Position.Left} style={{ left: -6, top: '50%' }} />
      <Handle type="source" position={Position.Right} style={{ right: -6, top: '50%' }} />
      <Handle type="target" position={Position.Top} id="top" style={{ top: -6, left: '50%' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ bottom: -6, left: '50%' }} />
    </div>
  );
}

export default memo(PromptNodeComponent);
