'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Trash2,
  Package,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { useSalesAnalyticsQuery } from '@/hooks/queries/use-analytics';
import { useUsersQuery } from '@/hooks/queries/use-users';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { cn, formatNumber } from '@/lib/utils';
import type {
  SalesAnalyticsBucket,
  SalesAnalyticsResponse,
  SalesAnalyticsStatus,
} from '@/types/admin/analytics';

const ALL = '__all__';
const CURRENCY = 'EGP';

/** Order matches the screenshot — `totals` is rendered separately as a banner. */
const STATUS_ORDER: SalesAnalyticsStatus[] = [
  'pending',
  'processing',
  'delivered',
  'failed',
  'deleted',
];

type Tone = 'amber' | 'sky' | 'emerald' | 'rose' | 'slate' | 'violet' | 'indigo';

const STATUS_META: Record<SalesAnalyticsStatus, { icon: LucideIcon; tone: Tone }> = {
  pending: { icon: Clock, tone: 'amber' },
  processing: { icon: Package, tone: 'sky' },
  delivered: { icon: CheckCircle2, tone: 'emerald' },
  failed: { icon: XCircle, tone: 'rose' },
  deleted: { icon: Trash2, tone: 'slate' },
};

const TONE_CLASSES: Record<
  Tone,
  { iconBg: string; iconColor: string; title: string; bar: string }
> = {
  amber: {
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    title: 'text-amber-600',
    bar: 'bg-amber-500',
  },
  sky: {
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    title: 'text-sky-600',
    bar: 'bg-sky-500',
  },
  emerald: {
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    title: 'text-emerald-600',
    bar: 'bg-emerald-500',
  },
  rose: {
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    title: 'text-rose-600',
    bar: 'bg-rose-500',
  },
  slate: {
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    title: 'text-slate-700',
    bar: 'bg-slate-500',
  },
  violet: {
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    title: 'text-violet-600',
    bar: 'bg-violet-500',
  },
  indigo: {
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    title: 'text-indigo-600',
    bar: 'bg-indigo-500',
  },
};

function statusLabel(t: (k: string) => string, key: SalesAnalyticsStatus): string {
  const i18n = t(`status.${key}`);
  // If translation is missing it returns the key itself — capitalize as fallback.
  return i18n === `status.${key}` ? key.charAt(0).toUpperCase() + key.slice(1) : i18n;
}

/** Round any float to a clean integer for display per the spec. */
function asInt(n: number | undefined | null): number {
  if (n == null || !Number.isFinite(n)) return 0;
  return Math.round(n);
}

