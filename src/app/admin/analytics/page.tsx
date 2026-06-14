'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { PageHeader } from '@/components/shared/page-header';
import { ErrorState } from '@/components/shared/error-state';
import {
  defaultRange,
  RangeBar,
  type AnalyticsRange,
} from '@/features/analytics/range-bar';
import { OverviewKpis } from '@/features/analytics/overview-kpis';
import { RevenueChart } from '@/features/analytics/revenue-chart';
import { ActivityChart } from '@/features/analytics/activity-chart';
import { SalesStatusChart } from '@/features/analytics/sales-status-chart';
import { WithdrawalsChart } from '@/features/analytics/withdrawals-chart';
import { TopPerformers } from '@/features/analytics/top-performers';
import { TodaySnapshot } from '@/features/analytics/today-snapshot';
import { UserMonthlyCard } from '@/features/analytics/user-monthly-card';
import { useAnalyticsDashboardQuery } from '@/hooks/queries/use-analytics';
import { useTranslation } from '@/hooks/use-translation';

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [range, setRange] = useState<AnalyticsRange>(() => defaultRange('daily'));

  const params = {
    from: format(range.from, 'yyyy-MM-dd'),
    to: format(range.to, 'yyyy-MM-dd'),
  };
  const dashboard = useAnalyticsDashboardQuery(params);
  const d = dashboard.data;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t('analytics.title')}
        title={t('analytics.title')}
        description={t('app.title')}
        actions={<RangeBar value={range} onChange={setRange} />}
      />

      {dashboard.isError ? (
        <ErrorState onRetry={() => dashboard.refetch()} />
      ) : (
        <>
          {/* KPI overview */}
          <OverviewKpis data={d?.summary} isLoading={dashboard.isLoading} />

          {/* Today's snapshot — uses /v1/admin/analytics/daily directly */}
          <TodaySnapshot />

          {/* Charts — Revenue + Activity */}
          <div className="grid gap-5 lg:grid-cols-3">
            <RevenueChart
              data={d?.trends.salesAndCommissions ?? []}
              isLoading={dashboard.isLoading}
            />
            <ActivityChart
              data={d?.trends.activeUsers ?? []}
              isLoading={dashboard.isLoading}
            />
          </div>

          {/* Breakdown row */}
          <div className="grid gap-5 lg:grid-cols-2">
            <SalesStatusChart data={d?.salesByStatus} isLoading={dashboard.isLoading} />
            <WithdrawalsChart data={d?.withdrawalsByStatus} isLoading={dashboard.isLoading} />
          </div>

          {/* Top performers — own endpoint /v1/admin/analytics/leaderboard */}
          <TopPerformers />

          {/* Per-user monthly — /v1/admin/analytics/users/{userId} */}
          <UserMonthlyCard />
        </>
      )}
    </div>
  );
}
