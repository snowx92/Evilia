'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { format, parseISO, subMonths } from 'date-fns';
import { motion } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  BarChart3,
  Calendar,
  Coins,
  Crown,
  Link as LinkIcon,
  KeyRound,
  Mail,
  Pencil,
  Phone,
  ScrollText,
  ShieldCheck,
  ShieldOff,
  TrendingUp,
  Users2,
  Wallet as WalletIcon,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '@/components/shared/page-header';
import { MetricCard } from '@/components/shared/metric-card';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { RoleBadge } from '@/components/shared/role-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage, getInitials } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import {
  useActivateUserMutation,
  useSuspendUserMutation,
  useUserQuery,
} from '@/hooks/queries/use-users';
import { EditUserDialog } from '@/features/users/edit-user-dialog';
import { ResetPasswordDialog } from '@/features/users/reset-password-dialog';
import { SaleRow } from '@/features/sales/sale-row';
import { SalesStatusCards } from '@/features/analytics/sales-status-cards';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSalesQuery } from '@/hooks/queries/use-sales';
import { DEFAULT_PAGE_SIZE, SALE_STATUSES } from '@/constants/admin';
import type { SaleStatus } from '@/types/admin/sales';
import {
  useUserMonthlyAnalyticsQuery,
  useUserMonthlyHistoryQuery,
} from '@/hooks/queries/use-analytics';
import {
  useWalletQuery,
  useWalletTransactionsQuery,
} from '@/hooks/queries/use-wallets';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { cn, formatCurrency, formatDate, formatDateTime, formatPercent } from '@/lib/utils';
import { fadeUp, stagger } from '@/lib/motion';
import { getSafeTxDescription } from '@/lib/transaction-description';
import { WalletStatLabel } from '@/components/shared/wallet-stat-label';
import { ApiError } from '@/types/api';

// ─── Identity card ───────────────────────────────────────────────────────────

