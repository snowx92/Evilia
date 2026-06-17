'use client';

import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

export type WalletStatKey =
  | 'balance'
  | 'available'
  | 'pendingWithdrawal'
  | 'onGoingOrders'
  | 'totalEarned'
  | 'totalWithdrawn';

/**
 * Renders a wallet-stat label (e.g. "Available") followed by a small Info
 * icon whose tooltip explains what the stat means. Lets us keep every wallet
 * tile / row visually compact while giving non-technical operators a one-tap
 * explanation of each figure.
 */
export function WalletStatLabel({
  stat,
  className,
}: {
  stat: WalletStatKey;
  className?: string;
}) {
  const { t } = useTranslation();
  const label = t(`wallets.${stat}`);
  const description = t(`wallets.explain.${stat}`);

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span>{label}</span>
      <TooltipProvider delayDuration={150}>
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
      </TooltipProvider>
    </span>
  );
}
