'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { EmptyState } from '@/components/shared/empty-state';
import { useLeaderboardQuery } from '@/hooks/queries/use-analytics';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { LeaderboardEntry, LeaderboardMetric } from '@/types/admin/analytics';

const METRICS: LeaderboardMetric[] = ['salesAmount', 'commissionsEarned', 'networkSalesAmount'];

function BarRow({
  entry,
  max,
  amountLabel,
  showSalesCount,
}: {
  entry: LeaderboardEntry;
  max: number;
  amountLabel: string;
  showSalesCount: boolean;
}) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const pct = max > 0 ? (entry.value / max) * 100 : 0;
  const name = entry.user?.displayName ?? entry.userId;
  const meta = entry.user?.sellerCode ?? entry.user?.email ?? '—';

  return (
    <li className="space-y-1.5">
      <div className="flex items-center gap-3">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
          {entry.rank}
        </span>
        <Avatar className="h-8 w-8">
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-sm font-medium">{name}</span>
          <span className="truncate text-[11px] text-muted-foreground">{meta}</span>
        </div>
        <div className="text-end leading-tight">
          <p className="text-sm font-semibold">{formatCurrency(entry.value, locale)}</p>
          <p className="text-[11px] text-muted-foreground">
            {amountLabel}
            {showSalesCount
              ? ` · ${formatNumber(entry.salesCount, locale)} ${t('sales.title')}`
              : ''}
          </p>
        </div>
      </div>
      <div className="ms-9 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-brand-gradient"
          style={{ width: `${Math.min(100, Math.max(4, pct))}%` }}
        />
      </div>
    </li>
  );
}

export function TopPerformers() {
  const { t } = useTranslation();
  const [metric, setMetric] = useState<LeaderboardMetric>('salesAmount');
  const month = format(new Date(), 'yyyy-MM');

  const query = useLeaderboardQuery({ month, metric, limit: 10 });
  const items = query.data?.items ?? [];
  const max = Math.max(0, ...items.map((i) => i.value));

  const labelFor = (m: LeaderboardMetric) =>
    m === 'salesAmount'
      ? t('dashboard.totalSales')
      : m === 'commissionsEarned'
        ? t('dashboard.totalCommissions')
        : t('analytics.networkSales');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('analytics.leaderboard')}</CardTitle>
        <CardDescription>{month}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={metric} onValueChange={(v) => setMetric(v as LeaderboardMetric)}>
          <TabsList>
            {METRICS.map((m) => (
              <TabsTrigger key={m} value={m}>
                {labelFor(m)}
              </TabsTrigger>
            ))}
          </TabsList>
          {METRICS.map((m) => (
            <TabsContent key={m} value={m}>
              {query.isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <EmptyState title={t('common.noResults')} className="py-10" />
              ) : (
                <ul className="space-y-4">
                  {items.map((entry) => (
                    <BarRow
                      key={entry.userId}
                      entry={entry}
                      max={max}
                      amountLabel={labelFor(m)}
                      showSalesCount={m !== 'commissionsEarned'}
                    />
                  ))}
                </ul>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
