import { memo, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Trash2, Palette } from 'lucide-react';
import type { IdeaNode } from '../types';
import { IDEA_COLORS } from '../types';
import { useCanvasStore } from '../store/canvasStore';

const COLOR_OPTIONS = [
  { bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.5)', accent: '#7c3aed' },
  { bg: 'rgba(37,99,235,0.15)', border: 'rgba(37,99,235,0.5)', accent: '#2563eb' },
  { bg: 'rgba(5,150,105,0.15)', border: 'rgba(5,150,105,0.5)', accent: '#059669' },
  { bg: 'rgba(217,119,6,0.15)', border: 'rgba(217,119,6,0.5)', accent: '#d97706' },
  { bg: 'rgba(220,38,38,0.15)', border: 'rgba(220,38,38,0.5)', accent: '#dc2626' },
  { bg: 'rgba(219,39,119,0.15)', border: 'rgba(219,39,119,0.5)', accent: '#db2777' },
];

function IdeaNodeComponent({ id, data, selected }: NodeProps<IdeaNode>) {
  const { updateNodeData, removeNode } = useCanvasStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const colorIdx = IDEA_COLORS.indexOf(data.color);
  const palette = COLOR_OPTIONS[colorIdx >= 0 ? colorIdx % COLOR_OPTIONS.length : 0];

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  }, []);

  useEffect(() => { autoResize(); }, [data.text, autoResize]);

  const onTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, { text: e.target.value });
      autoResize();
    },
    [id, updateNodeData, autoResize]
  );

  const cycleColor = useCallback(() => {
    const currentIdx = IDEA_COLORS.indexOf(data.color);
    const nextIdx = (currentIdx + 1) % COLOR_OPTIONS.length;
    updateNodeData(id, { color: IDEA_COLORS[nextIdx] });
  }, [id, data.color, updateNodeData]);

  return (
    <div
      className="node-enter"
      style={{
        background: palette.bg,
        border: `1.5px solid ${selected ? palette.accent : palette.border}`,
        borderRadius: 12,
        minWidth: 200,
        minHeight: 80,
        backdropFilter: 'blur(8px)',
        boxShadow: selected
          ? `0 0 0 2px ${palette.accent}, 0 8px 32px rgba(0,0,0,0.4)`
          : '0 4px 20px rgba(0,0,0,0.3)',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
      }}
    >
      <NodeResizer
        minWidth={180}
        minHeight={70}
        isVisible={!!selected}
        lineStyle={{ borderColor: palette.accent, borderWidth: 1 }}
        handleStyle={{ background: palette.accent, width: 8, height: 8, borderRadius: 4 }}
      />

      <div
        style={{
          background: `${palette.accent}22`,
          borderBottom: `1px solid ${palette.border}`,
          borderRadius: '10px 10px 0 0',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: palette.accent, flexShrink: 0 }} />
        <span style={{ color: palette.accent, fontSize: 11, fontWeight: 600, flex: 1, opacity: 0.9 }}>IDEA</span>
        <button className="nodrag" onClick={cycleColor}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 2, display: 'flex' }}>
          <Palette size={12} />
        </button>
        <button className="nodrag" onClick={() => removeNode(id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 2, display: 'flex' }}>
          <Trash2 size={12} />
        </button>
      </div>

      <div style={{ padding: '10px 12px' }}>
        <textarea
          ref={textareaRef}
          className="node-textarea nodrag"
          value={data.text}
          onChange={onTextChange}
          placeholder="Type your idea..."
          rows={3}
          style={{ color: 'rgba(255,255,255,0.88)', fontSize: 13, lineHeight: 1.6, minHeight: 48 }}
        />
      </div>

      <Handle type="source" position={Position.Right} style={{ right: -6, top: '50%' }} />
      <Handle type="target" position={Position.Left} style={{ left: -6, top: '50%' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ bottom: -6, left: '50%' }} />
      <Handle type="target" position={Position.Top} id="top" style={{ top: -6, left: '50%' }} />
    </div>
  );
}

export default memo(IdeaNodeComponent);
