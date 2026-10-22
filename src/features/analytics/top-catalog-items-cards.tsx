'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Package } from 'lucide-react';
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
import { useSalesTopCatalogItemsQuery } from '@/hooks/queries/use-analytics';
import { useUsersQuery } from '@/hooks/queries/use-users';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import type { SalesTopCatalogItem } from '@/types/admin/analytics';

const ALL = '__all__';

function today(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

function monthStart(): string {
  const d = new Date();
  return format(new Date(d.getFullYear(), d.getMonth(), 1), 'yyyy-MM-dd');
}

function itemName(
  item: SalesTopCatalogItem,
  locale: 'ar' | 'en',
): string {
  const name = item.name;
  if (typeof name === 'string') return name || '—';
  const localized = locale === 'ar' ? name.ar || name.en : name.en || name.ar;
  return localized?.trim() || '—';
}

export function TopCatalogItemsCards({
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
    limit: 10,
    ...(sellerId ? { sellerId, scope: 'direct' as const } : {}),
  };
  const query = useSalesTopCatalogItemsQuery(params);
  const data = query.data;
  const items = data?.items ?? [];
  const maxQty = useMemo(
    () => Math.max(1, ...items.map((item) => item.quantitySold)),
    [items],
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            {t('analytics.topCatalog.title')}
          </CardTitle>
          <CardDescription>
            {sellerId
              ? t('analytics.topCatalog.descSeller')
              : t('analytics.topCatalog.desc')}
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
      <CardContent className="space-y-5">
        {query.isError ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : query.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : !data || items.length === 0 ? (
          <EmptyState title={t('common.noResults')} className="py-8" />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm">
                <ExplainLabel
                  labelKey="analytics.topCatalog.trackedOrders"
                  explainKey="analytics.explain.topCatalogOrders"
                />
                <div className="mt-1 text-xl font-semibold tabular-nums tracking-tight">
                  {formatNumber(data.totalOrders, locale)}
                </div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm">
                <ExplainLabel
                  labelKey="analytics.topCatalog.matchedUnits"
                  explainKey="analytics.explain.topCatalogMatched"
                />
                <div className="mt-1 text-xl font-semibold tabular-nums tracking-tight">
                  {formatNumber(data.matchedQuantity, locale)}
                </div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm">
                <ExplainLabel
                  labelKey="analytics.topCatalog.unmatchedUnits"
                  explainKey="analytics.explain.topCatalogUnmatched"
                />
                <div className="mt-1 text-xl font-semibold tabular-nums tracking-tight">
                  {formatNumber(data.unmatchedQuantity, locale)}
                </div>
              </div>
            </div>

            <ul className="space-y-3">
              {items.map((item) => {
                const name = itemName(item, locale);
                const pct = (item.quantitySold / maxQty) * 100;
                return (
                  <li key={`${item.catalogProductId ?? 'x'}-${item.rank}`} className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                        {item.rank}
                      </span>
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-muted">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="grid h-full w-full place-items-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </span>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col leading-tight">
                        <span className="truncate text-sm font-medium">{name}</span>
                        <span className="truncate text-[11px] text-muted-foreground">
                          {item.slug || item.vonderaProductId || '—'}
                        </span>
                      </div>
                      <div className="text-end leading-tight">
                        <p className="text-sm font-semibold tabular-nums">
                          {formatNumber(item.quantitySold, locale)}{' '}
                          <span className="text-[11px] font-normal text-muted-foreground">
                            {t('analytics.topCatalog.units')}
                          </span>
                        </p>
                        <p className="text-[11px] text-muted-foreground tabular-nums">
                          {formatCurrency(item.revenue, locale)}
                          {' · '}
                          {formatNumber(item.orderCount, locale)}{' '}
                          {t('analytics.topCatalog.orders')}
                        </p>
                      </div>
                    </div>
                    <div className="ms-9 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn('h-full rounded-full bg-brand-gradient')}
                        style={{ width: `${Math.min(100, Math.max(4, pct))}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
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
        <SelectTrigger className="w-44">
          <SelectValue placeholder={t('common.all')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t('common.all')}</SelectItem>
          {list.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.displayName || u.sellerCode || u.email || u.id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
