'use client';

import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency } from '@/lib/utils';
import type { DashboardSalesByStatusTrends } from '@/types/admin/analytics';

const tickFormat = (raw: string) => format(parseISO(raw), 'MMM d');

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  processing: '#6366f1',
  delivered: '#10b981',
  failed: '#ef4444',
};

const STATUS_ORDER: Array<keyof DashboardSalesByStatusTrends> = [
  'failed',
  'pending',
  'processing',
  'delivered',
];

/**
 * Stacked-area chart of the sales funnel over time. Each band is a status
 * (delivered / processing / pending / failed). Lets operators spot
 * funnel-health regressions at a glance — e.g. growing failed band or
 * pending band that isn't converting to delivered.
 */
export function SalesFunnelTrend({
  data,
  isLoading,
}: {
  data: DashboardSalesByStatusTrends | undefined;
  isLoading?: boolean;
}) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);

  // Merge the per-status series into a single { date, pending, processing, ... } table
  // since recharts AreaChart needs one row per date.
  const merged = useMemo(() => {
    if (!data) return [];
    const byDate = new Map<string, Record<string, number>>();
    for (const status of STATUS_ORDER) {
      const series = data[status];
      if (!series) continue;
      for (const point of series) {
        const row = byDate.get(point.date) ?? { date: point.date as unknown as number };
        row[status] = point.value;
        byDate.set(point.date, row);
      }
    }
    return Array.from(byDate.values()).sort((a, b) =>
      String(a.date).localeCompare(String(b.date)),
    );
  }, [data]);

  const hasData = merged.length > 0;

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle>{t('dashboard.salesByStatusTrend')}</CardTitle>
          <CardDescription>{t('analytics.daily')}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : !hasData ? (
          <EmptyState title={t('common.noResults')} className="py-6" />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <AreaChart data={merged} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  {STATUS_ORDER.map((s) => (
                    <linearGradient key={s} id={`grad-${s}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={STATUS_COLORS[s]} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={STATUS_COLORS[s]} stopOpacity={0.05} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={tickFormat}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: 'hsl(220 9% 46%)' }}
                  minTickGap={12}
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
                  labelFormatter={(label) => tickFormat(String(label))}
                  formatter={(v, name) => [
                    formatCurrency(Number(v) || 0, locale),
                    t(`status.${name}`),
                  ]}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  formatter={(v) => t(`status.${v}`)}
                />
                {STATUS_ORDER.filter((s) => data?.[s]?.length).map((s) => (
                  <Area
                    key={s}
                    type="monotone"
                    dataKey={s}
                    stackId="1"
                    stroke={STATUS_COLORS[s]}
                    strokeWidth={2}
                    fill={`url(#grad-${s})`}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
