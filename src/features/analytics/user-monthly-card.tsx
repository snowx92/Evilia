'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/shared/empty-state';
import { UserPicker } from '@/components/shared/user-picker';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserMonthlyAnalyticsQuery } from '@/hooks/queries/use-analytics';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { User } from '@/types/auth';

export function UserMonthlyCard() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [user, setUser] = useState<User | null>(null);
  const [month, setMonth] = useState<string>(() => format(new Date(), 'yyyy-MM'));

  const monthly = useUserMonthlyAnalyticsQuery(user?.id ?? '', month, Boolean(user));
  const m = monthly.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('analytics.monthly')}</CardTitle>
        <CardDescription>{t('users.title')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <div className="space-y-2">
            <Label className="text-xs">{t('users.title')}</Label>
            <UserPicker value={user} onChange={setUser} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">{t('analytics.month')}</Label>
            <Input
              type="month"
              dir="ltr"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
        </div>
        {!user ? (
          <EmptyState
            title={t('analytics.monthly')}
            description={t('users.title')}
            className="py-10"
          />
        ) : monthly.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : m ? (
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {t('dashboard.totalSales')}
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight">
                {formatCurrency(m.salesAmount, locale)}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {t('dashboard.salesCount', { count: formatNumber(m.salesCount, locale) })}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {t('dashboard.totalCommissions')}
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight">
                {formatCurrency(m.commissionsEarned, locale)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {t('analytics.networkSales')}
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight">
                {formatCurrency(m.networkSalesAmount, locale)}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {t('dashboard.salesCount', { count: formatNumber(m.networkSalesCount, locale) })}
              </p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
