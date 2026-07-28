'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  AlertCircle,
  Banknote,
  BarChart3,
  CalendarRange,
  ChevronLeft,
  LineChart,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { ErrorState } from '@/components/shared/error-state';
import { MetricCard } from '@/components/shared/metric-card';
import { ExplainLabel } from '@/components/shared/explain-label';
import {
  defaultRange,
  RangeBar,
  type AnalyticsRange,
} from '@/features/analytics/range-bar';
import { OwnerPnlKpis } from '@/features/analytics/owner-pnl-kpis';
import { ContributionChart } from '@/features/analytics/contribution-chart';
import { OwnerTeamSection } from '@/features/analytics/owner-team-section';
import { SalesStatusChart } from '@/features/analytics/sales-status-chart';
import { WithdrawalsChart } from '@/features/analytics/withdrawals-chart';
import { NewSellersTrend, WithdrawalsTrend } from '@/features/analytics/secondary-trends';
import { UserMonthlyCard } from '@/features/analytics/user-monthly-card';
import { useOwnerReportQuery } from '@/hooks/queries/use-analytics';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [range, setRange] = useState<AnalyticsRange>(() => defaultRange('daily'));

  const params = {
    from: format(range.from, 'yyyy-MM-dd'),
    to: format(range.to, 'yyyy-MM-dd'),
  };
  const report = useOwnerReportQuery(params);
  const d = report.data;
  const pending = d?.ops.pendingWithdrawals;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow={t('analytics.title')}
        title={t('analytics.title')}
        description={t('analytics.subtitle')}
      />

      <div className="flex flex-col gap-3 border-b border-border/60 pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <CalendarRange className="h-4 w-4" />
          </span>
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold tracking-tight">
              {t('analytics.section.range')}
            </h2>
            <p className="text-[12px] text-muted-foreground">
              {formatDate(range.from.toISOString(), locale)} →{' '}
              {formatDate(range.to.toISOString(), locale)}
            </p>
          </div>
        </div>
        <RangeBar value={range} onChange={setRange} />
      </div>

      {pending && pending.count > 0 ? (
        <section className="rounded-2xl border border-amber-500/25 bg-amber-50/60 px-4 py-3 dark:bg-amber-950/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-950 dark:text-amber-100">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              {t('dashboard.needsAttention')}
            </div>
            <Link
              href="/admin/withdrawals?status=pending"
              className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-white/80 px-3 py-1.5 text-sm font-medium text-amber-950 transition-colors hover:bg-white dark:bg-amber-950/40 dark:text-amber-50 dark:hover:bg-amber-950/60"
            >
              <Banknote className="h-4 w-4 text-amber-700" />
              <span>
                {t('dashboard.pendingWithdrawals')}
                <span className="ms-1.5 tabular-nums">
                  ({formatNumber(pending.count, locale)}) ·{' '}
                  {formatCurrency(pending.amount, locale)}
                </span>
              </span>
              <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            </Link>
          </div>
        </section>
      ) : null}

      {report.isError ? (
        <ErrorState onRetry={() => report.refetch()} />
      ) : (
        <div className="space-y-10">
          <section className="space-y-4">
            <SectionHeader
              icon={BarChart3}
              title={t('analytics.section.pnl')}
              description={t('analytics.section.pnlDesc')}
            />
            <OwnerPnlKpis data={d} isLoading={report.isLoading} />
          </section>

          <section className="space-y-4">
            <SectionHeader
              icon={LineChart}
              title={t('analytics.section.trends')}
              description={t('analytics.section.trendsDesc')}
            />
            <div className="grid gap-5 lg:grid-cols-3">
              <ContributionChart trends={d?.trends} isLoading={report.isLoading} />
              <WithdrawalsTrend
                data={d?.trends.withdrawals}
                isLoading={report.isLoading}
              />
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <NewSellersTrend
                data={d?.trends.newSellers}
                isLoading={report.isLoading}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard
                  label={
                    <ExplainLabel
                      labelKey="analytics.ops.deliveryRate"
                      explainKey="analytics.explain.deliveryRate"
                    />
                  }
                  value={
                    d?.ops.deliveryRate != null
                      ? `${formatNumber(d.ops.deliveryRate, locale)}%`
                      : '—'
                  }
                  icon={BarChart3}
                  accent="emerald"
                  isLoading={report.isLoading}
                />
                <MetricCard
                  label={
                    <ExplainLabel
                      labelKey="analytics.ops.failedRate"
                      explainKey="analytics.explain.failedRate"
                    />
                  }
                  value={
                    d?.ops.failedRate != null
                      ? `${formatNumber(d.ops.failedRate, locale)}%`
                      : '—'
                  }
                  icon={BarChart3}
                  accent="rose"
                  isLoading={report.isLoading}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <SectionHeader
              icon={Users}
              title={t('analytics.section.team')}
              description={t('analytics.section.teamDesc')}
            />
            <OwnerTeamSection data={d?.team} isLoading={report.isLoading} />
            <UserMonthlyCard />
          </section>

          <section className="space-y-4">
            <SectionHeader
              icon={Banknote}
              title={t('analytics.section.secondary')}
              description={t('analytics.section.secondaryDesc')}
            />
            <div className="grid gap-5 lg:grid-cols-2">
              <SalesStatusChart
                data={d?.ops.salesByStatus}
                isLoading={report.isLoading}
              />
              <WithdrawalsChart
                data={d?.ops.withdrawalsByStatus}
                isLoading={report.isLoading}
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

type LucideIcon = typeof CalendarRange;

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-border/60 pb-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="space-y-0.5">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <p className="text-[12px] text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
