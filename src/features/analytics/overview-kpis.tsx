'use client';

import { motion } from 'framer-motion';
import { TrendingUp, ScrollText, Users, Banknote } from 'lucide-react';
import { MetricCard } from '@/components/shared/metric-card';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { stagger } from '@/lib/motion';
import type { AnalyticsOverview } from '@/types/admin/analytics';

export function OverviewKpis({
  data,
  isLoading,
}: {
  data: AnalyticsOverview;
  isLoading?: boolean;
}) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <MetricCard
        label={t('dashboard.totalSales')}
        value={formatCurrency(data.totalSales, locale)}
        icon={TrendingUp}
        accent="indigo"
        trend={{ value: data.deltaSales }}
        isLoading={isLoading}
      />
      <MetricCard
        label={t('dashboard.totalCommissions')}
        value={formatCurrency(data.totalCommissions, locale)}
        icon={ScrollText}
        accent="emerald"
        trend={{ value: data.deltaCommissions }}
        isLoading={isLoading}
      />
      <MetricCard
        label={t('dashboard.activeUsers')}
        value={formatNumber(data.newUsers, locale)}
        icon={Users}
        accent="amber"
        trend={{ value: data.deltaNewUsers }}
        isLoading={isLoading}
      />
      <MetricCard
        label={t('withdrawals.title')}
        value={formatCurrency(data.paidWithdrawals, locale)}
        icon={Banknote}
        accent="rose"
        trend={{ value: data.deltaPaidWithdrawals }}
        isLoading={isLoading}
      />
    </motion.div>
  );
}
