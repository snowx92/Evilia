'use client';

import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { fadeUp } from '@/lib/motion';

type Props = {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: number; label?: string };
  isLoading?: boolean;
  accent?: 'indigo' | 'emerald' | 'amber' | 'rose';
  className?: string;
};

const ACCENT: Record<NonNullable<Props['accent']>, string> = {
  indigo: 'from-indigo-500/15 to-indigo-500/0 text-primary',
  emerald: 'from-emerald-500/15 to-emerald-500/0 text-success',
  amber: 'from-amber-500/15 to-amber-500/0 text-warning-foreground',
  rose: 'from-rose-500/15 to-rose-500/0 text-destructive',
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  isLoading,
  accent = 'indigo',
  className,
}: Props) {
  const positive = (trend?.value ?? 0) >= 0;
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover',
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -end-12 -top-12 h-32 w-32 rounded-full bg-gradient-radial opacity-80 blur-2xl',
          'bg-gradient-to-br',
          ACCENT[accent],
        )}
      />
      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          {isLoading ? (
            <Skeleton className="mt-1 h-8 w-28" />
          ) : (
            <p className="text-3xl font-semibold tracking-tight">{value}</p>
          )}
        </div>
        <div
          className={cn(
            'grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary shadow-sm',
            accent === 'emerald' && 'bg-success-soft text-success',
            accent === 'amber' && 'bg-warning-soft text-warning-foreground',
            accent === 'rose' && 'bg-destructive-soft text-destructive',
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && !isLoading && (
        <div
          className={cn(
            'relative mt-4 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
            positive
              ? 'bg-success-soft text-success'
              : 'bg-destructive-soft text-destructive',
          )}
        >
          {positive ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {Math.abs(trend.value).toFixed(1)}%
          {trend.label && <span className="text-muted-foreground">· {trend.label}</span>}
        </div>
      )}
    </motion.div>
  );
}
