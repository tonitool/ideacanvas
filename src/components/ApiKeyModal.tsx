import { useState } from 'react';
import { Key, Eye, EyeOff, X } from 'lucide-react';
import { useCanvasStore } from '../store/canvasStore';

interface ApiKeyModalProps {
  onClose: () => void;
}

export default function ApiKeyModal({ onClose }: ApiKeyModalProps) {
  const { apiKey, setApiKey } = useCanvasStore();
  const [draft, setDraft] = useState(apiKey);
  const [show, setShow] = useState(false);

  const onSave = () => {
    setApiKey(draft.trim());
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 1000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#1a1a2e', border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: 14, padding: 28, width: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'rgba(124,58,237,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Key size={18} color="#a78bfa" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: 0 }}>Anthropic API Key</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>Required for AI idea generation</p>
          </div>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ position: 'relative', marginBottom: 14 }}>
          <input
            type={show ? 'text' : 'password'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSave()}
            placeholder="sk-ant-..."
            autoFocus
            style={{
              width: '100%', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8,
              padding: '10px 40px 10px 12px', color: 'rgba(255,255,255,0.88)',
              fontSize: 13, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box',
            }}
          />
          <button onClick={() => setShow(!show)}
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)', padding: 2, display: 'flex',
            }}>
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 20, lineHeight: 1.5 }}>
          Your key is stored only in your browser's localStorage and never sent anywhere except Anthropic's API.
        </p>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onSave}
            disabled={!draft.trim()}
            style={{
              flex: 1, padding: '10px',
              background: draft.trim() ? 'rgba(124,58,237,0.8)' : 'rgba(124,58,237,0.2)',
              border: '1px solid rgba(124,58,237,0.5)', borderRadius: 8,
              color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: draft.trim() ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s ease',
            }}
          >
            Save Key
          </button>
          {apiKey && (
            <button
              onClick={() => { setApiKey(''); setDraft(''); }}
              style={{
                padding: '10px 14px', background: 'rgba(220,38,38,0.1)',
                border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8,
                color: '#f87171', fontSize: 13, cursor: 'pointer',
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
