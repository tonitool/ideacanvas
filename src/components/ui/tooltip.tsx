"use client";

import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import type * as React from 'react';
import { cn } from '@/lib/utils';

function TooltipProvider({ children, ...props }: TooltipPrimitive.Provider.Props) {
  return (
    <TooltipPrimitive.Provider delay={400} closeDelay={100} {...props}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

function Tooltip({ children, ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root {...props}>{children}</TooltipPrimitive.Root>;
}

const TooltipTrigger = TooltipPrimitive.Trigger;

function TooltipContent({
  className,
  children,
  side = 'right',
  sideOffset = 8,
  ...props
}: TooltipPrimitive.Positioner.Props & { className?: string; children?: React.ReactNode }): React.ReactElement {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner side={side} sideOffset={sideOffset} {...props}>
        <TooltipPrimitive.Popup
          className={cn(
            'z-50 max-w-xs rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-lg',
            'origin-[var(--transform-origin)] transition-[opacity,scale] duration-100',
            'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
            'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
            className
          )}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
