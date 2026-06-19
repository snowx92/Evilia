'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, CalendarRange, TrendingUp } from 'lucide-react';
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
import { NewSellersTrend, WithdrawalsTrend } from '@/features/analytics/secondary-trends';
import { SalesFunnelTrend } from '@/features/analytics/sales-funnel-trend';
import { TopPerformers } from '@/features/analytics/top-performers';
import { TodaySnapshot } from '@/features/analytics/today-snapshot';
import { UserMonthlyCard } from '@/features/analytics/user-monthly-card';
import { SalesStatusCards } from '@/features/analytics/sales-status-cards';
import { useAnalyticsDashboardQuery } from '@/hooks/queries/use-analytics';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatDate } from '@/lib/utils';

/**
 * Analytics splits into three clearly-labeled scopes so a non-technical
 * operator can immediately tell which slice of time each chart covers:
 *
 *   1. Today's pulse        — single day (/v1/admin/analytics/daily)
 *   2. Range analysis       — RangeBar-controlled (/v1/admin/analytics/dashboard)
 *   3. Monthly performance  — month-picker controlled (/leaderboard + /users/{id})
 *
 * The page header no longer carries the RangeBar; it lives inside the Range
 * section header instead, so its scope is unambiguous.
 */
export default function AnalyticsPage() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [range, setRange] = useState<AnalyticsRange>(() => defaultRange('daily'));

  const params = {
    from: format(range.from, 'yyyy-MM-dd'),
    to: format(range.to, 'yyyy-MM-dd'),
  };
  const dashboard = useAnalyticsDashboardQuery(params);
  const d = dashboard.data;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow={t('analytics.title')}
        title={t('analytics.title')}
        description={t('analytics.subtitle')}
      />

      <SalesStatusCards />

      {/* ───── Section 1: Today's pulse ──────────────────────────────── */}
      <SectionHeader
        icon={Calendar}
        title={t('analytics.section.today')}
        description={t('analytics.section.todayDesc')}
      />
      <TodaySnapshot />

      {/* ───── Section 2: Range analysis ─────────────────────────────── */}
      <SectionHeader
        icon={CalendarRange}
        title={t('analytics.section.range')}
        description={`${formatDate(range.from.toISOString(), locale)} → ${formatDate(range.to.toISOString(), locale)}`}
        actions={<RangeBar value={range} onChange={setRange} />}
      />

      {dashboard.isError ? (
        <ErrorState onRetry={() => dashboard.refetch()} />
      ) : (
        <div className="space-y-5">
          <OverviewKpis data={d?.summary} isLoading={dashboard.isLoading} />

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

          <div className="grid gap-5 lg:grid-cols-2">
            <SalesFunnelTrend
              data={d?.trends.salesByStatus}
              isLoading={dashboard.isLoading}
            />
            <WithdrawalsTrend
              data={d?.trends.withdrawals}
              isLoading={dashboard.isLoading}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <NewSellersTrend
              data={d?.trends.newSellers}
              isLoading={dashboard.isLoading}
            />
            <SalesStatusChart data={d?.salesByStatus} isLoading={dashboard.isLoading} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <WithdrawalsChart
              data={d?.withdrawalsByStatus}
              isLoading={dashboard.isLoading}
            />
          </div>
        </div>
      )}

      {/* ───── Section 3: Monthly performance ────────────────────────── */}
      <SectionHeader
        icon={TrendingUp}
        title={t('analytics.section.monthly')}
        description={t('analytics.section.monthlyDesc')}
      />
      <div className="space-y-5">
        <TopPerformers />
        <UserMonthlyCard />
      </div>
    </div>
  );
}

type LucideIcon = typeof Calendar;

function SectionHeader({
  icon: Icon,
  title,
  description,
  actions,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border/60 pb-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div className="space-y-0.5">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <p className="text-[12px] text-muted-foreground">{description}</p>
        </div>
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}
