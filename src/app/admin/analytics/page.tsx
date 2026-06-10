'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
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
import {
  useAnalyticsOverview,
  useAnalyticsSalesBreakdown,
  useAnalyticsTimeseries,
  useAnalyticsTopPerformers,
  useAnalyticsWithdrawals,
} from '@/hooks/queries/use-analytics';
import { useTranslation } from '@/hooks/use-translation';

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [range, setRange] = useState<AnalyticsRange>(() => defaultRange('daily'));

  const series = useAnalyticsTimeseries(range.from, range.to, range.granularity);
  const overview = useAnalyticsOverview(range.from, range.to, range.granularity, series.data);
  const sales = useAnalyticsSalesBreakdown(range.from, range.to, series.data);
  const withdrawals = useAnalyticsWithdrawals(range.from, range.to, series.data);
  const top = useAnalyticsTopPerformers(range.from, range.to, series.data);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t('analytics.title')}
        title={t('analytics.title')}
        description={t('app.title')}
        actions={<RangeBar value={range} onChange={setRange} />}
      />

      {/* KPI overview */}
      <OverviewKpis data={overview.data} isLoading={overview.isLoading} />

      {/* Today's real snapshot — uses existing /v1/admin/analytics/daily */}
      <TodaySnapshot />

      {/* Charts — Revenue + Activity */}
      <div className="grid gap-5 lg:grid-cols-3">
        <RevenueChart
          data={series.data}
          isLoading={series.isLoading}
          isDemo={series.isDemo}
        />
        <ActivityChart
          data={series.data}
          isLoading={series.isLoading}
          isDemo={series.isDemo}
        />
      </div>

      {/* Breakdown row */}
      <div className="grid gap-5 lg:grid-cols-2">
        <SalesStatusChart data={sales.data} isLoading={sales.isLoading} isDemo={sales.isDemo} />
        <WithdrawalsChart
          data={withdrawals.data}
          isLoading={withdrawals.isLoading}
          isDemo={withdrawals.isDemo}
        />
      </div>

      {/* Top performers */}
      <TopPerformers data={top.data} isLoading={top.isLoading} isDemo={top.isDemo} />

      {/* Per-user monthly — existing endpoint */}
      <UserMonthlyCard />
    </div>
  );
}
