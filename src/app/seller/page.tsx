'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Banknote,
  Coins,
  Copy,
  ExternalLink,
  Percent,
  QrCode as QrIcon,
  ScrollText,
  Share2,
  Sparkles,
  TrendingUp,
  Users2,
  Wallet as WalletIcon,
} from 'lucide-react';
import { QrCode } from '@/components/shared/qr-code';
import { PageHeader } from '@/components/shared/page-header';
import { MetricCard } from '@/components/shared/metric-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import {
  useSellerCommissionsQuery,
  useSellerNetworkQuery,
  useSellerNetworkRevenueQuery,
  useSellerSalesQuery,
  useSellerWalletQuery,
} from '@/hooks/queries/use-seller';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useTranslation } from '@/hooks/use-translation';
import { useAuthStore } from '@/store/auth';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';
import { stagger } from '@/lib/motion';

// ─── Commission rates card ───────────────────────────────────────────────────

function CommissionRatesCard() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const user = useAuthStore((s) => s.user);
  const direct = user?.directCommissionPercentage ?? user?.commissionPercentage ?? 0;
  const network = user?.networkCommissionPercentage ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-4 w-4 text-primary" />
          {t('seller.commissionRates')}
        </CardTitle>
        <CardDescription>{t('seller.commissionRatesDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-success/20 bg-success-soft/40 p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-success">
              {t('users.fields.directCommissionPercentage')}
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums text-success">
              {formatPercent(direct, locale)}
            </p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-primary-soft/40 p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
              {t('users.fields.networkCommissionPercentage')}
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums text-primary">
              {formatPercent(network, locale)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Affiliate links card ────────────────────────────────────────────────────

function AffiliateLinksCard() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const links = user?.affiliateLinks ?? [];

  const copy = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success(t('seller.linkCopied'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  const share = async (link: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: user?.displayName ?? 'Evilia',
          url: link,
        });
      } catch {
        // User cancelled — no-op.
      }
    } else {
      void copy(link);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-primary" />
          {t('seller.yourAffiliateLinks')}
        </CardTitle>
        <CardDescription>{t('seller.shareWithNetwork')}</CardDescription>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <EmptyState
            title={t('seller.noAffiliateLinks')}
            description={t('users.fields.affiliateLinksDesc')}
            className="py-6"
          />
        ) : (
          <ul className="space-y-2">
            {links.map((link, idx) => (
              <AffiliateLinkRow
                key={`${link}-${idx}`}
                link={link}
                onCopy={() => copy(link)}
                onShare={() => share(link)}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function AffiliateLinkRow({
  link,
  onCopy,
  onShare,
}: {
  link: string;
  onCopy: () => void;
  onShare: () => void;
}) {
  const { t } = useTranslation();
  const [showQr, setShowQr] = useState(false);

  return (
    <li className="rounded-xl border border-border/70 bg-card shadow-card transition-colors hover:border-primary/40">
      <div className="flex items-center gap-2 p-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
          <Share2 className="h-3.5 w-3.5" />
        </span>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          dir="ltr"
          className="min-w-0 flex-1 truncate text-[13px] font-medium hover:text-primary hover:underline"
          title={link}
        >
          {link}
        </a>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onCopy}
          aria-label={t('seller.copyLink')}
          title={t('seller.copyLink')}
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onShare}
          aria-label={t('seller.shareNow')}
          title={t('seller.shareNow')}
        >
          <Share2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setShowQr((v) => !v)}
          aria-label={t('seller.qrCode')}
          title={t('seller.qrCode')}
        >
          <QrIcon className="h-3.5 w-3.5" />
        </Button>
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          title={t('common.view')}
          aria-label={t('common.view')}
        >
          <a href={link} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      </div>
      {showQr && (
        <div className="flex flex-col items-center gap-2 border-t border-border/60 p-4">
          <QrCode value={link} size={140} />
          <p className="text-[11px] text-muted-foreground">{t('seller.scanToOpen')}</p>
        </div>
      )}
    </li>
  );
}

// ─── Earnings calculator ─────────────────────────────────────────────────────

function EarningsCalculator() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const user = useAuthStore((s) => s.user);
  const [amount, setAmount] = useState<number>(1000);
  const direct = user?.directCommissionPercentage ?? user?.commissionPercentage ?? 0;
  const network = user?.networkCommissionPercentage ?? 0;
  const directEarn = (amount * direct) / 100;
  const networkEarn = (amount * network) / 100;
  const total = directEarn + networkEarn;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-4 w-4 text-primary" />
          {t('seller.earningsCalculator')}
        </CardTitle>
        <CardDescription>{t('seller.calculatorDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {t('seller.ifYouSell')}
          </label>
          <input
            type="range"
            min={0}
            max={50000}
            step={100}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full accent-success"
          />
          <p className="text-lg font-bold tabular-nums">
            {formatCurrency(amount, locale)}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-success-soft/60 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {t('seller.directEarn')}
            </p>
            <p className="mt-1 text-base font-bold tabular-nums text-success">
              {formatCurrency(directEarn, locale)}
            </p>
          </div>
          <div className="rounded-xl bg-primary-soft/60 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {t('seller.networkEarn')}
            </p>
            <p className="mt-1 text-base font-bold tabular-nums text-primary">
              {formatCurrency(networkEarn, locale)}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-3 shadow-card">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {t('seller.totalEarn')}
            </p>
            <p className="mt-1 text-base font-bold tabular-nums">
              {formatCurrency(total, locale)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SellerDashboardPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('nav.dashboard'));
  const user = useAuthStore((s) => s.user);
  const locale = useLocaleStore((s) => s.locale);

  const wallet = useSellerWalletQuery();
  const revenue = useSellerNetworkRevenueQuery();
  const network = useSellerNetworkQuery();
  const sales = useSellerSalesQuery({ page: 1, limit: 5 });
  const commissions = useSellerCommissionsQuery({ page: 1, limit: 5 });

  const w = wallet.data;
  const r = revenue.data;
  const networkSize = network.data?.length ?? 0;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border border-success/20 bg-[radial-gradient(120%_120%_at_100%_0%,hsl(160_85%_92%)_0%,hsl(160_85%_98%)_40%,hsl(0_0%_100%)_100%)] p-8 shadow-card"
      >
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-medium text-success shadow-sm ring-1 ring-success/15">
              <Sparkles className="h-3 w-3" />
              {t('seller.portal')}
            </span>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight">
              {t('auth.welcomeBack')}
              {user ? <>،&nbsp;<span className="text-success">{user.displayName}</span></> : ''}
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground">{t('seller.subtitle')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="lg" className="bg-success text-white hover:bg-success/90">
              <Link href="/seller/withdrawals">
                {t('seller.requestWithdrawal')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/seller/network">{t('seller.nav.network')}</Link>
            </Button>
          </div>
        </div>
      </motion.section>

      <PageHeader
        eyebrow={t('seller.portal')}
        title={t('nav.dashboard')}
        description={r?.month ? `${t('analytics.monthly')} · ${r.month}` : undefined}
      />

      {/* KPI grid */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <MetricCard
          label={t('wallets.balance')}
          value={w ? formatCurrency(w.balance, locale) : '—'}
          sublabel={
            w
              ? `${t('wallets.available')}: ${formatCurrency(w.available, locale)}`
              : undefined
          }
          icon={WalletIcon}
          accent="emerald"
          isLoading={wallet.isLoading}
        />
        <MetricCard
          label={t('seller.totalEarned')}
          value={w ? formatCurrency(w.totalEarned, locale) : '—'}
          sublabel={
            w
              ? `${t('wallets.totalWithdrawn')}: ${formatCurrency(w.totalWithdrawn, locale)}`
              : undefined
          }
          icon={Coins}
          accent="indigo"
          isLoading={wallet.isLoading}
        />
        <MetricCard
          label={t('seller.networkRevenue')}
          value={r ? formatCurrency(r.salesTotal, locale) : '—'}
          sublabel={
            r
              ? `${t('dashboard.totalCommissions')}: ${formatCurrency(r.commissionTotal, locale)}`
              : undefined
          }
          icon={TrendingUp}
          accent="amber"
          isLoading={revenue.isLoading}
        />
        <MetricCard
          label={t('seller.networkSize')}
          value={formatNumber(networkSize, locale)}
          icon={Users2}
          accent="rose"
          isLoading={network.isLoading}
        />
      </motion.div>

      {/* Recent sales + commissions */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                {t('seller.nav.sales')}
              </CardTitle>
              <CardDescription>{t('seller.recentSales')}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/seller/sales" className="gap-1">
                {t('common.view')}
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {sales.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : !sales.data?.items.length ? (
              <EmptyState title={t('common.noResults')} className="py-8" />
            ) : (
              <ul className="divide-y divide-border/40">
                {sales.data.items.map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-2.5">
                    <div className="flex min-w-0 flex-col leading-tight">
                      <span className="truncate text-sm font-medium">{s.externalId}</span>
                      <span className="font-mono text-[10px] text-muted-foreground/70">
                        {s.id}
                      </span>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {formatCurrency(s.amount, locale, s.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-primary" />
                {t('seller.nav.commissions')}
              </CardTitle>
              <CardDescription>{t('seller.recentCommissions')}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/seller/commissions" className="gap-1">
                {t('common.view')}
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {commissions.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : !commissions.data?.items.length ? (
              <EmptyState title={t('common.noResults')} className="py-8" />
            ) : (
              <ul className="divide-y divide-border/40">
                {commissions.data.items.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-2.5">
                    <div className="flex min-w-0 flex-col leading-tight">
                      <span className="text-sm font-medium">
                        {formatCurrency(c.amount, locale)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {c.percentage}% · {formatCurrency(c.saleAmount, locale)}
                      </span>
                    </div>
                    <Badge variant="success" className="text-[10px]">
                      +{formatCurrency(c.amount, locale)}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Commission rates + Affiliate links */}
      <div className="grid gap-5 lg:grid-cols-2">
        <CommissionRatesCard />
        <AffiliateLinksCard />
      </div>

      {/* Earnings calculator */}
      <EarningsCalculator />

      {/* Quick wallet snapshot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-primary" />
            {t('wallets.title')}
          </CardTitle>
          <CardDescription>
            {w
              ? `${t('wallets.lastUpdated')}: ${new Date(String(w.updatedAt)).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')}`
              : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {wallet.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : w ? (
            <dl className="grid gap-4 sm:grid-cols-4">
              {[
                { label: t('wallets.balance'), value: w.balance },
                { label: t('wallets.available'), value: w.available },
                { label: t('wallets.pendingWithdrawal'), value: w.pendingWithdrawal },
                { label: t('wallets.totalWithdrawn'), value: w.totalWithdrawn },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </p>
                  <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">
                    {formatCurrency(s.value, locale)}
                  </p>
                </div>
              ))}
            </dl>
          ) : (
            <EmptyState title={t('common.noResults')} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
