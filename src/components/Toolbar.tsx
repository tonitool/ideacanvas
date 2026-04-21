import { useState } from 'react';
import { Lightbulb, Sparkles, Image as ImageIcon, Trash2, Key, HelpCircle, Zap } from 'lucide-react';
import type { Node } from '@xyflow/react';
import { useCanvasStore } from '../store/canvasStore';
import type { IdeaNodeData, PromptNodeData, ImageNodeData, CustomNodeData } from '../types';
import { IDEA_COLORS } from '../types';

interface ToolbarProps {
  onOpenApiKey: () => void;
  onAddNode: (node: Node<CustomNodeData>) => void;
}

const TOOL_BUTTONS = [
  { type: 'idea', icon: Lightbulb, label: 'Idea Node', color: '#7c3aed', shortcut: 'I' },
  { type: 'prompt', icon: Sparkles, label: 'AI Prompt', color: '#2563eb', shortcut: 'P' },
  { type: 'image', icon: ImageIcon, label: 'Image Node', color: '#0891b2', shortcut: 'G' },
];

let nodeCounter = 0;
function genId(prefix: string) {
  return `${prefix}-${Date.now()}-${nodeCounter++}`;
}

export default function Toolbar({ onOpenApiKey, onAddNode }: ToolbarProps) {
  const { clearCanvas, apiKey, nodes } = useCanvasStore();
  const [showHelp, setShowHelp] = useState(false);

  const createNode = (type: string) => {
    const cx = window.innerWidth / 2 - 100 + Math.random() * 60 - 30;
    const cy = window.innerHeight / 2 - 80 + Math.random() * 60 - 30;

    if (type === 'idea') {
      onAddNode({
        id: genId('idea'),
        type: 'idea',
        position: { x: cx, y: cy },
        data: { kind: 'idea', text: '', color: IDEA_COLORS[0] } as IdeaNodeData,
      });
    } else if (type === 'prompt') {
      onAddNode({
        id: genId('prompt'),
        type: 'prompt',
        position: { x: cx, y: cy },
        data: { kind: 'prompt', prompt: '', status: 'idle' } as PromptNodeData,
      });
    } else if (type === 'image') {
      onAddNode({
        id: genId('image'),
        type: 'image',
        position: { x: cx, y: cy },
        data: { kind: 'image', url: '', caption: '' } as ImageNodeData,
      });
    }
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: 16,
          transform: 'translateY(-50%)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          background: 'rgba(26,26,46,0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14,
          padding: 8,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <div
          style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.8), rgba(37,99,235,0.8))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4,
          }}
        >
          <Zap size={18} color="#fff" />
        </div>

        <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.06)', margin: '2px 0' }} />

        {TOOL_BUTTONS.map((btn) => (
          <ToolButton
            key={btn.type}
            icon={btn.icon}
            label={btn.label}
            color={btn.color}
            shortcut={btn.shortcut}
            onClick={() => createNode(btn.type)}
          />
        ))}

        <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.06)', margin: '2px 0' }} />

        <ToolButton
          icon={Key}
          label="API Key"
          color={apiKey ? '#059669' : '#d97706'}
          onClick={onOpenApiKey}
          dot={!apiKey}
        />
        <ToolButton
          icon={HelpCircle}
          label="Help"
          color="#6b7280"
          onClick={() => setShowHelp(!showHelp)}
        />

        <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.06)', margin: '2px 0' }} />

        <ToolButton
          icon={Trash2}
          label="Clear canvas"
          color="#dc2626"
          onClick={() => {
            if (nodes.length === 0 || confirm('Clear all nodes and connections?')) {
              clearCanvas();
            }
          }}
        />
      </div>

      {showHelp && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: 72,
            transform: 'translateY(-50%)',
            zIndex: 99,
            background: 'rgba(26,26,46,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: 16,
            width: 220,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <h4 style={{ color: '#fff', fontSize: 12, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Keyboard Shortcuts
          </h4>
          {[
            ['Double-click canvas', 'New Idea node'],
            ['I', 'Add Idea node'],
            ['P', 'Add Prompt node'],
            ['G', 'Add Image node'],
            ['Delete / Backspace', 'Remove selected'],
            ['Shift + drag', 'Multi-select'],
            ['Scroll', 'Zoom in/out'],
            ['Middle-drag', 'Pan canvas'],
          ].map(([key, action]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
              <kbd style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 4, padding: '2px 6px', fontSize: 10,
                color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace',
              }}>
                {key}
              </kbd>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{action}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, lineHeight: 1.5 }}>
              Connect nodes by dragging from a handle. Use AI Prompt nodes to generate idea expansions.
            </p>
          </div>
        </div>
      )}

      {!apiKey && (
        <div
          onClick={onOpenApiKey}
          style={{
            position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            zIndex: 100, background: 'rgba(217,119,6,0.15)',
            border: '1px solid rgba(217,119,6,0.4)', borderRadius: 20,
            padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6,
            cursor: 'pointer', color: '#fbbf24', fontSize: 12, fontWeight: 500,
            backdropFilter: 'blur(8px)',
          }}
        >
          <Key size={12} />
          Set your Anthropic API key to enable AI features
        </div>
      )}
    </>
  );
}

interface ToolButtonProps {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  color: string;
  onClick: () => void;
  shortcut?: string;
  dot?: boolean;
}

function ToolButton({ icon: Icon, label, color, onClick, shortcut, dot }: ToolButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={label}
        style={{
          width: 36, height: 36, borderRadius: 8,
          background: hovered ? `${color}22` : 'transparent',
          border: `1px solid ${hovered ? `${color}55` : 'transparent'}`,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s ease', position: 'relative',
        }}
      >
        <Icon size={16} color={hovered ? color : 'rgba(255,255,255,0.5)'} />
        {dot && (
          <div style={{
            position: 'absolute', top: 5, right: 5,
            width: 6, height: 6, borderRadius: '50%', background: '#f59e0b',
          }} />
        )}
      </button>

      {hovered && (
        <div style={{
          position: 'absolute', left: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)',
          background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
          padding: '4px 10px', whiteSpace: 'nowrap', fontSize: 12, color: 'rgba(255,255,255,0.85)',
          pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)', zIndex: 200,
        }}>
          {label}
          {shortcut && (
            <kbd style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 3, padding: '1px 5px', fontSize: 10, fontFamily: 'monospace',
              color: 'rgba(255,255,255,0.4)',
            }}>
              {shortcut}
            </kbd>
          )}
        </div>
      )}
    </div>
  );
}
