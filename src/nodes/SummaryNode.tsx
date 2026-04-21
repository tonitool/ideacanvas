import { memo, useCallback } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Brain, Trash2, Copy } from 'lucide-react';
import type { SummaryNode } from '../types';
import { useCanvasStore } from '../store/canvasStore';

function SummaryNodeComponent({ id, data, selected }: NodeProps<SummaryNode>) {
  const { removeNode } = useCanvasStore();

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(data.summary).catch(() => {});
  }, [data.summary]);

  return (
    <div
      className="node-enter"
      style={{
        background: 'rgba(124,58,237,0.12)',
        border: `1.5px solid ${selected ? '#7c3aed' : 'rgba(124,58,237,0.4)'}`,
        borderRadius: 12,
        minWidth: 240,
        maxWidth: 340,
        backdropFilter: 'blur(8px)',
        boxShadow: selected
          ? '0 0 0 2px #7c3aed, 0 8px 32px rgba(124,58,237,0.25)'
          : '0 4px 20px rgba(0,0,0,0.3)',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      <NodeResizer
        minWidth={220}
        minHeight={80}
        isVisible={!!selected}
        lineStyle={{ borderColor: '#7c3aed', borderWidth: 1 }}
        handleStyle={{ background: '#7c3aed', width: 8, height: 8, borderRadius: 4 }}
      />

      <div
        style={{
          background: 'rgba(124,58,237,0.2)',
          borderBottom: '1px solid rgba(124,58,237,0.3)',
          borderRadius: '10px 10px 0 0',
          padding: '7px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Brain size={12} color="#a78bfa" />
        <span style={{ color: '#a78bfa', fontSize: 11, fontWeight: 600, flex: 1 }}>AI SUMMARY</span>
        <button className="nodrag" onClick={onCopy}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 2, display: 'flex' }}>
          <Copy size={12} />
        </button>
        <button className="nodrag" onClick={() => removeNode(id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 2, display: 'flex' }}>
          <Trash2 size={12} />
        </button>
      </div>

      <div style={{ padding: '10px 12px 12px' }}>
        {data.sourcePrompt && (
          <div style={{
            fontSize: 10, color: 'rgba(167,139,250,0.6)', marginBottom: 6,
            fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            "{data.sourcePrompt}"
          </div>
        )}
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.65, margin: 0 }}>
          {data.summary}
        </p>
      </div>

      <Handle type="target" position={Position.Left} style={{ left: -6, top: '50%' }} />
      <Handle type="source" position={Position.Right} style={{ right: -6, top: '50%' }} />
      <Handle type="target" position={Position.Top} id="top" style={{ top: -6, left: '50%' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ bottom: -6, left: '50%' }} />
    </div>
  );
}

export default memo(SummaryNodeComponent);
