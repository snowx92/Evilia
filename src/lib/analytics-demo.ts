/**
 * Deterministic demo data that mirrors the proposed analytics endpoint shapes.
 * Used as a fallback while the backend implements the new endpoints — the
 * frontend can render its final design without inventing one-off mocks per chart.
 *
 * Seeding rule: values are derived from the range start so the same range
 * always produces the same numbers (no flicker between renders).
 */

import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  format,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import type {
  AnalyticsGranularity,
  AnalyticsOverview,
  AnalyticsTimeseries,
  AnalyticsTimeseriesPoint,
  SalesBreakdownResponse,
  TopPerformersResponse,
  WithdrawalsBreakdownResponse,
} from '@/types/admin/analytics';

function seedFromString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) / 2 ** 32;
}

function mulberry(seed: number) {
  let t = Math.floor(seed * 0xffffffff) || 1;
  return () => {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function demoTimeseries(
  from: Date,
  to: Date,
  granularity: AnalyticsGranularity,
): AnalyticsTimeseries {
  const points: AnalyticsTimeseriesPoint[] = [];
  const rand = mulberry(seedFromString(`${from.toISOString()}|${granularity}`));

  if (granularity === 'day') {
    const days = Math.max(1, differenceInCalendarDays(to, from) + 1);
    const start = startOfDay(from);
    for (let i = 0; i < days; i++) {
      const date = addDays(start, i);
      const trend = 1 + i / Math.max(days, 1);
      const noise = 0.7 + rand() * 0.6;
      const sales = Math.round(18000 * trend * noise);
      const commissions = Math.round(sales * (0.07 + rand() * 0.05));
      const newUsers = Math.round(2 + rand() * 9 * trend);
      const withdrawals = Math.round(sales * (0.18 + rand() * 0.12));
      points.push({
        bucket: format(date, 'yyyy-MM-dd'),
        sales,
        commissions,
        newUsers,
        withdrawals,
      });
    }
  } else {
    const months = Math.max(1, differenceInCalendarMonths(to, from) + 1);
    const start = startOfMonth(from);
    for (let i = 0; i < months; i++) {
      const date = addMonths(start, i);
      const trend = 1 + i / Math.max(months, 1);
      const noise = 0.8 + rand() * 0.5;
      const sales = Math.round(540_000 * trend * noise);
      const commissions = Math.round(sales * (0.075 + rand() * 0.04));
      const newUsers = Math.round(60 + rand() * 220 * trend);
      const withdrawals = Math.round(sales * (0.2 + rand() * 0.1));
      points.push({
        bucket: format(date, 'yyyy-MM'),
        sales,
        commissions,
        newUsers,
        withdrawals,
      });
    }
  }
  return { granularity, points };
}

export function demoOverview(series: AnalyticsTimeseries): AnalyticsOverview {
  const total = series.points.reduce(
    (acc, p) => ({
      sales: acc.sales + p.sales,
      commissions: acc.commissions + p.commissions,
      newUsers: acc.newUsers + p.newUsers,
      withdrawals: acc.withdrawals + p.withdrawals,
    }),
    { sales: 0, commissions: 0, newUsers: 0, withdrawals: 0 },
  );

  // Pretend the first half is the "previous period"; second half is the "current".
  const mid = Math.floor(series.points.length / 2) || 1;
  const numericKeys = ['sales', 'commissions', 'newUsers', 'withdrawals'] as const;
  type NumericKey = (typeof numericKeys)[number];
  const sumFirst = (key: NumericKey) =>
    series.points.slice(0, mid).reduce<number>((a, p) => a + (p[key] ?? 0), 0);
  const sumSecond = (key: NumericKey) =>
    series.points.slice(mid).reduce<number>((a, p) => a + (p[key] ?? 0), 0);

  const delta = (key: NumericKey) => {
    const a = sumFirst(key);
    const b = sumSecond(key);
    if (a === 0) return b === 0 ? 0 : 100;
    return ((b - a) / a) * 100;
  };

  return {
    totalSales: total.sales,
    totalCommissions: total.commissions,
    newUsers: total.newUsers,
    paidWithdrawals: total.withdrawals,
    deltaSales: delta('sales'),
    deltaCommissions: delta('commissions'),
    deltaNewUsers: delta('newUsers'),
    deltaPaidWithdrawals: delta('withdrawals'),
  };
}


export function demoSalesBreakdown(series: AnalyticsTimeseries): SalesBreakdownResponse {
  const total = series.points.reduce((acc, p) => acc + p.sales, 0);
  return {
    byStatus: [
      { status: 'processed', count: Math.round(total / 2400), amount: Math.round(total * 0.72) },
      { status: 'pending', count: Math.round(total / 8000), amount: Math.round(total * 0.18) },
      { status: 'cancelled', count: Math.round(total / 24000), amount: Math.round(total * 0.1) },
    ],
  };
}

export function demoWithdrawalsBreakdown(
  series: AnalyticsTimeseries,
): WithdrawalsBreakdownResponse {
  const total = series.points.reduce((acc, p) => acc + p.withdrawals, 0);
  const byStatus = [
    { status: 'paid' as const, count: Math.round(total / 12000), amount: Math.round(total * 0.58) },
    {
      status: 'approved' as const,
      count: Math.round(total / 22000),
      amount: Math.round(total * 0.2),
    },
    {
      status: 'pending' as const,
      count: Math.round(total / 26000),
      amount: Math.round(total * 0.16),
    },
    {
      status: 'rejected' as const,
      count: Math.round(total / 80000),
      amount: Math.round(total * 0.06),
    },
  ];
  return {
    byStatus,
    totalAmount: total,
    totalCount: byStatus.reduce((acc, s) => acc + s.count, 0),
  };
}

const DEMO_NAMES_AR = [
  'مها الشريف',
  'يوسف عبد الرحمن',
  'سلمى منصور',
  'هاني الحلبي',
  'دانا فاضل',
  'كريم عاشور',
  'نور الدين',
  'إيمان الباز',
];

export function demoTopPerformers(series: AnalyticsTimeseries): TopPerformersResponse {
  const total = series.points.reduce((acc, p) => acc + p.sales, 0);
  const rand = mulberry(seedFromString(series.points[0]?.bucket ?? 'seed'));
  const make = (i: number) => {
    const share = (0.34 - i * 0.06) * (0.9 + rand() * 0.2);
    return {
      userId: `demo-${i}`,
      displayName: DEMO_NAMES_AR[i % DEMO_NAMES_AR.length],
      sellerCode: `EVL-${1024 + i * 7}`,
      salesCount: Math.round((total * share) / 4200),
      salesAmount: Math.round(total * Math.max(share, 0.04)),
    };
  };
  const bySales = Array.from({ length: 5 }, (_, i) => make(i));
  const byCommissions = bySales.map((s, i) => ({
    userId: s.userId,
    displayName: s.displayName,
    sellerCode: s.sellerCode,
    commissionsAmount: Math.round(s.salesAmount * (0.07 + i * 0.005)),
  }));
  return { bySales, byCommissions };
}