function today(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Pulls the per-status buckets the API returned (regardless of order) and
 * normalises into a `STATUS_ORDER`-ordered list, falling back to zero buckets
 * for statuses the response didn't include.
 */
function bucketList(data: SalesAnalyticsResponse | undefined) {
  const empty: SalesAnalyticsBucket = {
    ordersCount: 0,
    totalSales: 0,
    totalCommission: 0,
    totalHoldedCommission: 0,
  };
  return STATUS_ORDER.map((status) => ({
    status,
    bucket: (data?.[status] as SalesAnalyticsBucket | undefined) ?? empty,
  }));
}

export function SalesStatusCards({
  /** Locks the seller filter to a specific user — used in the profile page. */
  lockedSellerId,
}: {
  lockedSellerId?: string;
}) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [from, setFrom] = useState<string>(today);
  const [to, setTo] = useState<string>(today);
  const [sellerId, setSellerId] = useState<string | undefined>(lockedSellerId);

  const safe = from > to ? { from: to, to: from } : { from, to };
  const params = {
    from: safe.from,
    to: safe.to,
    ...(sellerId ? { sellerId } : {}),
  };
  const query = useSalesAnalyticsQuery(params);
  const data = query.data;

  const buckets = useMemo(() => bucketList(data), [data]);
  const totals = data?.totals;
  const maxOrders = useMemo(
    () => Math.max(1, ...buckets.map((b) => b.bucket.ordersCount)),
    [buckets],
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            {t('analytics.salesByStatusTitle')}
          </CardTitle>
          <CardDescription>{t('analytics.salesByStatusDesc')}</CardDescription>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          {!lockedSellerId && (
            <SellerFilter value={sellerId} onChange={setSellerId} />
          )}
          <div className="space-y-1.5">
            <Label className="text-[11px]">{t('common.from')}</Label>
            <Input
              type="date"
              dir="ltr"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">{t('common.to')}</Label>
            <Input
              type="date"
              dir="ltr"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-40"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {query.isError ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : (
          <>
            <TotalsBanner totals={totals} isLoading={query.isLoading} locale={locale} t={t} />

            {query.isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-2xl" />
                ))}
              </div>
            ) : !data ? (
              <EmptyState title={t('common.noResults')} className="py-8" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {buckets.map(({ status, bucket }) => (
                  <StatusCard
                    key={status}
                    label={statusLabel(t, status)}
                    bucket={bucket}
                    maxOrders={maxOrders}
                    locale={locale}
                    t={t}
                    meta={STATUS_META[status] ?? { icon: Package, tone: 'violet' }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SellerFilter({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) {
  const { t } = useTranslation();
  const sellers = useUsersQuery({ limit: 100 });
  const list = sellers.data?.items ?? [];
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px]">{t('sales.seller')}</Label>
      <Select
        value={value ?? ALL}
        onValueChange={(v) => onChange(v === ALL ? undefined : v)}
      >
        <SelectTrigger className="w-52">
          <SelectValue placeholder={t('sales.seller')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t('common.all')}</SelectItem>
          {list.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.displayName}
              {u.sellerCode ? ` · ${u.sellerCode}` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function TotalsBanner({
  totals,
  isLoading,
  locale,
  t,
}: {
  totals: SalesAnalyticsBucket | undefined;
  isLoading: boolean;
  locale: 'en' | 'ar';
  t: (k: string) => string;
}) {
  if (isLoading) return <Skeleton className="h-16 w-full rounded-2xl" />;
  if (!totals) return null;
  return (
    <div className="grid gap-4 rounded-2xl border border-border/70 bg-muted/30 p-4 sm:grid-cols-4">
      <TotalsStat label={t('sales.orders')} value={asInt(totals.ordersCount)} locale={locale} />
      <TotalsStat
        label={t('dashboard.totalSales')}
        value={asInt(totals.totalSales)}
        locale={locale}
        currency
      />
      <TotalsStat
        label={t('commissions.title')}
        value={asInt(totals.totalCommission)}
        locale={locale}
        currency
      />
      <TotalsStat
        label={t('analytics.heldCommissions')}
        value={asInt(totals.totalHoldedCommission)}
        locale={locale}
        currency
      />
    </div>
  );
}

function TotalsStat({
  label,
  value,
  locale,
  currency,
}: {
  label: string;
  value: number;
  locale: 'en' | 'ar';
  currency?: boolean;
}) {
  return (
    <div className="leading-tight">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold tabular-nums">
        {formatNumber(value, locale)}
        {currency ? <span className="ms-1 text-xs font-medium text-muted-foreground">{CURRENCY}</span> : null}
      </p>
    </div>
  );
}

function StatusCard({
  label,
  bucket,
  maxOrders,
  locale,
  t,
  meta,
}: {
  label: string;
  bucket: SalesAnalyticsBucket;
  maxOrders: number;
  locale: 'en' | 'ar';
  t: (k: string) => string;
  meta: { icon: LucideIcon; tone: Tone };
}) {
  const tone = TONE_CLASSES[meta.tone];
  const Icon = meta.icon;
  const orders = asInt(bucket.ordersCount);
  const sales = asInt(bucket.totalSales);
  const commission = asInt(bucket.totalCommission);
  const held = asInt(bucket.totalHoldedCommission);
  const pct = Math.min(100, (orders / maxOrders) * 100);

  return (
    <div className="flex flex-col rounded-2xl border border-border/70 bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-center gap-2">
        <span className={cn('grid h-8 w-8 place-items-center rounded-xl', tone.iconBg)}>
          <Icon className={cn('h-4 w-4', tone.iconColor)} />
        </span>
        <p className={cn('text-base font-semibold tracking-tight', tone.title)}>{label}</p>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <StatRow label={t('sales.orders')} value={formatNumber(orders, locale)} />
        <StatRow
          label={t('dashboard.totalSales')}
          value={
            <>
              {formatNumber(sales, locale)}{' '}
              <span className="text-xs text-muted-foreground">{CURRENCY}</span>
            </>
          }
        />
        <StatRow
          label={t('commissions.title')}
          value={
            <span className="text-primary">
              {formatNumber(commission, locale)}{' '}
              <span className="text-xs text-muted-foreground">{CURRENCY}</span>
            </span>
          }
        />
        {held > 0 && (
          <StatRow
            label={t('analytics.heldCommissions')}
            value={
              <span className="text-amber-600">
                {formatNumber(held, locale)}{' '}
                <span className="text-xs text-muted-foreground">{CURRENCY}</span>
              </span>
            }
          />
        )}
      </dl>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={cn('h-full rounded-full transition-all', tone.bar)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
