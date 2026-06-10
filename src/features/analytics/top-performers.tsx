'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { DemoBadge } from './demo-badge';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { TopPerformersResponse } from '@/types/admin/analytics';

function BarRow({
  rank,
  name,
  meta,
  amount,
  pct,
  amountLabel,
  countLabel,
}: {
  rank: number;
  name: string;
  meta: string;
  amount: string;
  pct: number;
  amountLabel: string;
  countLabel?: string;
}) {
  return (
    <li className="space-y-1.5">
      <div className="flex items-center gap-3">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
          {rank}
        </span>
        <Avatar className="h-8 w-8">
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-sm font-medium">{name}</span>
          <span className="truncate text-[11px] text-muted-foreground">{meta}</span>
        </div>
        <div className="text-end leading-tight">
          <p className="text-sm font-semibold">{amount}</p>
          <p className="text-[11px] text-muted-foreground">
            {amountLabel}
            {countLabel ? ` · ${countLabel}` : ''}
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

export function TopPerformers({
  data,
  isLoading,
  isDemo,
}: {
  data: TopPerformersResponse;
  isLoading?: boolean;
  isDemo?: boolean;
}) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);

  const maxSales = Math.max(0, ...data.bySales.map((s) => s.salesAmount));
  const maxComm = Math.max(0, ...data.byCommissions.map((s) => s.commissionsAmount));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t('users.title')}
          <DemoBadge show={Boolean(isDemo)} />
        </CardTitle>
        <CardDescription>{t('dashboard.totalSales')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Tabs defaultValue="sales">
            <TabsList>
              <TabsTrigger value="sales">{t('dashboard.totalSales')}</TabsTrigger>
              <TabsTrigger value="commissions">{t('dashboard.totalCommissions')}</TabsTrigger>
            </TabsList>
            <TabsContent value="sales">
              <ul className="space-y-4">
                {data.bySales.map((s, i) => (
                  <BarRow
                    key={s.userId}
                    rank={i + 1}
                    name={s.displayName}
                    meta={s.sellerCode ?? '—'}
                    amount={formatCurrency(s.salesAmount, locale)}
                    pct={maxSales > 0 ? (s.salesAmount / maxSales) * 100 : 0}
                    amountLabel={t('dashboard.totalSales')}
                    countLabel={`${formatNumber(s.salesCount, locale)} ${t('sales.title')}`}
                  />
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="commissions">
              <ul className="space-y-4">
                {data.byCommissions.map((s, i) => (
                  <BarRow
                    key={s.userId}
                    rank={i + 1}
                    name={s.displayName}
                    meta={s.sellerCode ?? '—'}
                    amount={formatCurrency(s.commissionsAmount, locale)}
                    pct={maxComm > 0 ? (s.commissionsAmount / maxComm) * 100 : 0}
                    amountLabel={t('dashboard.totalCommissions')}
                  />
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
