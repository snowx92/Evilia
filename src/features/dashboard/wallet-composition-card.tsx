'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';
import { useLocaleStore } from '@/store/locale';
import { useTranslation } from '@/hooks/use-translation';
import { formatCurrency } from '@/lib/utils';

export function WalletCompositionCard() {
  const { t } = useTranslation();
  const wallet = useAuthStore((s) => s.wallet);
  const locale = useLocaleStore((s) => s.locale);

  const data = useMemo(() => {
    if (!wallet) return [];
    return [
      { key: 'available', label: t('wallets.available'), value: Math.max(wallet.available, 0), color: '#4f46e5' },
      {
        key: 'pending',
        label: t('wallets.pendingWithdrawal'),
        value: Math.max(wallet.pendingWithdrawal, 0),
        color: '#f59e0b',
      },
      {
        key: 'withdrawn',
        label: t('wallets.totalWithdrawn'),
        value: Math.max(wallet.totalWithdrawn, 0),
        color: '#10b981',
      },
    ];
  }, [wallet, t]);

  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('wallets.balance')}</CardTitle>
        <CardDescription>
          {wallet ? formatCurrency(wallet.balance, locale) : '—'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {wallet && total > 0 ? (
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="relative h-44 w-44">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={80}
                    strokeWidth={0}
                    paddingAngle={2}
                  >
                    {data.map((d) => (
                      <Cell key={d.key} fill={d.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="text-center leading-tight">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('wallets.totalEarned')}
                  </p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(wallet.totalEarned, locale)}
                  </p>
                </div>
              </div>
            </div>
            <ul className="flex-1 space-y-2.5">
              {data.map((d) => {
                const pct = total > 0 ? (d.value / total) * 100 : 0;
                return (
                  <li key={d.key} className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: d.color }}
                      aria-hidden="true"
                    />
                    <span className="flex flex-1 items-center justify-between text-xs">
                      <span className="text-muted-foreground">{d.label}</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(d.value, locale)}
                      </span>
                    </span>
                    <span className="w-10 text-end text-[11px] text-muted-foreground">
                      {pct.toFixed(0)}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">—</p>
        )}
      </CardContent>
    </Card>
  );
}
