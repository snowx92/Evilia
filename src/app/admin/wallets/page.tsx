'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Wallet as WalletIcon,
  Search,
  TrendingUp,
  Coins,
  Banknote,
  ArrowUpRight,
  ShoppingCart,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { MetricCard } from '@/components/shared/metric-card';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage, getInitials } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useWalletsListQuery, useWalletsSummaryQuery } from '@/hooks/queries/use-wallets';
import { ResetWalletDialog } from '@/features/wallets/reset-wallet-dialog';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { cn, formatCurrency, formatDateTime, formatNumber } from '@/lib/utils';
import { fadeUp, stagger } from '@/lib/motion';
import { DEFAULT_PAGE_SIZE } from '@/constants/admin';
import type { WalletListRow } from '@/types/admin/wallets';

const ROLE_TONE: Record<string, 'brand' | 'success' | 'warning' | 'muted'> = {
  admin: 'warning',
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

function WalletCard({ row }: { row: WalletListRow }) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const { user, wallet } = row;
  const denominator = Math.max(wallet.totalEarned, 1);
  const onGoing = wallet.onGoingOrdersBalance ?? 0;

  return (
    <motion.div
      variants={fadeUp}
      className="group rounded-2xl border border-border/70 bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <Link
        href={`/admin/wallets/${encodeURIComponent(user.id)}`}
        className="grid grid-cols-1 items-center gap-5 p-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.4fr)_auto]"
      >
        {/* Identity */}
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-11 w-11">
            {user.profileImageUrl && (
              <AvatarImage src={user.profileImageUrl} alt={user.displayName} />
            )}
            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold">{user.displayName}</p>
              {user.role && (
                <Badge variant={ROLE_TONE[user.role] ?? 'outline'} className="text-[10px]">
                  {t(`role.${user.role}`)}
                </Badge>
              )}
            </div>
            <p className="truncate text-[11px] text-muted-foreground">
              {user.email}
              {user.sellerCode ? ` · ${user.sellerCode}` : ''}
            </p>
          </div>
        </div>

        {/* Balance */}
        <div className="leading-tight">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {t('wallets.balance')}
          </p>
          <p className="text-2xl font-semibold tabular-nums">
            {formatCurrency(wallet.balance, locale)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {t('wallets.lastUpdated')}: {formatDateTime(wallet.updatedAt, locale)}
          </p>
        </div>

        {/* Breakdown bars */}
        <div className="hidden gap-4 lg:flex">
          <MiniBar
            label={t('wallets.available')}
            value={wallet.available}
            total={denominator}
            color="#4f46e5"
          />
          <MiniBar
            label={t('wallets.pendingWithdrawal')}
            value={wallet.pendingWithdrawal}
            total={denominator}
            color="#f59e0b"
          />
          <MiniBar
            label={t('wallets.onGoingOrders')}
            value={onGoing}
            total={denominator}
            color="#8b5cf6"
          />
          <MiniBar
            label={t('wallets.totalWithdrawn')}
            value={wallet.totalWithdrawn}
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
          value={wallet.available}
          total={denominator}
          color="#4f46e5"
        />
        <MiniBar
          label={t('wallets.pendingWithdrawal')}
          value={wallet.pendingWithdrawal}
          total={denominator}
          color="#f59e0b"
        />
        <MiniBar
          label={t('wallets.totalWithdrawn')}
          value={wallet.totalWithdrawn}
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

  const summary = useWalletsSummaryQuery();
  const listParams = { page, limit: DEFAULT_PAGE_SIZE, ...(search ? { search } : {}) };
  const query = useWalletsListQuery(listParams);
  const data = query.data;
  const items = data?.items ?? [];
  const s = summary.data;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t('nav.wallets')}
        title={t('wallets.title')}
        description={
          s
            ? `${formatNumber(s.walletCount, locale)} ${t('wallets.title').toLowerCase()}`
            : undefined
        }
        actions={<ResetWalletDialog />}
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      >
        <MetricCard
          label={t('wallets.balance')}
          value={s ? formatCurrency(s.totalBalance, locale) : '—'}
          icon={WalletIcon}
          accent="indigo"
          isLoading={summary.isLoading}
        />
        <MetricCard
          label={t('wallets.totalEarned')}
          value={s ? formatCurrency(s.totalEarned, locale) : '—'}
          icon={TrendingUp}
          accent="emerald"
          isLoading={summary.isLoading}
        />
        <MetricCard
          label={t('wallets.pendingWithdrawal')}
          value={s ? formatCurrency(s.totalPendingWithdrawal, locale) : '—'}
          icon={Coins}
          accent="amber"
          isLoading={summary.isLoading}
        />
        <MetricCard
          label={t('wallets.onGoingOrders')}
          value={s ? formatCurrency(s.totalOnGoingOrdersBalance ?? 0, locale) : '—'}
          icon={ShoppingCart}
          accent="indigo"
          isLoading={summary.isLoading}
        />
        <MetricCard
          label={t('wallets.totalWithdrawn')}
          value={s ? formatCurrency(s.totalWithdrawn, locale) : '—'}
          icon={Banknote}
          accent="rose"
          isLoading={summary.isLoading}
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

      {query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
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
          {items.map((row) => (
            <WalletCard key={row.user.id} row={row} />
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
