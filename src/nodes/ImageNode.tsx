import { memo, useCallback, useState } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Image, Trash2, Edit3, Check, X } from 'lucide-react';
import type { ImageNode } from '../types';
import { useCanvasStore } from '../store/canvasStore';

function ImageNodeComponent({ id, data, selected }: NodeProps<ImageNode>) {
  const { updateNodeData, removeNode } = useCanvasStore();
  const [editingUrl, setEditingUrl] = useState(false);
  const [urlDraft, setUrlDraft] = useState(data.url);
  const [imgError, setImgError] = useState(false);

  const onConfirmUrl = useCallback(() => {
    updateNodeData(id, { url: urlDraft });
    setImgError(false);
    setEditingUrl(false);
  }, [id, urlDraft, updateNodeData]);

  const onCancelUrl = useCallback(() => {
    setUrlDraft(data.url);
    setEditingUrl(false);
  }, [data.url]);

  return (
    <div
      className="node-enter"
      style={{
        background: 'rgba(8,145,178,0.12)',
        border: `1.5px solid ${selected ? '#0891b2' : 'rgba(8,145,178,0.4)'}`,
        borderRadius: 12,
        minWidth: 220,
        backdropFilter: 'blur(8px)',
        boxShadow: selected
          ? '0 0 0 2px #0891b2, 0 8px 32px rgba(0,0,0,0.4)'
          : '0 4px 20px rgba(0,0,0,0.3)',
        transition: 'box-shadow 0.2s ease',
        overflow: 'hidden',
      }}
    >
      <NodeResizer
        minWidth={200}
        minHeight={120}
        isVisible={!!selected}
        lineStyle={{ borderColor: '#0891b2', borderWidth: 1 }}
        handleStyle={{ background: '#0891b2', width: 8, height: 8, borderRadius: 4 }}
      />

      <div
        style={{
          background: 'rgba(8,145,178,0.2)',
          borderBottom: '1px solid rgba(8,145,178,0.3)',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Image size={12} color="#22d3ee" />
        <span style={{ color: '#22d3ee', fontSize: 11, fontWeight: 600, flex: 1 }}>IMAGE</span>
        <button className="nodrag" onClick={() => setEditingUrl(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 2, display: 'flex' }}>
          <Edit3 size={12} />
        </button>
        <button className="nodrag" onClick={() => removeNode(id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 2, display: 'flex' }}>
          <Trash2 size={12} />
        </button>
      </div>

      {editingUrl && (
        <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(8,145,178,0.2)' }}>
          <input
            className="nodrag"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onConfirmUrl(); if (e.key === 'Escape') onCancelUrl(); }}
            placeholder="Paste image URL..."
            autoFocus
            style={{
              width: '100%', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(8,145,178,0.4)', borderRadius: 5,
              padding: '5px 8px', color: 'rgba(255,255,255,0.88)',
              fontSize: 12, outline: 'none', marginBottom: 6, boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="nodrag" onClick={onConfirmUrl}
              style={{
                flex: 1, padding: '4px', background: 'rgba(8,145,178,0.3)',
                border: '1px solid rgba(8,145,178,0.5)', borderRadius: 5,
                color: '#22d3ee', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 11,
              }}>
              <Check size={11} /> Set
            </button>
            <button className="nodrag" onClick={onCancelUrl}
              style={{
                padding: '4px 8px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5,
                color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
              }}>
              <X size={11} />
            </button>
          </div>
        </div>
      )}

      {data.url && !imgError ? (
        <img
          src={data.url}
          alt={data.caption || 'Canvas image'}
          onError={() => setImgError(true)}
          style={{ width: '100%', maxHeight: 300, objectFit: 'contain', display: 'block', background: 'rgba(0,0,0,0.3)' }}
        />
      ) : (
        <div style={{
          width: '100%', height: 120,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 8, color: 'rgba(255,255,255,0.25)', fontSize: 12,
        }}>
          <Image size={28} color="rgba(255,255,255,0.15)" />
          {imgError ? 'Failed to load image' : 'Click edit to set image URL'}
        </div>
      )}

      {data.caption && (
        <div style={{
          padding: '6px 10px', borderTop: '1px solid rgba(8,145,178,0.2)',
          color: 'rgba(255,255,255,0.5)', fontSize: 11, fontStyle: 'italic', textAlign: 'center',
        }}>
          {data.caption}
        </div>
      )}

      <Handle type="target" position={Position.Left} style={{ left: -6, top: '50%' }} />
      <Handle type="source" position={Position.Right} style={{ right: -6, top: '50%' }} />
      <Handle type="target" position={Position.Top} id="top" style={{ top: -6, left: '50%' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ bottom: -6, left: '50%' }} />
    </div>
  );
}

export default memo(ImageNodeComponent);
