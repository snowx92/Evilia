'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp, ScrollText, Users, Sparkles, AlertCircle, Banknote, ChevronLeft } from 'lucide-react';
import { MetricCard } from '@/components/shared/metric-card';
import { ExplainLabel } from '@/components/shared/explain-label';
import { useDailyAnalyticsQuery } from '@/hooks/queries/use-analytics';
import { useWithdrawalsQuery } from '@/hooks/queries/use-withdrawals';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useTranslation } from '@/hooks/use-translation';
import { useAuthStore } from '@/store/auth';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { stagger } from '@/lib/motion';
import { SalesStatusCards } from '@/features/analytics/sales-status-cards';
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
  const user = useAuthStore((s) => s.user);
  const locale = useLocaleStore((s) => s.locale);
  const daily = useDailyAnalyticsQuery();
  const data = daily.data;
  const pendingWithdrawals = useWithdrawalsQuery({ status: 'pending', page: 1, limit: 1 });
  const pendingCount = pendingWithdrawals.data?.totalItems ?? 0;
  const showAttention = pendingWithdrawals.isLoading || pendingCount > 0;

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border border-border/70 bg-brand-soft p-8 shadow-card"
      >
        <div className="relative space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium text-primary shadow-sm ring-1 ring-primary/15">
            <Sparkles className="h-3 w-3" />
            {data?.date ? formatDate(data.date, locale) : t('dashboard.today')}
          </span>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            {t('auth.welcomeBack')}
            {user ? (
              <>
                ،&nbsp;<span className="text-brand-gradient">{user.displayName}</span>
              </>
            ) : (
              ''
            )}
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">{t('dashboard.homeSubtitle')}</p>
        </div>
      </motion.section>

      {showAttention ? (
        <section className="rounded-2xl border border-amber-500/25 bg-amber-50/60 px-4 py-3 dark:bg-amber-950/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-950 dark:text-amber-100">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              {t('dashboard.needsAttention')}
            </div>
            {pendingWithdrawals.isLoading ? (
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
          title={t('dashboard.section.today')}
          description={t('dashboard.section.todayDesc')}
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
            value={data ? formatCurrency(data.totalSalesAmount ?? 0, locale) : '—'}
            sublabel={
              data
                ? t('dashboard.salesCount', {
                    count: formatNumber(data.totalSales ?? 0, locale),
                  })
                : undefined
            }
            icon={TrendingUp}
            isLoading={daily.isLoading}
            accent="indigo"
          />
          <MetricCard
            label={
              <ExplainLabel
                labelKey="dashboard.todayCommissions"
                explainKey="dashboard.explain.todayCommissions"
              />
            }
            value={data ? formatCurrency(data.totalCommissionsAmount ?? 0, locale) : '—'}
            sublabel={
              data
                ? t('dashboard.commissionsCount', {
                    count: formatNumber(data.totalCommissions ?? 0, locale),
                  })
                : undefined
            }
            icon={ScrollText}
            isLoading={daily.isLoading}
            accent="emerald"
          />
          <MetricCard
            label={
              <ExplainLabel
                labelKey="dashboard.activeSellersToday"
                explainKey="dashboard.explain.activeUsers"
              />
            }
            value={data ? formatNumber(data.activeUsers, locale) : '—'}
            icon={Users}
            isLoading={daily.isLoading}
            accent="amber"
          />
        </motion.div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title={t('dashboard.section.pipeline')}
          description={t('dashboard.section.pipelineDesc')}
        />
        <SalesStatusCards />
      </section>
    </div>
  );
}
