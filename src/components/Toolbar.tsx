import { useState } from 'react';
import { Lightbulb, Sparkles, Image as ImageIcon, Trash2, Key, HelpCircle, Zap } from 'lucide-react';
import type { Node } from '@xyflow/react';
import { useCanvasStore } from '@/store/canvasStore';
import type { IdeaNodeData, PromptNodeData, ImageNodeData, CustomNodeData } from '@/types';
import { IDEA_COLORS } from '@/types';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  onOpenApiKey: () => void;
  onAddNode: (node: Node<CustomNodeData>) => void;
}

let nodeCounter = 0;
function genId(prefix: string) {
  return `${prefix}-${Date.now()}-${nodeCounter++}`;
}

export default function Toolbar({ onOpenApiKey, onAddNode }: ToolbarProps) {
  const { clearCanvas, apiKey, nodes } = useCanvasStore();
  const [showHelp, setShowHelp] = useState(false);

  const createNode = (type: 'idea' | 'prompt' | 'image') => {
    const cx = window.innerWidth / 2 - 100 + Math.random() * 60 - 30;
    const cy = window.innerHeight / 2 - 80 + Math.random() * 60 - 30;

    if (type === 'idea') {
      onAddNode({ id: genId('idea'), type: 'idea', position: { x: cx, y: cy }, data: { kind: 'idea', text: '', color: IDEA_COLORS[0] } as IdeaNodeData });
    } else if (type === 'prompt') {
      onAddNode({ id: genId('prompt'), type: 'prompt', position: { x: cx, y: cy }, data: { kind: 'prompt', prompt: '', status: 'idle' } as PromptNodeData });
    } else if (type === 'image') {
      onAddNode({ id: genId('image'), type: 'image', position: { x: cx, y: cy }, data: { kind: 'image', url: '', caption: '' } as ImageNodeData });
    }
  };

  return (
    <TooltipProvider>
      {/* Floating sidebar */}
      <div className="fixed left-3 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-1 rounded-xl border border-border bg-card p-1.5 shadow-xl backdrop-blur-sm">
        {/* Logo */}
        <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-info shadow-inner">
          <Zap size={16} className="text-white" />
        </div>

        <div className="my-0.5 h-px w-full bg-border" />

        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" size="icon" onClick={() => createNode('idea')} />}>
            <Lightbulb size={16} />
          </TooltipTrigger>
          <TooltipContent>Idea node <kbd className="ml-1 rounded border border-border bg-muted px-1 font-mono text-[10px] text-muted-foreground">I</kbd></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" size="icon" onClick={() => createNode('prompt')} />}>
            <Sparkles size={16} />
          </TooltipTrigger>
          <TooltipContent>AI Prompt <kbd className="ml-1 rounded border border-border bg-muted px-1 font-mono text-[10px] text-muted-foreground">P</kbd></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" size="icon" onClick={() => createNode('image')} />}>
            <ImageIcon size={16} />
          </TooltipTrigger>
          <TooltipContent>Image node</TooltipContent>
        </Tooltip>

        <div className="my-0.5 h-px w-full bg-border" />

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenApiKey}
                className={cn('relative', apiKey ? 'text-success hover:text-success' : 'text-warning hover:text-warning')}
              />
            }
          >
            {!apiKey && (
              <span className="absolute right-1 top-1 size-1.5 rounded-full bg-warning" />
            )}
            <Key size={16} />
          </TooltipTrigger>
          <TooltipContent>{apiKey ? 'OpenRouter key set' : 'Set OpenRouter API key'}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHelp(!showHelp)}
                className={cn(showHelp && 'bg-accent text-accent-foreground')}
              />
            }
          >
            <HelpCircle size={16} />
          </TooltipTrigger>
          <TooltipContent>Help & shortcuts</TooltipContent>
        </Tooltip>

        <div className="my-0.5 h-px w-full bg-border" />

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { if (nodes.length === 0 || confirm('Clear all nodes and connections?')) clearCanvas(); }}
                className="text-destructive hover:text-destructive"
              />
            }
          >
            <Trash2 size={16} />
          </TooltipTrigger>
          <TooltipContent>Clear canvas</TooltipContent>
        </Tooltip>
      </div>

      {/* Help panel */}
      {showHelp && (
        <div className="fixed left-16 top-1/2 z-[99] -translate-y-1/2 w-56 rounded-xl border border-border bg-card p-4 shadow-xl backdrop-blur-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shortcuts</p>
          <div className="space-y-2">
            {([
              ['I', 'Add Idea node'],
              ['P', 'Add Prompt node'],
              ['Dbl-click', 'New Idea node'],
              ['Delete', 'Remove selected'],
              ['Shift+drag', 'Multi-select'],
              ['Scroll', 'Zoom in/out'],
              ['Mid-drag', 'Pan canvas'],
            ] as [string, string][]).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{key}</kbd>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground">
            Drag from a handle (●) to connect nodes. Use AI Prompt nodes to expand ideas.
          </p>
        </div>
      )}

      {/* No API key nudge */}
      {!apiKey && (
        <button
          onClick={onOpenApiKey}
          className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 flex items-center gap-2 rounded-full border border-warning/40 bg-warning/10 px-4 py-1.5 text-xs font-medium text-warning backdrop-blur-sm transition-colors hover:bg-warning/15"
        >
          <Key size={12} />
          Set your Anthropic API key to enable AI features
        </button>
      )}

      {/* Node count badge — top center */}
      <div className="pointer-events-none fixed top-3 left-1/2 z-[100] -translate-x-1/2 flex items-center gap-2 rounded-full border border-border bg-card/85 px-4 py-1.5 shadow-lg backdrop-blur-sm">
        <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-sm font-bold text-transparent">
          IdeaCanvas
        </span>
        <span className="text-border">·</span>
        <span className="text-xs text-muted-foreground">{nodes.length} node{nodes.length !== 1 ? 's' : ''}</span>
        {apiKey && (
          <>
            <span className="text-border">·</span>
            <Badge variant="success" className="pointer-events-none">
              <span className="size-1.5 rounded-full bg-success" />
              AI ready
            </Badge>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
