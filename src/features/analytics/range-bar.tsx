'use client';

import { useState } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { cn, formatDate } from '@/lib/utils';
import type { AnalyticsGranularity } from '@/types/admin/analytics';

export type AnalyticsRangeMode = 'daily' | 'monthly' | 'custom';

export type AnalyticsRange = {
  mode: AnalyticsRangeMode;
  from: Date;
  to: Date;
  granularity: AnalyticsGranularity;
};

export function defaultRange(mode: AnalyticsRangeMode = 'daily'): AnalyticsRange {
  const to = new Date();
  if (mode === 'monthly') {
    const from = new Date(to);
    from.setMonth(from.getMonth() - 11);
    from.setDate(1);
    return { mode, from, to, granularity: 'month' };
  }
  // daily: last 30 days
  const from = new Date(to);
  from.setDate(from.getDate() - 29);
  return { mode, from, to, granularity: 'day' };
}

const MODES: AnalyticsRangeMode[] = ['daily', 'monthly', 'custom'];

export function RangeBar({
  value,
  onChange,
}: {
  value: AnalyticsRange;
  onChange: (next: AnalyticsRange) => void;
}) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(format(value.from, 'yyyy-MM-dd'));
  const [draftTo, setDraftTo] = useState(format(value.to, 'yyyy-MM-dd'));

  const setMode = (mode: AnalyticsRangeMode) => {
    if (mode === 'custom') {
      setOpen(true);
      return;
    }
    onChange(defaultRange(mode));
  };

  const applyCustom = () => {
    const from = new Date(draftFrom);
    const to = new Date(draftTo);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) return;
    // Auto granularity: > 90 days → monthly buckets, else daily
    const diffDays = (to.getTime() - from.getTime()) / 86400000;
    const granularity: AnalyticsGranularity = diffDays > 90 ? 'month' : 'day';
    onChange({ mode: 'custom', from, to, granularity });
    setOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Segmented mode toggle */}
      <div className="inline-flex h-10 items-center rounded-xl border border-border/70 bg-surface p-1 shadow-sm">
        {MODES.map((m) => {
          const active = value.mode === m;
          const label =
            m === 'daily' ? t('analytics.daily') : m === 'monthly' ? t('analytics.monthly') : t('common.from') + ' – ' + t('common.to');
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                'relative h-8 rounded-lg px-3 text-xs font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Active range display + custom popover trigger */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-10 gap-2 font-normal">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span>
              {formatDate(value.from.toISOString(), locale)} – {formatDate(value.to.toISOString(), locale)}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 space-y-3 p-4" align="end">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{t('common.from')}</Label>
              <Input
                type="date"
                dir="ltr"
                value={draftFrom}
                onChange={(e) => setDraftFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('common.to')}</Label>
              <Input
                type="date"
                dir="ltr"
                value={draftTo}
                onChange={(e) => setDraftTo(e.target.value)}
              />
            </div>
          </div>
          <Button variant="default" className="w-full" onClick={applyCustom}>
            {t('common.confirm')}
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
