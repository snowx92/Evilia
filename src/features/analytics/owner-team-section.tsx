'use client';

import Link from 'next/link';
import { UserPlus, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage, getInitials } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { MetricCard } from '@/components/shared/metric-card';
import { ExplainLabel } from '@/components/shared/explain-label';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { OwnerReportResponse } from '@/types/admin/analytics';

export function OwnerTeamSection({
  data,
  isLoading,
}: {
  data?: OwnerReportResponse['team'];
  isLoading?: boolean;
}) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const items = data?.topSellers ?? [];
  const max = Math.max(0, ...items.map((i) => i.salesAmount));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          label={
            <ExplainLabel
              labelKey="analytics.team.activeSellers"
              explainKey="analytics.explain.activeSellers"
            />
          }
          value={data ? formatNumber(data.activeSellers.count, locale) : '—'}
          icon={Users}
          accent="amber"
          trend={data ? { value: data.activeSellers.changePercentage } : undefined}
          isLoading={isLoading}
        />
        <MetricCard
          label={
            <ExplainLabel
              labelKey="analytics.team.newSellers"
              explainKey="analytics.explain.newSellers"
            />
          }
          value={data ? formatNumber(data.newSellers.count, locale) : '—'}
          icon={UserPlus}
          accent="indigo"
          trend={data ? { value: data.newSellers.changePercentage } : undefined}
          isLoading={isLoading}
        />
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>{t('analytics.team.topSellers')}</CardTitle>
          <CardDescription>{t('analytics.team.topSellersDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState title={t('common.noResults')} description={t('analytics.team.topSellers')} />
          ) : (
            <ul className="space-y-3">
              {items.map((entry) => {
                const pct = max > 0 ? (entry.salesAmount / max) * 100 : 0;
                const name = entry.displayName ?? entry.user?.displayName ?? '—';
                const meta = entry.sellerCode ?? entry.user?.sellerCode ?? entry.userId;
                return (
                  <li key={entry.userId} className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                        {entry.rank}
                      </span>
                      <Avatar className="h-8 w-8">
                        {entry.user?.profileImageUrl ? (
                          <AvatarImage src={entry.user.profileImageUrl} alt={name} />
                        ) : null}
                        <AvatarFallback>{getInitials(name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-1 flex-col leading-tight">
                        <Link
                          href={`/admin/users/${encodeURIComponent(entry.userId)}`}
                          className="truncate text-sm font-medium hover:underline"
                        >
                          {name}
                        </Link>
                        <span className="truncate text-[11px] text-muted-foreground">{meta}</span>
                      </div>
                      <div className="text-end leading-tight">
                        <p className="text-sm font-semibold">
                          {formatCurrency(entry.salesAmount, locale)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatNumber(entry.salesCount, locale)} {t('sales.title')}
                        </p>
                      </div>
                    </div>
                    <div className="ms-9 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-brand-gradient"
                        style={{ width: `${Math.min(100, Math.max(4, pct))}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
