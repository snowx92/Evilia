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
import { formatDate } from '@/lib/utils';

export type AnalyticsRangeMode = 'daily' | 'monthly' | 'custom';

export type AnalyticsRange = {
  mode: AnalyticsRangeMode;
  from: Date;
  to: Date;
};

const PRESETS: { key: 'last7' | 'last30' | 'thisMonth' | 'last3m'; days?: number }[] = [
  { key: 'last7', days: 7 },
  { key: 'last30', days: 30 },
  { key: 'thisMonth' },
  { key: 'last3m', days: 90 },
];

export function defaultRange(mode: AnalyticsRangeMode = 'daily'): AnalyticsRange {
  const to = new Date();
  if (mode === 'monthly') {
    const from = new Date(to);
    from.setMonth(from.getMonth() - 11);
    from.setDate(1);
    return { mode, from, to };
  }
  const from = new Date(to);
  from.setDate(from.getDate() - 29);
  return { mode, from, to };
}

function presetRange(key: (typeof PRESETS)[number]['key']): AnalyticsRange {
  const to = new Date();
  const from = new Date(to);
  if (key === 'last7') from.setDate(from.getDate() - 6);
  else if (key === 'last30') from.setDate(from.getDate() - 29);
  else if (key === 'last3m') from.setDate(from.getDate() - 89);
  else if (key === 'thisMonth') from.setDate(1);
  return { mode: 'custom', from, to };
}

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

  const applyCustom = () => {
    const from = new Date(draftFrom);
    const to = new Date(draftTo);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) return;
    onChange({ mode: 'custom', from, to });
    setOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Date-range trigger + custom popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-10 gap-2 font-normal">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span>
              {formatDate(value.from.toISOString(), locale)} –{' '}
              {formatDate(value.to.toISOString(), locale)}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 space-y-4 p-4" align="end">
          {/* Quick presets */}
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p.key}
                variant="ghost"
                size="sm"
                onClick={() => onChange(presetRange(p.key))}
                className="justify-start text-[11px]"
              >
                {t(`analytics.preset.${p.key}`)}
              </Button>
            ))}
          </div>

          {/* Custom range */}
          <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-3">
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
