'use client';

import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

/**
 * Label + info icon that shows a short explanation on hover/focus.
 * Prefer this for any dashboard / KPI figure so operators know what
 * the number means without leaving the page.
 *
 * App root already provides TooltipProvider — no nested provider needed.
 */
export function ExplainLabel({
  labelKey,
  explainKey,
  className,
}: {
  labelKey: string;
  explainKey: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const label = t(labelKey);
  const description = t(explainKey);

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span>{label}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={description}
            className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full text-muted-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Info className="h-3 w-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[260px] text-[11px] leading-snug">
          {description}
        </TooltipContent>
      </Tooltip>
    </span>
  );
}
