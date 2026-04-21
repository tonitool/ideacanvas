import { memo, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Lightbulb, Trash2, ArrowRight } from 'lucide-react';
import type { GeneratedNode } from '../types';
import { GENERATED_COLORS } from '../types';
import { useCanvasStore } from '../store/canvasStore';

const PALETTES = [
  { bg: 'rgba(79,70,229,0.13)', border: 'rgba(79,70,229,0.45)', accent: '#4f46e5', light: '#818cf8' },
  { bg: 'rgba(2,132,199,0.13)', border: 'rgba(2,132,199,0.45)', accent: '#0284c7', light: '#38bdf8' },
  { bg: 'rgba(13,148,136,0.13)', border: 'rgba(13,148,136,0.45)', accent: '#0d9488', light: '#2dd4bf' },
  { bg: 'rgba(202,138,4,0.13)', border: 'rgba(202,138,4,0.45)', accent: '#ca8a04', light: '#fbbf24' },
  { bg: 'rgba(147,51,234,0.13)', border: 'rgba(147,51,234,0.45)', accent: '#9333ea', light: '#c084fc' },
];

function GeneratedNodeComponent({ id, data, selected }: NodeProps<GeneratedNode>) {
  const { updateNodeData, removeNode } = useCanvasStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const colorIdx = GENERATED_COLORS.indexOf(data.color);
  const palette = PALETTES[colorIdx >= 0 ? colorIdx % PALETTES.length : data.index % PALETTES.length];

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

  const onExpand = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent('expand-generated-node', { detail: { id, text: data.text } })
    );
  }, [id, data.text]);

  return (
    <div
      className="node-enter"
      style={{
        background: palette.bg,
        border: `1.5px solid ${selected ? palette.accent : palette.border}`,
        borderRadius: 12,
        minWidth: 200,
        backdropFilter: 'blur(8px)',
        boxShadow: selected
          ? `0 0 0 2px ${palette.accent}, 0 8px 32px rgba(0,0,0,0.4)`
          : '0 4px 20px rgba(0,0,0,0.3)',
        transition: 'box-shadow 0.2s ease',
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
          gap: 5,
        }}
      >
        <Lightbulb size={11} color={palette.light} />
        <span style={{ color: palette.light, fontSize: 10, fontWeight: 600, flex: 1 }}>IDEA {data.index + 1}</span>
        <button className="nodrag" onClick={onExpand} title="Expand with AI"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 2, display: 'flex' }}>
          <ArrowRight size={11} />
        </button>
        <button className="nodrag" onClick={() => removeNode(id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 2, display: 'flex' }}>
          <Trash2 size={11} />
        </button>
      </div>

      <div style={{ padding: '8px 10px 10px' }}>
        <textarea
          ref={textareaRef}
          className="node-textarea nodrag"
          value={data.text}
          onChange={onTextChange}
          placeholder="Generated idea..."
          rows={2}
          style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, lineHeight: 1.6 }}
        />
      </div>

      <Handle type="target" position={Position.Left} style={{ left: -6, top: '50%' }} />
      <Handle type="source" position={Position.Right} style={{ right: -6, top: '50%' }} />
      <Handle type="target" position={Position.Top} id="top" style={{ top: -6, left: '50%' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ bottom: -6, left: '50%' }} />
    </div>
  );
}

export default memo(GeneratedNodeComponent);
