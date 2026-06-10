'use client';

import { format, parseISO } from 'date-fns';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DemoBadge } from './demo-badge';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency } from '@/lib/utils';
import type { AnalyticsTimeseries } from '@/types/admin/analytics';

export function RevenueChart({
  data,
  isLoading,
  isDemo,
}: {
  data: AnalyticsTimeseries;
  isLoading?: boolean;
  isDemo?: boolean;
}) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);

  const tickFormat = (raw: string) => {
    if (data.granularity === 'month') {
      const d = parseISO(`${raw}-01`);
      return format(d, 'MMM');
    }
    const d = parseISO(raw);
    return format(d, 'MMM d');
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            {t('dashboard.totalSales')} · {t('dashboard.totalCommissions')}
            <DemoBadge show={Boolean(isDemo)} />
          </CardTitle>
          <CardDescription>
            {data.granularity === 'day' ? t('analytics.daily') : t('analytics.monthly')}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <AreaChart data={data.points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="evilia-sales-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="evilia-commissions-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
                <XAxis
                  dataKey="bucket"
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
                  cursor={{ stroke: 'hsl(244 76% 59%)', strokeDasharray: '4 4', strokeOpacity: 0.4 }}
                  contentStyle={{
                    background: 'hsl(0 0% 100%)',
                    border: '1px solid hsl(220 13% 91%)',
                    borderRadius: 12,
                    boxShadow: '0 12px 28px -8px hsl(226 47% 11% / 0.16)',
                    fontSize: 12,
                  }}
                  labelFormatter={(label) => tickFormat(String(label))}
                  formatter={(value, name) => [
                    formatCurrency(Number(value) || 0, locale),
                    name === 'sales' ? t('dashboard.totalSales') : t('dashboard.totalCommissions'),
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fill="url(#evilia-sales-grad)"
                />
                <Area
                  type="monotone"
                  dataKey="commissions"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#evilia-commissions-grad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
