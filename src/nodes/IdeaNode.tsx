import { memo, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import type { IdeaNode } from '../types';
import { useCanvasStore } from '../store/canvasStore';

function IdeaNodeComponent({ id, data, selected }: NodeProps<IdeaNode>) {
  const { updateNodeData, removeNode } = useCanvasStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }
  }, []);

  useEffect(() => { autoResize(); }, [data.text, autoResize]);

  const onTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, { text: e.target.value });
      autoResize();
    },
    [id, updateNodeData, autoResize]
  );

  return (
    <div
      className="node-enter"
      style={{
        background: '#fff',
        border: `1px solid ${selected ? '#000' : '#e5e5e5'}`,
        borderRadius: 10,
        minWidth: 200,
        minHeight: 80,
        boxShadow: selected
          ? '0 0 0 1.5px #000'
          : '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
      }}
    >
      <NodeResizer
        minWidth={180}
        minHeight={70}
        isVisible={!!selected}
        lineStyle={{ borderColor: '#000', borderWidth: 1 }}
        handleStyle={{ background: '#000', width: 6, height: 6, borderRadius: 3 }}
      />

      {/* Header */}
      <div style={{
        borderBottom: '1px solid #f0f0f0',
        borderRadius: '9px 9px 0 0',
        padding: '6px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: '#fafafa',
      }}>
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#a3a3a3',
          flex: 1,
        }}>
          Idea
        </span>
        <button
          className="nodrag"
          onClick={() => removeNode(id)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#d4d4d4', padding: 2, display: 'flex',
            borderRadius: 4, transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#737373')}
          onMouseLeave={e => (e.currentTarget.style.color = '#d4d4d4')}
        >
          <Trash2 size={11} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '10px 12px' }}>
        <textarea
          ref={textareaRef}
          className="node-textarea nodrag"
          value={data.text}
          onChange={onTextChange}
          placeholder="Type your idea..."
          rows={3}
          style={{ color: '#171717', fontSize: 13, lineHeight: 1.6, minHeight: 48 }}
        />
      </div>

      <Handle type="source" position={Position.Right} style={{ right: -5, top: '50%' }} />
      <Handle type="target" position={Position.Left}  style={{ left: -5,  top: '50%' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ bottom: -5, left: '50%' }} />
      <Handle type="target" position={Position.Top}    id="top"    style={{ top: -5,    left: '50%' }} />
    </div>
  );
}

export default memo(IdeaNodeComponent);
