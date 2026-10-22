'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  Globe2,
  Megaphone,
  Leaf,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ExplainLabel } from '@/components/shared/explain-label';
import { useSalesTrafficQuery } from '@/hooks/queries/use-analytics';
import { useUsersQuery } from '@/hooks/queries/use-users';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { cn, formatNumber } from '@/lib/utils';
import type {
  TrafficPaidType,
  TrafficSourceBucket,
} from '@/types/admin/analytics';

const ALL = '__all__';

const SOURCE_ORDER: TrafficSourceBucket[] = [
  'facebook',
  'instagram',
  'tiktok',
  'direct',
  'google',
  'other',
  'unknown',
];

const PAID_ORDER: TrafficPaidType[] = ['paid', 'organic', 'unknown'];

const SOURCE_TONE: Record<TrafficSourceBucket, string> = {
  facebook: 'bg-[#1877F2]',
  instagram: 'bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600',
  tiktok: 'bg-zinc-900',
  direct: 'bg-sky-500',
  google: 'bg-emerald-500',
  other: 'bg-violet-500',
  unknown: 'bg-slate-400',
};

const PAID_META: Record<
  TrafficPaidType,
  { icon: LucideIcon; tone: string; bar: string }
> = {
  paid: { icon: Megaphone, tone: 'text-amber-700', bar: 'bg-amber-500' },
  organic: { icon: Leaf, tone: 'text-emerald-700', bar: 'bg-emerald-500' },
  unknown: { icon: HelpCircle, tone: 'text-slate-600', bar: 'bg-slate-400' },
};

function today(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

function monthStart(): string {
  const d = new Date();
  return format(new Date(d.getFullYear(), d.getMonth(), 1), 'yyyy-MM-dd');
}

function sourceLabel(t: (k: string) => string, source: TrafficSourceBucket): string {
  switch (source) {
    case 'facebook':
      return t('analytics.traffic.source.facebook');
    case 'instagram':
      return t('analytics.traffic.source.instagram');
    case 'tiktok':
      return t('analytics.traffic.source.tiktok');
    case 'direct':
      return t('analytics.traffic.source.direct');
    case 'google':
      return t('analytics.traffic.source.google');
    case 'other':
      return t('analytics.traffic.source.other');
    case 'unknown':
      return t('analytics.traffic.source.unknown');
    default: {
      const _exhaustive: never = source;
      return _exhaustive;
    }
  }
}

function paidLabel(t: (k: string) => string, type: TrafficPaidType): string {
  switch (type) {
    case 'paid':
      return t('analytics.traffic.paidType.paid');
    case 'organic':
      return t('analytics.traffic.paidType.organic');
    case 'unknown':
      return t('analytics.traffic.paidType.unknown');
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

export function OrderTrafficCards({
  lockedSellerId,
  defaultRange = 'today',
}: {
  lockedSellerId?: string;
  defaultRange?: 'today' | 'month';
}) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [from, setFrom] = useState<string>(
    defaultRange === 'month' ? monthStart() : today(),
  );
  const [to, setTo] = useState<string>(today());
  const [sellerId, setSellerId] = useState<string | undefined>(lockedSellerId);

  const safe = from > to ? { from: to, to: from } : { from, to };
  const params = {
    from: safe.from,
    to: safe.to,
    ...(sellerId ? { sellerId, scope: 'direct' as const } : {}),
  };
  const query = useSalesTrafficQuery(params);
  const data = query.data;

  const sources = useMemo(() => {
    const map = new Map(data?.bySource.map((b) => [b.source, b.count]) ?? []);
    return SOURCE_ORDER.map((source) => ({
      source,
      count: map.get(source) ?? 0,
    }));
  }, [data]);

  const paidTypes = useMemo(() => {
    const map = new Map(data?.byPaidType.map((b) => [b.type, b.count]) ?? []);
    return PAID_ORDER.map((type) => ({
      type,
      count: map.get(type) ?? 0,
    }));
  }, [data]);

  const maxSource = Math.max(1, ...sources.map((s) => s.count));
  const total = data?.totalOrders ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-primary" />
            {t('analytics.traffic.title')}
          </CardTitle>
          <CardDescription>
            {sellerId
              ? t('analytics.traffic.descSeller')
              : t('analytics.traffic.desc')}
          </CardDescription>
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
      <CardContent className="space-y-6">
        {query.isError ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : query.isLoading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-56 w-full rounded-2xl" />
            <Skeleton className="h-56 w-full rounded-2xl" />
          </div>
        ) : !data ? (
          <EmptyState title={t('common.noResults')} className="py-8" />
        ) : (
          <>
            <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm">
              <ExplainLabel
                labelKey="analytics.traffic.totalOrders"
                explainKey="analytics.explain.trafficTotal"
              />
              <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                {formatNumber(total, locale)}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold tracking-tight">
                  {t('analytics.traffic.bySource')}
                </h3>
                <ul className="space-y-2.5">
                  {sources.map(({ source, count }) => {
                    const pct = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
                    return (
                      <li key={source} className="space-y-1">
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="font-medium">{sourceLabel(t, source)}</span>
                          <span className="tabular-nums text-muted-foreground">
                            {formatNumber(count, locale)}
                            <span className="ms-1.5 text-[11px]">({pct}%)</span>
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn('h-full rounded-full transition-all', SOURCE_TONE[source])}
                            style={{ width: `${Math.max(count > 0 ? 4 : 0, (count / maxSource) * 100)}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold tracking-tight">
                  {t('analytics.traffic.byPaidType')}
                </h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {paidTypes.map(({ type, count }) => {
                    const meta = PAID_META[type];
                    const Icon = meta.icon;
                    const pct = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
                    return (
                      <div
                        key={type}
                        className="rounded-2xl border border-border/70 bg-card p-4"
                      >
                        <div className="flex items-center gap-2">
                          <span className="grid h-8 w-8 place-items-center rounded-xl bg-muted">
                            <Icon className={cn('h-4 w-4', meta.tone)} />
                          </span>
                          <span className={cn('text-sm font-medium', meta.tone)}>
                            {paidLabel(t, type)}
                          </span>
                        </div>
                        <div className="mt-3 text-2xl font-semibold tabular-nums tracking-tight">
                          {formatNumber(count, locale)}
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground tabular-nums">
                          {pct}%
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn('h-full rounded-full', meta.bar)}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {(data.unclassifiedSourceCount > 0 ||
                  data.unclassifiedPaidTypeCount > 0) && (
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {t('analytics.traffic.unknownHint')}
                  </p>
                )}
              </div>
            </div>
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
