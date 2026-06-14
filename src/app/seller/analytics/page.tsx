'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { BarChart3, Loader2, TrendingUp, ScrollText } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { sellerService } from '@/services/seller.service';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency } from '@/lib/utils';

type DatedAmount = { date: string; amount: number };

async function fetchAllPaged<T>(
  fetcher: (params: { page: number; limit: number }) => Promise<{
    items: T[];
    totalPages: number;
  }>,
): Promise<T[]> {
  const limit = 100;
  const acc: T[] = [];
  let page = 1;
  // Cap iterations to 50 pages (5,000 items) so a runaway never hangs the UI.
  for (let i = 0; i < 50; i++) {
    const res = await fetcher({ page, limit });
    acc.push(...res.items);
    if (page >= res.totalPages || res.items.length < limit) break;
    page += 1;
  }
  return acc;
}

function groupByMonth(rows: DatedAmount[]) {
  const buckets: Record<string, number> = {};
  rows.forEach((r) => {
    if (!r.date) return;
    const key = r.date.slice(0, 7); // YYYY-MM
    buckets[key] = (buckets[key] ?? 0) + (r.amount ?? 0);
  });
  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount }));
}

export default function SellerAnalyticsPage() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  useDocumentTitle(t('seller.nav.analytics'));

  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState<DatedAmount[]>([]);
  const [sales, setSales] = useState<DatedAmount[]>([]);

  // Pull all pages once on mount. /sales doesn't expose createdAt, so we
  // can't bucket it; we still surface its total. /commissions has createdAt.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchAllPaged((p) => sellerService.networkCommissions(p)).catch(
        () => [] as Awaited<ReturnType<typeof sellerService.networkCommissions>>['items'],
      ),
      fetchAllPaged((p) => sellerService.sales(p)).catch(
        () => [] as Awaited<ReturnType<typeof sellerService.sales>>['items'],
      ),
    ])
      .then(([networkComm, salesRows]) => {
        if (cancelled) return;
        setCommissions(
          networkComm.map((c) => ({ date: String(c.createdAt), amount: c.amount })),
        );
        setSales(
          salesRows.map((s) => ({ date: format(new Date(), 'yyyy-MM-dd'), amount: s.amount })),
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const commissionByMonth = useMemo(() => groupByMonth(commissions), [commissions]);
  const totalCommissions = useMemo(
    () => commissions.reduce((s, r) => s + r.amount, 0),
    [commissions],
  );
  const totalSales = useMemo(() => sales.reduce((s, r) => s + r.amount, 0), [sales]);
  const monthsCount = commissionByMonth.length;
  const avgPerMonth = monthsCount > 0 ? totalCommissions / monthsCount : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('seller.portal')}
        title={t('seller.nav.analytics')}
        description={t('seller.yourPerformance')}
      />

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat
          icon={ScrollText}
          label={t('dashboard.totalCommissions')}
          primary={loading ? '—' : formatCurrency(totalCommissions, locale)}
          secondary={loading ? null : `${commissions.length} ×`}
          accent="text-success"
        />
        <Stat
          icon={TrendingUp}
          label={t('dashboard.totalSales')}
          primary={loading ? '—' : formatCurrency(totalSales, locale)}
          secondary={loading ? null : `${sales.length} ×`}
          accent="text-primary"
        />
        <Stat
          icon={BarChart3}
          label={t('seller.perMonth')}
          primary={loading ? '—' : formatCurrency(avgPerMonth, locale)}
          secondary={loading ? null : `${monthsCount} ${t('analytics.month')}`}
          accent="text-foreground"
        />
      </div>

      {/* Monthly commission trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            {t('seller.monthlyTrend')}
          </CardTitle>
          <CardDescription>{t('dashboard.totalCommissions')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid place-items-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : commissionByMonth.length === 0 ? (
            <EmptyState title={t('common.noResults')} className="py-8" />
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer>
                <BarChart
                  data={commissionByMonth}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(220 13% 91%)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(220 9% 46%)' }}
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
                    formatter={(value) => [formatCurrency(Number(value) || 0, locale), '']}
                  />
                  <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  primary,
  secondary,
  accent,
}: {
  icon: typeof BarChart3;
  label: string;
  primary: string;
  secondary: string | null;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className={`text-lg font-bold tabular-nums ${accent}`}>{primary}</p>
          {secondary && <p className="text-[11px] text-muted-foreground">{secondary}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
