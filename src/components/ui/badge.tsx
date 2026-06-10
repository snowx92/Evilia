import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive-soft text-destructive ring-1 ring-inset ring-destructive/20',
        outline: 'border border-border text-foreground',
        success: 'bg-success-soft text-success ring-1 ring-inset ring-success/20',
        warning: 'bg-warning-soft text-warning-foreground ring-1 ring-inset ring-warning/30',
        muted: 'bg-muted text-muted-foreground',
        brand: 'bg-primary-soft text-primary ring-1 ring-inset ring-primary/15',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