function IdentityCard({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const user = useUserQuery(userId);
  const suspend = useSuspendUserMutation();
  const activate = useActivateUserMutation();
  const u = user.data;

  const onToggleStatus = async () => {
    if (!u || !userId) return;
    const isActive = u.status === 'active';
    const confirmMsg = isActive ? 'users.confirmSuspend' : 'users.confirmActivate';
    if (!window.confirm(t(confirmMsg))) return;
    try {
      // Use the URL-param id so we never depend on the (possibly stale) fetched user.
      if (isActive) await suspend.mutateAsync(userId);
      else await activate.mutateAsync(userId);
      toast.success(t('common.save'));
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  };

  if (user.isError) return <ErrorState onRetry={() => user.refetch()} />;
  if (user.isLoading || !u) return <Skeleton className="h-44 w-full rounded-3xl" />;

  return (
    <motion.div variants={fadeUp}>
      <Card>
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative shrink-0">
              <Avatar className="h-20 w-20 ring-4 ring-primary-soft">
                {u.profileImageUrl ? (
                  <AvatarImage src={u.profileImageUrl} alt={u.displayName} />
                ) : null}
                <AvatarFallback className="text-xl">
                  {getInitials(u.displayName)}
                </AvatarFallback>
              </Avatar>
              {u.isSuperAdmin && (
                <span className="absolute -end-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-warning text-warning-foreground shadow-card">
                  <Crown className="h-3 w-3" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">{u.displayName}</h2>
                <RoleBadge role={u.role} />
                <StatusBadge status={u.status} />
                {u.isSuperAdmin && (
                  <Badge variant="warning" className="gap-1">
                    <Crown className="h-3 w-3" />
                    {t('users.fields.isSuperAdmin')}
                  </Badge>
                )}
              </div>
              <p className="truncate text-sm text-muted-foreground">{u.email}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                {u.sellerCode && (
                  <span className="rounded-full bg-muted px-2 py-0.5 font-mono">
                    {u.sellerCode}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(u.createdAt, locale)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <EditUserDialog
              user={u}
              trigger={
                <Button variant="default" size="sm">
                  <Pencil className="h-4 w-4" />
                  {t('users.actions.editUser')}
                </Button>
              }
            />
            <ResetPasswordDialog
              user={u}
              trigger={
                <Button variant="outline" size="sm">
                  <KeyRound className="h-4 w-4" />
                  {t('users.actions.resetPassword')}
                </Button>
              }
            />
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/wallets/${encodeURIComponent(u.id)}`}>
                <WalletIcon className="h-4 w-4" />
                {t('users.actions.viewWallet')}
              </Link>
            </Button>
            <Button
              variant={u.status === 'active' ? 'outline' : 'default'}
              size="sm"
              onClick={onToggleStatus}
              disabled={suspend.isPending || activate.isPending}
            >
              {u.status === 'active' ? (
                <>
                  <ShieldOff className="h-4 w-4" />
                  {t('users.actions.suspend')}
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  {t('users.actions.activate')}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Contact info ────────────────────────────────────────────────────────────

function ContactCard({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const user = useUserQuery(userId);
  const u = user.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('users.detail.contact')}</CardTitle>
        <CardDescription>{t('users.detail.overview')}</CardDescription>
      </CardHeader>
      <CardContent>
        {user.isLoading || !u ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <dl className="grid gap-5 sm:grid-cols-2">
            <InfoRow icon={Mail} label={t('common.email')} value={u.email} ltr />
            <InfoRow
              icon={Phone}
              label={t('common.phone')}
              value={u.phone ?? t('users.detail.noPhone')}
              ltr
              muted={!u.phone}
            />
            <InfoRow
              icon={LinkIcon}
              label={t('users.fields.socialMediaLink')}
              value={u.socialMediaLink ?? t('users.detail.noSocial')}
              href={u.socialMediaLink ?? undefined}
              ltr
              muted={!u.socialMediaLink}
            />
            <InfoRow
              icon={BadgeCheck}
              label={t('users.fields.directCommissionPercentage')}
              value={formatPercent(
                u.directCommissionPercentage ?? u.commissionPercentage ?? 0,
                locale,
              )}
            />
            <InfoRow
              icon={BadgeCheck}
              label={t('users.fields.networkCommissionPercentage')}
              value={formatPercent(u.networkCommissionPercentage ?? 0, locale)}
            />
            {u.parentId && <ParentInfoRow parentId={u.parentId} />}
            {u.affiliateLinks && u.affiliateLinks.length > 0 && (
              <div className="sm:col-span-2">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t('users.fields.affiliateLinks')}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {u.affiliateLinks.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        dir="ltr"
                        className="inline-flex max-w-full items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary/50 hover:bg-primary-soft hover:text-primary"
                        title={link}
                      >
                        <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{link.replace(/^https?:\/\//, '')}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {u.permissions && u.permissions.length > 0 && (
              <div className="sm:col-span-2">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t('users.fields.permissions')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {u.permissions.map((p) => (
                    <Badge key={p} variant="muted" className="font-mono text-[10px]">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}

function ParentInfoRow({ parentId }: { parentId: string }) {
  const { t } = useTranslation();
  const parent = useUserQuery(parentId);
  const name = parent.data?.displayName;
  return (
    <InfoRow
      icon={Users2}
      label={t('users.fields.parentId')}
      value={name ?? t('common.loading')}
      href={`/admin/users/${encodeURIComponent(parentId)}`}
      muted={!name}
    />
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
  ltr,
  muted,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
  ltr?: boolean;
  muted?: boolean;
}) {
  const body = (
    <span
      className={cn(
        'truncate text-sm',
        muted ? 'text-muted-foreground' : 'font-medium',
        href && !muted && 'text-primary hover:underline',
      )}
      dir={ltr ? 'ltr' : undefined}
    >
      {value}
    </span>
  );
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {href ? (
          <Link href={href} target={href.startsWith('http') ? '_blank' : undefined}>
            {body}
          </Link>
        ) : (
          <div>{body}</div>
        )}
      </div>
    </div>
  );
}

// ─── Wallet ──────────────────────────────────────────────────────────────────

function WalletSection({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const wallet = useWalletQuery(userId);
  const [txPage, setTxPage] = useState(1);
  const txs = useWalletTransactionsQuery(userId, { page: txPage, limit: 10 });
  const w = wallet.data;

  return (
    <div className="space-y-5">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      >
        <MetricCard
          compact
          label={<WalletStatLabel stat="balance" />}
          value={formatCurrency(w?.balance, locale)}
          icon={WalletIcon}
          accent="indigo"
          isLoading={wallet.isLoading}
        />
        <MetricCard
          compact
          label={<WalletStatLabel stat="available" />}
          value={formatCurrency(w?.available, locale)}
          icon={Coins}
          accent="emerald"
          isLoading={wallet.isLoading}
        />
        <MetricCard
          compact
          label={<WalletStatLabel stat="pendingWithdrawal" />}
          value={formatCurrency(w?.pendingWithdrawal, locale)}
          icon={Banknote}
          accent="amber"
          isLoading={wallet.isLoading}
        />
        <MetricCard
          compact
          label={<WalletStatLabel stat="onGoingOrders" />}
          value={formatCurrency(w?.onGoingOrdersBalance, locale)}
          icon={TrendingUp}
          accent="indigo"
          isLoading={wallet.isLoading}
        />
        <MetricCard
          compact
          label={<WalletStatLabel stat="totalEarned" />}
          value={formatCurrency(w?.totalEarned, locale)}
          icon={TrendingUp}
          accent="rose"
          isLoading={wallet.isLoading}
        />
        <MetricCard
          compact
          label={<WalletStatLabel stat="totalWithdrawn" />}
          value={formatCurrency(w?.totalWithdrawn, locale)}
          icon={Banknote}
          accent="indigo"
          isLoading={wallet.isLoading}
        />
      </motion.div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>{t('users.detail.transactions')}</CardTitle>
            <CardDescription>
              {w
                ? `${t('wallets.lastUpdated')}: ${formatDateTime(w.updatedAt, locale)}`
                : ''}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {txs.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : !txs.data?.items.length ? (
            <EmptyState title={t('common.noResults')} className="py-8" />
          ) : (
            <ul className="divide-y divide-border/40">
              {txs.data.items.map((tx) => {
                const outflow = tx.type === 'withdrawal';
                const Arrow = outflow ? ArrowUpRight : ArrowDownLeft;
                return (
                  <li key={tx.id} className="flex items-center gap-3 py-3">
                    <span
                      className={cn(
                        'grid h-9 w-9 place-items-center rounded-xl',
                        outflow
                          ? 'bg-destructive-soft text-destructive'
                          : 'bg-success-soft text-success',
                      )}
                    >
                      <Arrow className="h-4 w-4" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="truncate text-sm font-medium">
                        {getSafeTxDescription(tx.type, tx.description) ??
                          t(`transaction.type.${tx.type}`)}
                      </span>
                      <span className="truncate text-[11px] text-muted-foreground">
                        {t(`transaction.type.${tx.type}`)} · {formatDateTime(tx.createdAt, locale)}
                      </span>
                    </div>
                    <div className="text-end leading-tight">
                      <p
                        className={cn(
                          'text-sm font-semibold tabular-nums',
                          outflow ? 'text-destructive' : 'text-success',
                        )}
                      >
                        {outflow ? '−' : '+'} {formatCurrency(tx.amount, locale)}
                      </p>
                      {tx.balanceAfter !== undefined && (
                        <p className="text-[10px] text-muted-foreground">
                          → {formatCurrency(tx.balanceAfter, locale)}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {txs.data && txs.data.totalPages > 1 && (
            <PaginationBar
              currentPage={txs.data.currentPage}
              totalPages={txs.data.totalPages}
              totalItems={txs.data.totalItems}
              onChange={setTxPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Analytics (monthly + history) ───────────────────────────────────────────

function AnalyticsSection({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const today = format(new Date(), 'yyyy-MM');
  const [month, setMonth] = useState(today);
  const [fromMonth, setFromMonth] = useState(() =>
    format(subMonths(parseISO(`${today}-01`), 5), 'yyyy-MM'),
  );
  const [toMonth, setToMonth] = useState(today);

  // Guard against an inverted range — swap so the API still gets a valid call.
  const safeRange =
    fromMonth > toMonth ? { fromMonth: toMonth, toMonth: fromMonth } : { fromMonth, toMonth };

  const monthly = useUserMonthlyAnalyticsQuery(userId, month);
  const history = useUserMonthlyHistoryQuery(userId, safeRange);

  const m = monthly.data;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              {t('users.detail.analytics')}
            </CardTitle>
            <CardDescription>{t('analytics.monthly')}</CardDescription>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">{t('analytics.month')}</Label>
            <Input
              type="month"
              dir="ltr"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-44"
            />
          </div>
        </CardHeader>
        <CardContent>
          {monthly.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : m ? (
            <dl className="grid gap-6 sm:grid-cols-4">
              <Stat
                label={t('dashboard.totalSales')}
                primary={formatCurrency(m.salesAmount, locale)}
                secondary={`${m.salesCount} ${t('sales.title')}`}
              />
              <Stat
                label={t('dashboard.totalCommissions')}
                primary={formatCurrency(m.commissionsEarned, locale)}
              />
              <Stat
                label={t('analytics.networkSales')}
                primary={formatCurrency(m.networkSalesAmount, locale)}
                secondary={`${m.networkSalesCount} ${t('sales.title')}`}
              />
              <Stat
                label={t('users.detail.salesCount')}
                primary={String(m.salesCount)}
                secondary={`${t('users.detail.networkCount')}: ${m.networkSalesCount}`}
              />
            </dl>
          ) : (
            <EmptyState title={t('common.noResults')} className="py-6" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>{t('users.detail.history')}</CardTitle>
            <CardDescription>
              {safeRange.fromMonth} → {safeRange.toMonth}
            </CardDescription>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px]">{t('common.from')}</Label>
              <Input
                type="month"
                dir="ltr"
                value={fromMonth}
                onChange={(e) => setFromMonth(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">{t('common.to')}</Label>
              <Input
                type="month"
                dir="ltr"
                value={toMonth}
                onChange={(e) => setToMonth(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {history.isLoading ? (
            <Skeleton className="h-60 w-full" />
          ) : !history.data?.length ? (
            <EmptyState title={t('common.noResults')} className="py-6" />
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer>
                <BarChart
                  data={history.data}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(220 13% 91%)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(220 9% 46%)' }}
                    reversed={locale === 'ar'}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(220 9% 46%)' }}
                    tickFormatter={(v: number) =>
                      new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
                        notation: 'compact',
                        maximumFractionDigits: 1,
                      }).format(v)
                    }
                    orientation={locale === 'ar' ? 'right' : 'left'}
                    width={56}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(0 0% 100%)',
                      border: '1px solid hsl(220 13% 91%)',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(value, name) => [
                      formatCurrency(Number(value) || 0, locale),
                      name === 'salesAmount'
                        ? t('dashboard.totalSales')
                        : t('dashboard.totalCommissions'),
                    ]}
                  />
                  <Bar
                    dataKey="salesAmount"
                    fill="#4f46e5"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={36}
                  />
                  <Bar
                    dataKey="commissionsEarned"
                    fill="#10b981"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Sales ───────────────────────────────────────────────────────────────────

const ALL_STATUS = '__all__';

function SalesSection({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<SaleStatus | undefined>(undefined);

  const params = {
    sellerId: userId,
    page,
    limit: DEFAULT_PAGE_SIZE,
    ...(status ? { status } : {}),
  };
  const query = useSalesQuery(params);
  const data = query.data;
  const items = data?.items ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-primary" />
            {t('users.detail.sales')}
          </CardTitle>
          {data && (
            <CardDescription>
              {t('sales.pageTotals', {
                count: String(items.length),
                total: String(data.totalItems),
              })}
            </CardDescription>
          )}
        </div>
        <Select
          value={status ?? ALL_STATUS}
          onValueChange={(v) => {
            setStatus(v === ALL_STATUS ? undefined : (v as SaleStatus));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t('sales.filterByStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUS}>{t('common.all')}</SelectItem>
            {SALE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`status.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-0">
        {query.isError ? (
          <div className="p-6">
            <ErrorState onRetry={() => query.refetch()} />
          </div>
        ) : (
          <div className="overflow-hidden rounded-b-2xl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>{t('sales.trafficSource')}</TableHead>
                  <TableHead>{t('sales.seller')}</TableHead>
                  <TableHead>{t('sales.products')}</TableHead>
                  <TableHead>{t('common.amount')}</TableHead>
                  <TableHead>{t('commissions.title')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead className="text-end">{t('common.date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={`sk-${i}`} className="border-b border-border/60">
                        {Array.from({ length: 8 }).map((__, j) => (
                          <td key={j} className="px-5 py-4">
                            <Skeleton className="h-4 w-full max-w-[120px]" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : items.map((s) => <SaleRow key={s.id} sale={s} knownSellerId={userId} />)}
              </TableBody>
            </Table>
            {!query.isLoading && items.length === 0 && (
              <div className="p-6">
                <EmptyState title={t('common.noResults')} />
              </div>
            )}
          </div>
        )}
        {data && data.totalPages > 1 && (
          <div className="p-4">
            <PaginationBar
              currentPage={data.currentPage}
              totalPages={data.totalPages}
              totalItems={data.totalItems}
              onChange={setPage}
              disabled={query.isFetching}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  primary,
  secondary,
}: {
  label: string;
  primary: string;
  secondary?: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">{primary}</p>
      {secondary && <p className="mt-0.5 text-[11px] text-muted-foreground">{secondary}</p>}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ms-3 gap-1.5">
        <Link href="/admin/users">
          <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" />
          {t('common.back')}
        </Link>
      </Button>

      <PageHeader
        eyebrow={t('users.title')}
        title={t('users.detail.overview')}
        description={t('common.profile')}
      />

      <IdentityCard userId={userId} />
      <ContactCard userId={userId} />
      <WalletSection userId={userId} />
      <AnalyticsSection userId={userId} />
      <SalesStatusCards lockedSellerId={userId} />
      <SalesSection userId={userId} />
    </div>
  );
}
