import { useState } from 'react';
import { Key, Eye, EyeOff, X } from 'lucide-react';
import { useCanvasStore } from '@/store/canvasStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-[420px] rounded-2xl border border-border bg-card p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
            <Key size={18} className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">OpenRouter API Key</h3>
            <p className="text-xs text-muted-foreground">Required for AI idea generation</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X size={15} />
          </Button>
        </div>

        {/* Input */}
        <div className="relative mb-3">
          <Input
            type={show ? 'text' : 'password'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSave()}
            placeholder="sk-or-v1-..."
            autoFocus
            className="pr-9 font-mono tracking-widest"
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShow(!show)}
            className="absolute right-1 top-1/2 -translate-y-1/2"
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </Button>
        </div>

        <p className="mb-5 text-[11px] leading-relaxed text-muted-foreground">
          Get your key at{' '}
          <span className="text-primary">openrouter.ai/keys</span>.
          Stored only in your browser's localStorage — never sent anywhere except OpenRouter's API.
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="default"
            className="flex-1"
            disabled={!draft.trim()}
            onClick={onSave}
          >
            Save Key
          </Button>
          {apiKey && (
            <Button
              variant="destructive-outline"
              onClick={() => { setApiKey(''); setDraft(''); }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
