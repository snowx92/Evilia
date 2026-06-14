'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { DashboardSalesByStatus } from '@/types/admin/analytics';

const COLORS: Record<string, string> = {
  processed: '#4f46e5',
  pending: '#f59e0b',
  cancelled: '#94a3b8',
};

export function SalesStatusChart({
  data,
  isLoading,
}: {
  data?: DashboardSalesByStatus;
  isLoading?: boolean;
}) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);

  const breakdown = data?.breakdown ?? [];
  const total = data?.totalAmount ?? 0;
  const chartData = breakdown.map((s) => ({ ...s, fill: COLORS[s.status] ?? '#a78bfa' }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sales.title')}</CardTitle>
        <CardDescription>{t('common.status')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-60 w-full" />
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative h-44 w-44 shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="amount"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={80}
                    strokeWidth={0}
                    paddingAngle={2}
                  >
                    {chartData.map((d) => (
                      <Cell key={d.status} fill={d.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                <div className="leading-tight">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('common.amount')}
                  </p>
                  <p className="text-sm font-semibold">{formatCurrency(total, locale)}</p>
                </div>
              </div>
            </div>
            <ul className="flex-1 space-y-2 text-xs">
              {chartData.map((d) => {
                const pct = total > 0 ? (d.amount / total) * 100 : 0;
                return (
                  <li key={d.status} className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: d.fill }}
                      aria-hidden="true"
                    />
                    <span className="flex flex-1 flex-col leading-tight">
                      <span className="font-medium text-foreground">{t(`status.${d.status}`)}</span>
                      <span className="text-muted-foreground">
                        {formatNumber(d.count, locale)} · {formatCurrency(d.amount, locale)}
                      </span>
                    </span>
                    <span className="w-10 text-end font-medium">{pct.toFixed(0)}%</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
