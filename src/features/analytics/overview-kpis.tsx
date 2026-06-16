'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  ScrollText,
  Users,
  Banknote,
  PackageCheck,
  Hourglass,
  UserPlus,
} from 'lucide-react';
import { MetricCard } from '@/components/shared/metric-card';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { stagger } from '@/lib/motion';
import type { DashboardSummary } from '@/types/admin/analytics';

export function OverviewKpis({
  data,
  isLoading,
}: {
  data?: DashboardSummary;
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
        value={data ? formatCurrency(data.totalSales.amount, locale) : '—'}
        icon={TrendingUp}
        accent="indigo"
        trend={data ? { value: data.totalSales.changePercentage } : undefined}
        isLoading={isLoading}
      />
      <MetricCard
        label={t('dashboard.totalCommissions')}
        value={data ? formatCurrency(data.totalCommissions.amount, locale) : '—'}
        icon={ScrollText}
        accent="emerald"
        trend={data ? { value: data.totalCommissions.changePercentage } : undefined}
        isLoading={isLoading}
      />
      <MetricCard
        label={t('dashboard.activeUsers')}
        value={data ? formatNumber(data.activeUsers.count, locale) : '—'}
        icon={Users}
        accent="amber"
        trend={data ? { value: data.activeUsers.changePercentage } : undefined}
        isLoading={isLoading}
      />
      <MetricCard
        label={t('withdrawals.title')}
        value={data ? formatCurrency(data.withdrawals.amount, locale) : '—'}
        sublabel={
          data
            ? t('dashboard.commissionsCount', {
                count: formatNumber(data.withdrawals.count, locale),
              })
            : undefined
        }
        icon={Banknote}
        accent="rose"
        trend={data ? { value: data.withdrawals.changePercentage } : undefined}
        isLoading={isLoading}
      />

      {/* Secondary row — only renders when API returns these blocks. */}
      {data?.deliveredSales && (
        <MetricCard
          label={t('dashboard.deliveredSales')}
          value={formatCurrency(data.deliveredSales.amount, locale)}
          sublabel={t('dashboard.salesCount', {
            count: formatNumber(data.deliveredSales.count, locale),
          })}
          icon={PackageCheck}
          accent="emerald"
          trend={{ value: data.deliveredSales.changePercentage }}
          isLoading={isLoading}
        />
      )}
      {data?.pendingPipeline && (
        <MetricCard
          label={t('dashboard.pendingPipeline')}
          value={formatCurrency(data.pendingPipeline.amount, locale)}
          sublabel={t('dashboard.salesCount', {
            count: formatNumber(data.pendingPipeline.count, locale),
          })}
          icon={Hourglass}
          accent="amber"
          isLoading={isLoading}
        />
      )}
      {data?.newSellers && (
        <MetricCard
          label={t('dashboard.newSellers')}
          value={formatNumber(data.newSellers.count, locale)}
          icon={UserPlus}
          accent="indigo"
          trend={{ value: data.newSellers.changePercentage }}
          isLoading={isLoading}
        />
      )}
    </motion.div>
  );
}
