'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, ScrollText, Users, Wallet, ArrowRight, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { MetricCard } from '@/components/shared/metric-card';
import { Button } from '@/components/ui/button';
import { useDailyAnalyticsQuery } from '@/hooks/queries/use-analytics';
import { useTranslation } from '@/hooks/use-translation';
import { useAuthStore } from '@/store/auth';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { stagger } from '@/lib/motion';
import { WalletCompositionCard } from '@/features/dashboard/wallet-composition-card';
import { RecentActivityCard } from '@/features/dashboard/recent-activity-card';

export default function DashboardPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const wallet = useAuthStore((s) => s.wallet);
  const locale = useLocaleStore((s) => s.locale);
  const daily = useDailyAnalyticsQuery();
  const data = daily.data;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border border-border/70 bg-brand-soft p-8 shadow-card"
      >
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium text-primary shadow-sm ring-1 ring-primary/15">
              <Sparkles className="h-3 w-3" />
              {data?.date ? formatDate(data.date, locale) : t('dashboard.today')}
            </span>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight">
              {t('auth.welcomeBack')}
              {user ? <>،&nbsp;<span className="text-brand-gradient">{user.displayName}</span></> : ''}
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground">{t('app.title')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="gradient" size="lg" asChild>
              <Link href="/admin/analytics">
                {t('analytics.title')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/admin/withdrawals">{t('withdrawals.title')}</Link>
            </Button>
          </div>
        </div>
      </motion.section>

      <PageHeader
        eyebrow={t('dashboard.title')}
        title={t('nav.dashboard')}
        description={t('analytics.daily')}
      />

      {/* KPI grid */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <MetricCard
          label={t('dashboard.totalSales')}
          value={data ? formatCurrency(data.totalSales, locale) : '—'}
          icon={TrendingUp}
          isLoading={daily.isLoading}
          accent="indigo"
        />
        <MetricCard
          label={t('dashboard.totalCommissions')}
          value={data ? formatCurrency(data.totalCommissions, locale) : '—'}
          icon={ScrollText}
          isLoading={daily.isLoading}
          accent="emerald"
        />
        <MetricCard
          label={t('dashboard.activeUsers')}
          value={data ? formatNumber(data.activeUsers, locale) : '—'}
          icon={Users}
          isLoading={daily.isLoading}
          accent="amber"
        />
        <MetricCard
          label={t('wallets.balance')}
          value={wallet ? formatCurrency(wallet.balance, locale) : '—'}
          icon={Wallet}
          accent="rose"
        />
      </motion.div>

      {/* Composition + Activity */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WalletCompositionCard />
        </div>
        <RecentActivityCard />
      </div>
    </div>
  );
}
