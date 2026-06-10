'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/shared/empty-state';
import { UserPicker } from '@/components/shared/user-picker';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserMonthlyAnalyticsQuery } from '@/hooks/queries/use-analytics';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency } from '@/lib/utils';
import type { User } from '@/types/auth';

export function UserMonthlyCard() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [user, setUser] = useState<User | null>(null);
  const monthly = useUserMonthlyAnalyticsQuery(user?.id ?? '', Boolean(user));
  const m = monthly.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('analytics.monthly')}</CardTitle>
        <CardDescription>{t('users.title')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs">{t('users.title')}</Label>
          <UserPicker value={user} onChange={setUser} />
        </div>
        {!user ? (
          <EmptyState title={t('analytics.monthly')} description={t('users.title')} className="py-10" />
        ) : monthly.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : m ? (
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {t('dashboard.totalSales')}
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight">
                {formatCurrency(m.salesTotal, locale)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {t('dashboard.totalCommissions')}
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight">
                {formatCurrency(m.commissionTotal, locale)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {t('users.title')}
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight">
                {formatCurrency(m.networkSales, locale)}
              </p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
