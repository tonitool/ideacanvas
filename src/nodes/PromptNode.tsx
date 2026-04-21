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
          style: { stroke: '#000', strokeWidth: 1.5 },
        },
        ...generatedNodes.map((gn) => ({
          id: `e-summary-${gn.id}`,
          source: summaryId,
          target: gn.id,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#d4d4d4', strokeWidth: 1.5 },
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
        background: isLoading ? undefined : '#fff',
        border: `1.5px dashed ${selected ? '#000' : '#a3a3a3'}`,
        borderRadius: 10,
        minWidth: 260,
        boxShadow: selected
          ? '0 0 0 1.5px #000'
          : '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
      }}
    >
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #f0f0f0',
        borderRadius: '8px 8px 0 0',
        padding: '6px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: '#fafafa',
      }}>
        <Sparkles size={11} color="#a3a3a3" />
        <span style={{
          fontSize: 10, fontWeight: 600,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: '#a3a3a3', flex: 1,
        }}>
          AI Prompt
        </span>
        {data.status === 'error' && (
          <button
            className="nodrag"
            onClick={onReset}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d4d4d4', padding: 2, display: 'flex', borderRadius: 4, transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#737373')}
            onMouseLeave={e => (e.currentTarget.style.color = '#d4d4d4')}
          >
            <RotateCcw size={11} />
          </button>
        )}
        <button
          className="nodrag"
          onClick={() => removeNode(id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d4d4d4', padding: 2, display: 'flex', borderRadius: 4, transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#737373')}
          onMouseLeave={e => (e.currentTarget.style.color = '#d4d4d4')}
        >
          <Trash2 size={11} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '10px 12px 12px' }}>
        <textarea
          className="node-textarea nodrag"
          value={localPrompt}
          onChange={(e) => setLocalPrompt(e.target.value)}
          placeholder="Enter your prompt for AI expansion..."
          rows={4}
          disabled={isLoading}
          style={{ color: '#171717', fontSize: 13, lineHeight: 1.6, marginBottom: 10, minHeight: 64 }}
        />

        {data.status === 'error' && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 6,
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 6, padding: '6px 8px', marginBottom: 8,
          }}>
            <AlertCircle size={12} color="#dc2626" style={{ marginTop: 1, flexShrink: 0 }} />
            <span style={{ color: '#dc2626', fontSize: 11, lineHeight: 1.4 }}>{data.error}</span>
          </div>
        )}

        <button
          className="nodrag"
          onClick={onGenerate}
          disabled={isLoading || !localPrompt.trim()}
          style={{
            width: '100%', padding: '7px 12px',
            background: isLoading || !localPrompt.trim() ? '#f5f5f5' : '#000',
            border: '1px solid',
            borderColor: isLoading || !localPrompt.trim() ? '#e5e5e5' : '#000',
            borderRadius: 6,
            color: isLoading || !localPrompt.trim() ? '#a3a3a3' : '#fff',
            fontSize: 12, fontWeight: 600,
            cursor: isLoading || !localPrompt.trim() ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 0.15s ease',
          }}
        >
          {isLoading ? (
            <>
              <div style={{ width: 11, height: 11, border: '1.5px solid #d4d4d4', borderTop: '1.5px solid #737373', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={11} />
              {data.status === 'done' ? 'Regenerate' : 'Generate Ideas'}
            </>
          )}
        </button>
      </div>

      <Handle type="target" position={Position.Left} style={{ left: -5, top: '50%' }} />
      <Handle type="source" position={Position.Right} style={{ right: -5, top: '50%' }} />
      <Handle type="target" position={Position.Top} id="top" style={{ top: -5, left: '50%' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ bottom: -5, left: '50%' }} />
    </div>
  );
}

export default memo(PromptNodeComponent);
