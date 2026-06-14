'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { DashboardWithdrawalsByStatus } from '@/types/admin/analytics';

const COLORS: Record<string, string> = {
  paid: '#10b981',
  approved: '#4f46e5',
  pending: '#f59e0b',
  rejected: '#f43f5e',
};

export function WithdrawalsChart({
  data,
  isLoading,
}: {
  data?: DashboardWithdrawalsByStatus;
  isLoading?: boolean;
}) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);

  const breakdown = data?.breakdown ?? [];
  const totalAmount = data?.totalAmount ?? 0;
  const totalCount = data?.totalCount ?? 0;
  const chartData = breakdown.map((s) => ({ ...s, fill: COLORS[s.status] ?? '#a78bfa' }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('withdrawals.title')}</CardTitle>
        <CardDescription>
          {formatNumber(totalCount, locale)} · {formatCurrency(totalAmount, locale)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-60 w-full" />
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="h-44 w-44 shrink-0">
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
            </div>
            <ul className="flex-1 space-y-2 text-xs">
              {chartData.map((d) => (
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
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
