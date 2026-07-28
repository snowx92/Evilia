'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Banknote,
  ChevronLeft,
  Clock,
  Hourglass,
  Package,
  ScrollText,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { MetricCard } from '@/components/shared/metric-card';
import { ExplainLabel } from '@/components/shared/explain-label';
import { ErrorState } from '@/components/shared/error-state';
import { SalesStatusCards } from '@/features/analytics/sales-status-cards';
import { useOwnerOverviewQuery } from '@/hooks/queries/use-analytics';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { stagger } from '@/lib/motion';
import { Skeleton } from '@/components/ui/skeleton';

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-0.5 border-b border-border/60 pb-3">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {description ? (
        <p className="text-[12px] text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('nav.dashboard'));
  const locale = useLocaleStore((s) => s.locale);
  const overview = useOwnerOverviewQuery();
  const data = overview.data;
  const pendingCount = data?.withdrawals.pendingCount ?? 0;
  const showAttention = overview.isLoading || pendingCount > 0;

  if (overview.isError) {
    return (
      <div className="space-y-6">
        <SectionHeader title={t('dashboard.title')} description={t('dashboard.homeSubtitle')} />
        <ErrorState onRetry={() => overview.refetch()} />
      </div>
    );
  }

  const inFlightOrders =
    (data?.pipeline.pending.orders ?? 0) + (data?.pipeline.processing.orders ?? 0);
  const inFlightGmv =
    (data?.pipeline.pending.salesAmount ?? 0) + (data?.pipeline.processing.salesAmount ?? 0);
  const inFlightHeld =
    (data?.pipeline.pending.heldCommission ?? 0) +
    (data?.pipeline.processing.heldCommission ?? 0);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('dashboard.homeSubtitle')}</p>
      </div>

      {showAttention ? (
        <section className="rounded-2xl border border-amber-500/25 bg-amber-50/60 px-4 py-3 dark:bg-amber-950/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-950 dark:text-amber-100">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              {t('dashboard.needsAttention')}
            </div>
            {overview.isLoading ? (
              <Skeleton className="h-8 w-48 rounded-lg" />
            ) : pendingCount > 0 ? (
              <Link
                href="/admin/withdrawals?status=pending"
                className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-white/80 px-3 py-1.5 text-sm font-medium text-amber-950 transition-colors hover:bg-white dark:bg-amber-950/40 dark:text-amber-50 dark:hover:bg-amber-950/60"
              >
                <Banknote className="h-4 w-4 text-amber-700" />
                <span>
                  {t('dashboard.pendingWithdrawals')}
                  <span className="ms-1.5 tabular-nums text-amber-800 dark:text-amber-200">
                    ({formatNumber(pendingCount, locale)})
                  </span>
                  {data ? (
                    <span className="ms-1.5 tabular-nums text-amber-800/80 dark:text-amber-200/80">
                      · {formatCurrency(data.withdrawals.pendingAmount, locale)}
                    </span>
                  ) : null}
                </span>
                <span className="ms-1 text-[11px] font-medium uppercase tracking-wide text-amber-700/80">
                  {t('dashboard.reviewNow')}
                </span>
                <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <SectionHeader
          title={t('dashboard.section.money')}
          description={t('dashboard.section.moneyDesc')}
        />
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <MetricCard
            label={
              <ExplainLabel
                labelKey="dashboard.money.available"
                explainKey="dashboard.explain.available"
              />
            }
            value={data ? formatCurrency(data.wallets.totalAvailable, locale) : '—'}
            sublabel={
              data
                ? `${t('dashboard.money.balance')}: ${formatCurrency(data.wallets.totalBalance, locale)}`
                : undefined
            }
            icon={Wallet}
            isLoading={overview.isLoading}
            accent="emerald"
          />
          <MetricCard
            label={
              <ExplainLabel
                labelKey="dashboard.money.held"
                explainKey="dashboard.explain.held"
              />
            }
            value={data ? formatCurrency(data.wallets.totalHeld, locale) : '—'}
            sublabel={t('dashboard.money.heldHint')}
            icon={Hourglass}
            isLoading={overview.isLoading}
            accent="amber"
          />
          <MetricCard
            label={
              <ExplainLabel
                labelKey="dashboard.money.pendingWithdrawals"
                explainKey="dashboard.explain.pendingWithdrawalAmount"
              />
            }
            value={data ? formatCurrency(data.wallets.totalPendingWithdrawal, locale) : '—'}
            sublabel={
              data
                ? t('dashboard.pendingWithdrawalsCount', {
                    count: formatNumber(data.withdrawals.pendingCount, locale),
                  })
                : undefined
            }
            icon={Banknote}
            isLoading={overview.isLoading}
            accent="rose"
          />
        </motion.div>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <MetricCard
            label={
              <ExplainLabel
                labelKey="dashboard.money.earned"
                explainKey="dashboard.explain.earned"
              />
            }
            value={data ? formatCurrency(data.wallets.totalEarned, locale) : '—'}
            icon={ScrollText}
            isLoading={overview.isLoading}
            accent="indigo"
            compact
          />
          <MetricCard
            label={
              <ExplainLabel
                labelKey="dashboard.money.withdrawn"
                explainKey="dashboard.explain.withdrawn"
              />
            }
            value={data ? formatCurrency(data.wallets.totalWithdrawn, locale) : '—'}
            icon={Banknote}
            isLoading={overview.isLoading}
            accent="indigo"
            compact
          />
          <MetricCard
            label={
              <ExplainLabel
                labelKey="dashboard.money.wallets"
                explainKey="dashboard.explain.walletCount"
              />
            }
            value={data ? formatNumber(data.wallets.walletCount, locale) : '—'}
            icon={Users}
            isLoading={overview.isLoading}
            accent="indigo"
            compact
          />
        </motion.div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title={t('dashboard.section.inFlight')}
          description={t('dashboard.section.inFlightDesc')}
        />
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <MetricCard
            label={
              <ExplainLabel
                labelKey="dashboard.pipeline.pendingOrders"
                explainKey="dashboard.explain.pendingOrders"
              />
            }
            value={data ? formatNumber(data.pipeline.pending.orders, locale) : '—'}
            sublabel={
              data
                ? formatCurrency(data.pipeline.pending.salesAmount, locale)
                : undefined
            }
            icon={Clock}
            isLoading={overview.isLoading}
            accent="amber"
          />
          <MetricCard
            label={
              <ExplainLabel
                labelKey="dashboard.pipeline.processingOrders"
                explainKey="dashboard.explain.processingOrders"
              />
            }
            value={data ? formatNumber(data.pipeline.processing.orders, locale) : '—'}
            sublabel={
              data
                ? formatCurrency(data.pipeline.processing.salesAmount, locale)
                : undefined
            }
            icon={Package}
            isLoading={overview.isLoading}
            accent="indigo"
          />
          <MetricCard
            label={
              <ExplainLabel
                labelKey="dashboard.pipeline.expectedGmv"
                explainKey="dashboard.explain.expectedGmv"
              />
            }
            value={data ? formatCurrency(inFlightGmv, locale) : '—'}
            sublabel={
              data
                ? t('dashboard.salesCount', {
                    count: formatNumber(inFlightOrders, locale),
                  })
                : undefined
            }
            icon={TrendingUp}
            isLoading={overview.isLoading}
            accent="indigo"
          />
          <MetricCard
            label={
              <ExplainLabel
                labelKey="dashboard.pipeline.heldCommission"
                explainKey="dashboard.explain.pipelineHeld"
              />
            }
            value={data ? formatCurrency(inFlightHeld, locale) : '—'}
            sublabel={t('dashboard.money.heldHint')}
            icon={Hourglass}
            isLoading={overview.isLoading}
            accent="amber"
          />
        </motion.div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title={t('dashboard.section.pulse')}
          description={
            data?.today.date
              ? `${formatDate(data.today.date, locale)} · ${t('dashboard.section.pulseDesc')}`
              : t('dashboard.section.pulseDesc')
          }
        />
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <MetricCard
            label={
              <ExplainLabel
                labelKey="dashboard.todaySales"
                explainKey="dashboard.explain.todaySales"
              />
            }
            value={data ? formatCurrency(data.today.salesAmount, locale) : '—'}
            sublabel={
              data
                ? t('dashboard.salesCount', {
                    count: formatNumber(data.today.salesCount, locale),
                  })
                : undefined
            }
            icon={TrendingUp}
            isLoading={overview.isLoading}
            accent="indigo"
          />
          <MetricCard
            label={
              <ExplainLabel
                labelKey="dashboard.todayCommissions"
                explainKey="dashboard.explain.todayCommissions"
              />
            }
            value={data ? formatCurrency(data.today.commissionsCredited, locale) : '—'}
            sublabel={
              data
                ? t('dashboard.commissionsCount', {
                    count: formatNumber(data.today.commissionsCount, locale),
                  })
                : undefined
            }
            icon={ScrollText}
            isLoading={overview.isLoading}
            accent="emerald"
          />
          <MetricCard
            label={
              <ExplainLabel
                labelKey="dashboard.activeSellersToday"
                explainKey="dashboard.explain.activeUsers"
              />
            }
            value={data ? formatNumber(data.today.activeSellers, locale) : '—'}
            icon={Users}
            isLoading={overview.isLoading}
            accent="amber"
          />
        </motion.div>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2"
        >
          <MetricCard
            label={
              <ExplainLabel
                labelKey="dashboard.monthDelivered"
                explainKey="dashboard.explain.monthDelivered"
              />
            }
            value={data ? formatCurrency(data.month.salesAmount, locale) : '—'}
            sublabel={
              data
                ? `${data.month.month} · ${t('dashboard.salesCount', {
                    count: formatNumber(data.month.salesCount, locale),
                  })}`
                : undefined
            }
            icon={TrendingUp}
            isLoading={overview.isLoading}
            accent="emerald"
            compact
          />
          <MetricCard
            label={
              <ExplainLabel
                labelKey="dashboard.monthCommissions"
                explainKey="dashboard.explain.monthCommissions"
              />
            }
            value={data ? formatCurrency(data.month.commissionsCredited, locale) : '—'}
            sublabel={
              data
                ? t('dashboard.commissionsCount', {
                    count: formatNumber(data.month.commissionsCount, locale),
                  })
                : undefined
            }
            icon={ScrollText}
            isLoading={overview.isLoading}
            accent="emerald"
            compact
          />
        </motion.div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title={t('dashboard.section.pipeline')}
          description={t('dashboard.section.pipelineDesc')}
        />
        <SalesStatusCards defaultRange="month" />
      </section>
    </div>
  );
}
