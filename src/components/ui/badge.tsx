import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium transition-colors',
  {
    defaultVariants: { variant: 'default' },
    variants: {
      variant: {
        default:     'border-primary/30 bg-primary/15 text-primary',
        secondary:   'border-border bg-secondary text-secondary-foreground',
        outline:     'border-border text-foreground',
        destructive: 'border-destructive/30 bg-destructive/15 text-destructive',
        success:     'border-success/30 bg-success/15 text-success',
        warning:     'border-warning/30 bg-warning/15 text-warning',
        info:        'border-info/30 bg-info/15 text-info',
      },
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps): React.ReactElement {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
