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
        background: '#fff',
        border: `1px solid ${selected ? '#000' : '#e5e5e5'}`,
        borderRadius: 10,
        minWidth: 220,
        boxShadow: selected
          ? '0 0 0 1.5px #000'
          : '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        overflow: 'hidden',
      }}
    >
      <NodeResizer
        minWidth={200}
        minHeight={120}
        isVisible={!!selected}
        lineStyle={{ borderColor: '#000', borderWidth: 1 }}
        handleStyle={{ background: '#000', width: 6, height: 6, borderRadius: 3 }}
      />

      {/* Header */}
      <div style={{
        borderBottom: '1px solid #f0f0f0',
        padding: '6px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: '#fafafa',
      }}>
        <span style={{
          fontSize: 10, fontWeight: 600,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: '#a3a3a3', flex: 1,
        }}>
          Image
        </span>
        <button
          className="nodrag"
          onClick={() => setEditingUrl(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d4d4d4', padding: 2, display: 'flex', borderRadius: 4, transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#737373')}
          onMouseLeave={e => (e.currentTarget.style.color = '#d4d4d4')}
        >
          <Edit3 size={11} />
        </button>
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

      {editingUrl && (
        <div style={{ padding: '8px 10px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
          <input
            className="nodrag"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onConfirmUrl(); if (e.key === 'Escape') onCancelUrl(); }}
            placeholder="Paste image URL..."
            autoFocus
            style={{
              width: '100%', background: '#fff',
              border: '1px solid #e5e5e5', borderRadius: 5,
              padding: '5px 8px', color: '#171717',
              fontSize: 12, outline: 'none', marginBottom: 6, boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className="nodrag"
              onClick={onConfirmUrl}
              style={{
                flex: 1, padding: '4px', background: '#000',
                border: '1px solid #000', borderRadius: 5,
                color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 11, fontWeight: 600,
              }}
            >
              <Check size={11} /> Set
            </button>
            <button
              className="nodrag"
              onClick={onCancelUrl}
              style={{
                padding: '4px 8px', background: '#fff',
                border: '1px solid #e5e5e5', borderRadius: 5,
                color: '#737373', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
              }}
            >
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
          style={{ width: '100%', maxHeight: 300, objectFit: 'contain', display: 'block', background: '#f5f5f5' }}
        />
      ) : (
        <div style={{
          width: '100%', height: 120,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 8, color: '#a3a3a3', fontSize: 12, background: '#fafafa',
        }}>
          <Image size={28} color="#d4d4d4" />
          {imgError ? 'Failed to load image' : 'Click edit to set image URL'}
        </div>
      )}

      {data.caption && (
        <div style={{
          padding: '6px 10px', borderTop: '1px solid #f0f0f0',
          color: '#737373', fontSize: 11, fontStyle: 'italic', textAlign: 'center',
        }}>
          {data.caption}
        </div>
      )}

      <Handle type="target" position={Position.Left} style={{ left: -5, top: '50%' }} />
      <Handle type="source" position={Position.Right} style={{ right: -5, top: '50%' }} />
      <Handle type="target" position={Position.Top} id="top" style={{ top: -5, left: '50%' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ bottom: -5, left: '50%' }} />
    </div>
  );
}

export default memo(ImageNodeComponent);
