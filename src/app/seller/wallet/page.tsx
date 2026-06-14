'use client';

import { useMemo, useState } from 'react';
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, Download } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { useDocumentTitle } from '@/hooks/use-document-title';
import {
  useSellerWalletQuery,
  useSellerWalletTransactionsQuery,
} from '@/hooks/queries/use-seller';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { cn, formatCurrency } from '@/lib/utils';
import { downloadCsv, type CsvColumn } from '@/lib/csv-export';
import { DEFAULT_PAGE_SIZE } from '@/constants/admin';
import type { SellerWalletTransaction } from '@/types/seller';

export default function SellerWalletPage() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  useDocumentTitle(t('wallets.title'));
  const wallet = useSellerWalletQuery();
  const [txPage, setTxPage] = useState(1);
  const txs = useSellerWalletTransactionsQuery({ page: txPage, limit: DEFAULT_PAGE_SIZE });
  const w = wallet.data;
  const items = txs.data?.items ?? [];

  // Page-level type breakdown.
  const byType = useMemo(() => {
    const sums: Record<string, { count: number; amount: number }> = {};
    items.forEach((tx) => {
      const key = tx.type;
      sums[key] = sums[key] ?? { count: 0, amount: 0 };
      sums[key].count += 1;
      sums[key].amount += tx.amount;
    });
    return Object.entries(sums).sort((a, b) => b[1].amount - a[1].amount);
  }, [items]);

  const exportTransactions = () => {
    const cols: CsvColumn<SellerWalletTransaction>[] = [
      { header: 'ID', value: (tx) => tx.id },
      { header: t('targets.fields.type'), value: (tx) => tx.type },
      { header: t('common.amount'), value: (tx) => tx.amount },
    ];
    downloadCsv(`wallet-transactions-page-${txPage}`, items, cols);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('seller.portal')}
        title={t('wallets.title')}
        description={t('seller.subtitle')}
        actions={
          items.length ? (
            <Button variant="outline" size="sm" onClick={exportTransactions}>
              <Download className="h-4 w-4" />
              {t('common.exportCsv')}
            </Button>
          ) : null
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WalletIcon className="h-4 w-4 text-primary" />
            {t('wallets.balance')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {wallet.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : w ? (
            <dl className="grid gap-6 sm:grid-cols-5">
              {[
                { label: t('wallets.balance'), value: w.balance },
                { label: t('wallets.available'), value: w.available },
                { label: t('wallets.pendingWithdrawal'), value: w.pendingWithdrawal },
                { label: t('wallets.totalEarned'), value: w.totalEarned },
                { label: t('wallets.totalWithdrawn'), value: w.totalWithdrawn },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </p>
                  <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">
                    {formatCurrency(s.value, locale)}
                  </p>
                </div>
              ))}
            </dl>
          ) : (
            <EmptyState title={t('common.noResults')} />
          )}
        </CardContent>
      </Card>

      {/* Type breakdown */}
      {byType.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('seller.byType')}</CardTitle>
            <CardDescription>{t('seller.totalsThisPage')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {byType.map(([type, agg]) => (
                <div
                  key={type}
                  className="rounded-xl border border-border/70 bg-card p-3 shadow-card"
                >
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {t(`transaction.type.${type}`)}
                  </p>
                  <p className="mt-1 text-lg font-semibold tabular-nums">
                    {formatCurrency(agg.amount, locale)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {agg.count} ×
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('wallets.transactions')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {txs.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : !txs.data?.items.length ? (
            <EmptyState title={t('common.noResults')} className="py-8" />
          ) : (
            <ul className="divide-y divide-border/40">
              {txs.data.items.map((tx) => {
                const outflow = tx.type === 'withdrawal';
                const Arrow = outflow ? ArrowUpRight : ArrowDownLeft;
                return (
                  <li key={tx.id} className="flex items-center gap-3 py-3">
                    <span
                      className={cn(
                        'grid h-8 w-8 place-items-center rounded-xl',
                        outflow
                          ? 'bg-destructive-soft text-destructive'
                          : 'bg-success-soft text-success',
                      )}
                    >
                      <Arrow className="h-4 w-4" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="truncate text-sm font-medium">
                        {t(`transaction.type.${tx.type}`)}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground/80">
                        {tx.id}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'text-sm font-semibold tabular-nums',
                        outflow ? 'text-destructive' : 'text-success',
                      )}
                    >
                      {outflow ? '−' : '+'} {formatCurrency(tx.amount, locale)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          {txs.data && txs.data.totalPages > 1 && (
            <PaginationBar
              currentPage={txs.data.currentPage}
              totalPages={txs.data.totalPages}
              totalItems={txs.data.totalItems}
              onChange={setTxPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
