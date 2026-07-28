'use client';

import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { WalletStatLabel } from '@/components/shared/wallet-stat-label';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { cn, formatCurrency } from '@/lib/utils';
import type { Wallet } from '@/types/auth';

/**
 * Groups wallet fields so operators can tell apart:
 * 1) money that can be withdrawn now
 * 2) held earnings still waiting on delivery
 * 3) lifetime totals
 */
export function WalletSummary({
  wallet,
  isLoading,
  className,
}: {
  wallet?: Wallet | null;
  isLoading?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    );
  }

  if (!wallet) return null;

  return (
    <div className={cn('space-y-4', className)}>
      <section className="rounded-2xl border border-success/25 bg-success-soft/30 p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-success">
          {t('wallets.groups.withdrawable')}
        </p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          {t('wallets.groups.withdrawableDesc')}
        </p>
        <div className="mt-4">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <WalletStatLabel stat="available" />
          </div>
          <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums text-success">
            {formatCurrency(wallet.available, locale)}
          </p>
        </div>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <MiniStat
            label={<WalletStatLabel stat="balance" />}
            value={formatCurrency(wallet.balance, locale)}
          />
          <MiniStat
            label={<WalletStatLabel stat="pendingWithdrawal" />}
            value={formatCurrency(wallet.pendingWithdrawal, locale)}
          />
        </dl>
      </section>

      <section className="rounded-2xl border border-amber-500/25 bg-amber-50/60 p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
          {t('wallets.groups.held')}
        </p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          {t('wallets.groups.heldDesc')}
        </p>
        <div className="mt-4">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <WalletStatLabel stat="onGoingOrders" />
          </div>
          <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums text-amber-800">
            {formatCurrency(wallet.onGoingOrdersBalance ?? 0, locale)}
          </p>
          <p className="mt-1 text-[11px] text-amber-800/80">
            {t('wallets.groups.heldHint')}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-muted/20 p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t('wallets.groups.lifetime')}
        </p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          {t('wallets.groups.lifetimeDesc')}
        </p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <MiniStat
            label={<WalletStatLabel stat="totalEarned" />}
            value={formatCurrency(wallet.totalEarned, locale)}
          />
          <MiniStat
            label={<WalletStatLabel stat="totalWithdrawn" />}
            value={formatCurrency(wallet.totalWithdrawn, locale)}
          />
        </dl>
      </section>
    </div>
  );
}

function MiniStat({ label, value }: { label: ReactNode; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums">{value}</p>
    </div>
  );
}
