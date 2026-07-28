'use client';

import { motion } from 'framer-motion';
import {
  Banknote,
  Hourglass,
  Receipt,
  ScrollText,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { MetricCard } from '@/components/shared/metric-card';
import { ExplainLabel } from '@/components/shared/explain-label';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { stagger } from '@/lib/motion';
import type { OwnerReportResponse } from '@/types/admin/analytics';

export function OwnerPnlKpis({
  data,
  isLoading,
}: {
  data?: OwnerReportResponse;
  isLoading?: boolean;
}) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const pnl = data?.pnl;

  return (
    <div className="space-y-3">
      <p className="text-[12px] text-muted-foreground">{t('analytics.pnl.formula')}</p>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <MetricCard
          label={<ExplainLabel labelKey="analytics.pnl.gmv" explainKey="analytics.explain.gmv" />}
          value={pnl ? formatCurrency(pnl.gmv.amount, locale) : '—'}
          sublabel={
            pnl?.gmv.count != null
              ? t('dashboard.salesCount', {
                  count: formatNumber(pnl.gmv.count, locale),
                })
              : undefined
          }
          icon={TrendingUp}
          accent="indigo"
          trend={pnl ? { value: pnl.gmv.changePercentage } : undefined}
          isLoading={isLoading}
        />
        <MetricCard
          label={
            <ExplainLabel
              labelKey="analytics.pnl.commissions"
              explainKey="analytics.explain.commissions"
            />
          }
          value={pnl ? formatCurrency(pnl.commissionsCredited.amount, locale) : '—'}
          sublabel={
            pnl?.commissionsCredited.count != null
              ? t('dashboard.commissionsCount', {
                  count: formatNumber(pnl.commissionsCredited.count, locale),
                })
              : undefined
          }
          icon={ScrollText}
          accent="amber"
          trend={pnl ? { value: pnl.commissionsCredited.changePercentage } : undefined}
          isLoading={isLoading}
        />
        <MetricCard
          label={
            <ExplainLabel
              labelKey="analytics.pnl.expenses"
              explainKey="analytics.explain.expenses"
            />
          }
          value={pnl ? formatCurrency(pnl.expenses.amount, locale) : '—'}
          sublabel={
            pnl?.expenses.count != null
              ? t('analytics.pnl.expenseCount', {
                  count: formatNumber(pnl.expenses.count, locale),
                })
              : undefined
          }
          icon={Receipt}
          accent="rose"
          trend={pnl ? { value: pnl.expenses.changePercentage } : undefined}
          isLoading={isLoading}
        />
        <MetricCard
          label={
            <ExplainLabel
              labelKey="analytics.pnl.contribution"
              explainKey="analytics.explain.contribution"
            />
          }
          value={pnl ? formatCurrency(pnl.contribution.amount, locale) : '—'}
          sublabel={t('analytics.pnl.contributionHint')}
          icon={Wallet}
          accent="emerald"
          trend={pnl ? { value: pnl.contribution.changePercentage } : undefined}
          isLoading={isLoading}
        />
        <MetricCard
          label={
            <ExplainLabel
              labelKey="analytics.pnl.withdrawalsPaid"
              explainKey="analytics.explain.withdrawalsPaid"
            />
          }
          value={pnl ? formatCurrency(pnl.withdrawalsPaid.amount, locale) : '—'}
          sublabel={
            pnl?.withdrawalsPaid.count != null
              ? t('dashboard.withdrawalsCount', {
                  count: formatNumber(pnl.withdrawalsPaid.count, locale),
                })
              : undefined
          }
          icon={Banknote}
          accent="rose"
          trend={pnl ? { value: pnl.withdrawalsPaid.changePercentage } : undefined}
          isLoading={isLoading}
        />
        <MetricCard
          label={
            <ExplainLabel
              labelKey="analytics.pnl.heldCommission"
              explainKey="analytics.explain.heldCommission"
            />
          }
          value={pnl ? formatCurrency(pnl.heldCommission, locale) : '—'}
          sublabel={t('analytics.pnl.heldHint')}
          icon={Hourglass}
          accent="amber"
          isLoading={isLoading}
        />
      </motion.div>
    </div>
  );
}
