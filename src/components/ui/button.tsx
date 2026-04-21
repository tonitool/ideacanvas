"use client";

import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

export const buttonVariants = cva(
  'relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border font-medium outline-none transition-all before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-loading:select-none data-loading:text-transparent [&_svg:not([class*="opacity-"])]:opacity-80 [&_svg:not([class*="size-"])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    defaultVariants: { size: 'default', variant: 'default' },
    variants: {
      size: {
        default: 'h-9 px-3 text-sm',
        sm:      'h-7 px-2.5 text-xs gap-1.5',
        lg:      'h-10 px-4 text-sm',
        xl:      'h-11 px-4 text-base',
        xs:      'h-6 px-2 text-xs gap-1 rounded-md',
        icon:    'size-9',
        'icon-sm': 'size-7 rounded-md',
        'icon-lg': 'size-10',
      },
      variant: {
        default:
          'border-primary bg-primary text-primary-foreground shadow-xs shadow-primary/20 hover:bg-primary/90 active:bg-primary/80',
        secondary:
          'border-border bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground',
        outline:
          'border-border bg-card text-foreground shadow-xs/5 hover:bg-accent hover:text-accent-foreground',
        ghost:
          'border-transparent text-foreground hover:bg-accent hover:text-accent-foreground',
        destructive:
          'border-destructive bg-destructive text-destructive-foreground shadow-xs shadow-destructive/20 hover:bg-destructive/90',
        'destructive-outline':
          'border-border bg-card text-destructive hover:border-destructive/40 hover:bg-destructive/8',
        link:
          'border-transparent text-foreground underline-offset-4 hover:underline',
      },
    },
  }
);

export interface ButtonProps extends useRender.ComponentProps<'button'> {
  variant?: VariantProps<typeof buttonVariants>['variant'];
  size?: VariantProps<typeof buttonVariants>['size'];
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  render,
  children,
  loading = false,
  disabled: disabledProp,
  ...props
}: ButtonProps): React.ReactElement {
  const isDisabled = Boolean(loading || disabledProp);
  const typeValue = render
    ? undefined
    : ('button' as React.ButtonHTMLAttributes<HTMLButtonElement>['type']);

  const defaultProps = {
    children: (
      <>
        {children}
        {loading && (
          <Spinner
            className="pointer-events-none absolute"
            data-slot="button-loading-indicator"
          />
        )}
      </>
    ),
    className: cn(buttonVariants({ className, size, variant })),
    'aria-disabled': loading || undefined,
    'data-loading': loading ? '' : undefined,
    'data-slot': 'button',
    disabled: isDisabled,
    type: typeValue,
  };

  return useRender({
    defaultTagName: 'button',
    props: mergeProps<'button'>(defaultProps, props),
    render,
  });
}
