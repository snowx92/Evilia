'use client';

import { motion } from 'framer-motion';
import { TrendingUp, ScrollText, Users, Wallet, Sparkles } from 'lucide-react';
import { MetricCard } from '@/components/shared/metric-card';
import { ExplainLabel } from '@/components/shared/explain-label';
import { WalletStatLabel } from '@/components/shared/wallet-stat-label';
import { useDailyAnalyticsQuery } from '@/hooks/queries/use-analytics';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useTranslation } from '@/hooks/use-translation';
import { useAuthStore } from '@/store/auth';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { stagger } from '@/lib/motion';
import { SalesStatusCards } from '@/features/analytics/sales-status-cards';

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
  const wallet = useAuthStore((s) => s.wallet);
  const locale = useLocaleStore((s) => s.locale);
  const daily = useDailyAnalyticsQuery();
  const data = daily.data;

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

      <section className="space-y-4">
        <SectionHeader
          title={t('dashboard.section.today')}
          description={t('dashboard.section.todayDesc')}
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
          <MetricCard
            label={<WalletStatLabel stat="balance" />}
            value={wallet ? formatCurrency(wallet.balance, locale) : '—'}
            sublabel={t('dashboard.yourAdminWallet')}
            icon={Wallet}
            accent="rose"
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
