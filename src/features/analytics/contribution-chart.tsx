'use client';

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
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency } from '@/lib/utils';
import type { OwnerReportResponse } from '@/types/admin/analytics';

type TrendPoint = {
  date: string;
  gmv: number;
  commissions: number;
  expenses: number;
  contribution: number;
};

function mergeTrends(data: OwnerReportResponse['trends']): TrendPoint[] {
  const byDate = new Map<string, TrendPoint>();

  const ensure = (date: string) => {
    let row = byDate.get(date);
    if (!row) {
      row = { date, gmv: 0, commissions: 0, expenses: 0, contribution: 0 };
      byDate.set(date, row);
    }
    return row;
  };

  for (const p of data.gmv) ensure(p.date).gmv = p.amount;
  for (const p of data.commissions) ensure(p.date).commissions = p.amount;
  for (const p of data.expenses) ensure(p.date).expenses = p.amount;
  for (const p of data.contribution) ensure(p.date).contribution = p.amount;

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function ContributionChart({
  trends,
  isLoading,
}: {
  trends?: OwnerReportResponse['trends'];
  isLoading?: boolean;
}) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const chartData = trends ? mergeTrends(trends) : [];

  const tickFormat = (raw: string) => format(parseISO(raw), 'MMM d');

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="space-y-1">
        <CardTitle>{t('analytics.charts.revenueCosts')}</CardTitle>
        <CardDescription>{t('analytics.charts.revenueCostsDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="owner-gmv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="owner-contrib" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
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
                  cursor={{ stroke: 'hsl(244 76% 59%)', strokeDasharray: '4 4', strokeOpacity: 0.4 }}
                  contentStyle={{
                    background: 'hsl(0 0% 100%)',
                    border: '1px solid hsl(220 13% 91%)',
                    borderRadius: 12,
                    boxShadow: '0 12px 28px -8px hsl(226 47% 11% / 0.16)',
                    fontSize: 12,
                  }}
                  labelFormatter={(label) => tickFormat(String(label))}
                  formatter={(value, name) => {
                    const key = String(name);
                    const label =
                      key === 'gmv'
                        ? t('analytics.pnl.gmv')
                        : key === 'commissions'
                          ? t('analytics.pnl.commissions')
                          : key === 'expenses'
                            ? t('analytics.pnl.expenses')
                            : t('analytics.pnl.contribution');
                    return [formatCurrency(Number(value) || 0, locale), label];
                  }}
                />
                <Legend
                  formatter={(value) => {
                    if (value === 'gmv') return t('analytics.pnl.gmv');
                    if (value === 'commissions') return t('analytics.pnl.commissions');
                    if (value === 'expenses') return t('analytics.pnl.expenses');
                    if (value === 'contribution') return t('analytics.pnl.contribution');
                    return String(value);
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="gmv"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fill="url(#owner-gmv)"
                />
                <Area
                  type="monotone"
                  dataKey="commissions"
                  stroke="#f59e0b"
                  strokeWidth={1.75}
                  fill="transparent"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#e11d48"
                  strokeWidth={1.75}
                  fill="transparent"
                />
                <Area
                  type="monotone"
                  dataKey="contribution"
                  stroke="#059669"
                  strokeWidth={2}
                  fill="url(#owner-contrib)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
