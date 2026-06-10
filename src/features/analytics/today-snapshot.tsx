'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDailyAnalyticsQuery } from '@/hooks/queries/use-analytics';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';

export function TodaySnapshot() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const query = useDailyAnalyticsQuery();
  const d = query.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.today')}</CardTitle>
        <CardDescription>
          {d?.date ? formatDate(d.date, locale) : t('analytics.daily')}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-3">
        {query.isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-32" />
            </div>
          ))
        ) : (
          <>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {t('dashboard.totalSales')}
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                {d ? formatCurrency(d.totalSales, locale) : '—'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {t('dashboard.totalCommissions')}
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                {d ? formatCurrency(d.totalCommissions, locale) : '—'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {t('dashboard.activeUsers')}
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                {d ? formatNumber(d.activeUsers, locale) : '—'}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
