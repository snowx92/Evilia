'use client';

import { format, parseISO } from 'date-fns';
import {
  Bar,
  BarChart,
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
import { formatNumber } from '@/lib/utils';
import type { AnalyticsTimeseries } from '@/types/admin/analytics';

export function ActivityChart({
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
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            {t('users.title')}
            <DemoBadge show={Boolean(isDemo)} />
          </CardTitle>
          <CardDescription>{t('dashboard.activeUsers')}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-60 w-full" />
        ) : (
          <div className="h-60 w-full">
            <ResponsiveContainer>
              <BarChart data={data.points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
                <XAxis
                  dataKey="bucket"
                  tickFormatter={tickFormat}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: 'hsl(220 9% 46%)' }}
                  minTickGap={14}
                  reversed={locale === 'ar'}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: 'hsl(220 9% 46%)' }}
                  orientation={locale === 'ar' ? 'right' : 'left'}
                  width={36}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(244 76% 95%)' }}
                  contentStyle={{
                    background: 'hsl(0 0% 100%)',
                    border: '1px solid hsl(220 13% 91%)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelFormatter={(label) => tickFormat(String(label))}
                  formatter={(v) => [formatNumber(Number(v) || 0, locale), t('users.title')]}
                />
                <Bar dataKey="newUsers" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
