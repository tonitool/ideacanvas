import type * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<React.ComponentProps<'input'>, 'size'> {
  size?: 'sm' | 'default' | 'lg';
}

export function Input({
  className,
  size = 'default',
  type,
  ...props
}: InputProps): React.ReactElement {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'w-full rounded-lg border border-border bg-input px-3 text-foreground outline-none transition-colors',
        'placeholder:text-muted-foreground/60',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50',
        'invalid:border-destructive/50 invalid:focus-visible:ring-destructive/30',
        {
          sm:      'h-7 text-xs',
          default: 'h-9 text-sm',
          lg:      'h-10 text-sm',
        }[size],
        type === 'password' && 'font-mono tracking-widest',
        className
      )}
      {...props}
    />
  );
}
