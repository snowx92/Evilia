'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Wallet as WalletIcon,
  Search,
  TrendingUp,
  Coins,
  Banknote,
  ArrowUpRight,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { MetricCard } from '@/components/shared/metric-card';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DemoBadge } from '@/features/analytics/demo-badge';
import { useWalletsListQuery } from '@/hooks/queries/use-wallets';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { cn, formatCurrency, formatDateTime } from '@/lib/utils';
import { fadeUp, stagger } from '@/lib/motion';
import { DEFAULT_PAGE_SIZE } from '@/constants/admin';
import type { WalletSnapshot } from '@/types/admin/wallets';

const ROLE_TONE: Record<string, 'brand' | 'success' | 'warning' | 'muted'> = {
  admin: 'warning',
  'sub-admin': 'warning',
  leader: 'success',
  seller: 'brand',
};

function MiniBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
  return (
    <div className="min-w-0 flex-1 leading-tight">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function WalletRow({ w }: { w: WalletSnapshot }) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const denominator = Math.max(w.totalEarned, 1);

  return (
    <motion.div
      variants={fadeUp}
      className="group rounded-2xl border border-border/70 bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <Link
        href={`/admin/wallets/${encodeURIComponent(w.userId)}`}
        className="grid grid-cols-1 items-center gap-5 p-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.4fr)_auto]"
      >
        {/* Identity */}
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-11 w-11">
            <AvatarFallback>{getInitials(w.displayName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold">{w.displayName}</p>
              {w.role && (
                <Badge variant={ROLE_TONE[w.role] ?? 'outline'} className="text-[10px]">
                  {t(`role.${w.role}`)}
                </Badge>
              )}
            </div>
            <p className="truncate text-[11px] text-muted-foreground">
              {w.email}
              {w.sellerCode ? ` · ${w.sellerCode}` : ''}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground/80">{w.userId}</p>
          </div>
        </div>

        {/* Balance */}
        <div className="leading-tight">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {t('wallets.balance')}
          </p>
          <p className="text-2xl font-semibold tabular-nums">
            {formatCurrency(w.balance, locale)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {t('wallets.lastUpdated')}: {formatDateTime(w.updatedAt, locale)}
          </p>
        </div>

        {/* Breakdown bars */}
        <div className="hidden gap-4 lg:flex">
          <MiniBar
            label={t('wallets.available')}
            value={w.available}
            total={denominator}
            color="#4f46e5"
          />
          <MiniBar
            label={t('wallets.pendingWithdrawal')}
            value={w.pendingWithdrawal}
            total={denominator}
            color="#f59e0b"
          />
          <MiniBar
            label={t('wallets.totalWithdrawn')}
            value={w.totalWithdrawn}
            total={denominator}
            color="#10b981"
          />
        </div>

        {/* CTA */}
        <span
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary opacity-0 transition-opacity',
            'group-hover:opacity-100',
          )}
          aria-hidden="true"
        >
          <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
        </span>
      </Link>

      {/* Mobile breakdown */}
      <div className="grid gap-4 border-t border-border/60 p-5 lg:hidden">
        <MiniBar
          label={t('wallets.available')}
          value={w.available}
          total={denominator}
          color="#4f46e5"
        />
        <MiniBar
          label={t('wallets.pendingWithdrawal')}
          value={w.pendingWithdrawal}
          total={denominator}
          color="#f59e0b"
        />
        <MiniBar
          label={t('wallets.totalWithdrawn')}
          value={w.totalWithdrawn}
          total={denominator}
          color="#10b981"
        />
      </div>
    </motion.div>
  );
}

export default function WalletsPage() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const params = { page, limit: DEFAULT_PAGE_SIZE, ...(search ? { search } : {}) };
  const query = useWalletsListQuery(params);
  const data = query.data;
  const items = data?.items ?? [];

  const kpis = useMemo(() => {
    const stats = { balance: 0, earned: 0, withdrawn: 0, pending: 0 };
    items.forEach((w) => {
      stats.balance += w.balance;
      stats.earned += w.totalEarned;
      stats.withdrawn += w.totalWithdrawn;
      stats.pending += w.pendingWithdrawal;
    });
    return stats;
  }, [items]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-2">
            {t('nav.wallets')}
            <span className="inline-flex h-2 w-2 rounded-full bg-warning ring-2 ring-warning/30" />
            <span className="text-[10px] font-medium normal-case text-warning-foreground/80">
              {t('backend.pending')}
            </span>
          </span>
        }
        title={t('wallets.title')}
        description={t('transaction.description')}
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <MetricCard
          label={t('wallets.balance')}
          value={formatCurrency(kpis.balance, locale)}
          icon={WalletIcon}
          accent="indigo"
          isLoading={query.isLoading}
        />
        <MetricCard
          label={t('wallets.totalEarned')}
          value={formatCurrency(kpis.earned, locale)}
          icon={TrendingUp}
          accent="emerald"
          isLoading={query.isLoading}
        />
        <MetricCard
          label={t('wallets.pendingWithdrawal')}
          value={formatCurrency(kpis.pending, locale)}
          icon={Coins}
          accent="amber"
          isLoading={query.isLoading}
        />
        <MetricCard
          label={t('wallets.totalWithdrawn')}
          value={formatCurrency(kpis.withdrawn, locale)}
          icon={Banknote}
          accent="rose"
          isLoading={query.isLoading}
        />
      </motion.div>

      <Card>
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t('common.search')}
              className="ps-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">
          {t('wallets.title')}
        </p>
        <DemoBadge show={Boolean(query.isDemo)} />
      </div>

      {query.isError ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : query.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <EmptyState title={t('common.noResults')} description={t('wallets.title')} />
          </CardContent>
        </Card>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
          {items.map((w) => (
            <WalletRow key={w.userId} w={w} />
          ))}
        </motion.div>
      )}

      {data && data.totalPages > 1 && (
        <PaginationBar
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          totalItems={data.totalItems}
          onChange={setPage}
        />
      )}
    </div>
  );
}
