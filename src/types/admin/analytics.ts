import type { TimestampLike } from '@/lib/utils';

/* ────────────────────────────────────────────────────────────────────────────
   Existing endpoints (already implemented by backend)
   ──────────────────────────────────────────────────────────────────────────── */

export type DailyAnalyticsSummary = {
  date: TimestampLike;
  totalSales: number;
  totalCommissions: number;
  activeUsers: number;
};

export type UserMonthlyAnalytics = {
  userId: string;
  month: string;
  salesTotal: number;
  commissionTotal: number;
  networkSales: number;
};

/* ────────────────────────────────────────────────────────────────────────────
   Proposed endpoints — see docs/analytics-proposed-endpoints.md
   The frontend renders against these shapes today via a demo-data fallback.
   ──────────────────────────────────────────────────────────────────────────── */

export type AnalyticsGranularity = 'day' | 'month';

export type AnalyticsRangeParams = {
  /** Inclusive ISO date (YYYY-MM-DD or full ISO) */
  from: string;
  /** Inclusive ISO date */
  to: string;
  granularity?: AnalyticsGranularity;
};

/** GET /v1/admin/analytics/overview */
export type AnalyticsOverview = {
  totalSales: number;
  totalCommissions: number;
  newUsers: number;
  paidWithdrawals: number;
  /** % change vs the previous period of equal length. Positive = growth. */
  deltaSales: number;
  deltaCommissions: number;
  deltaNewUsers: number;
  deltaPaidWithdrawals: number;
};

/** GET /v1/admin/analytics/timeseries */
export type AnalyticsTimeseriesPoint = {
  /** Bucket start. For granularity=day → YYYY-MM-DD. For granularity=month → YYYY-MM. */
  bucket: string;
  sales: number;
  commissions: number;
  newUsers: number;
  withdrawals: number;
};

export type AnalyticsTimeseries = {
  granularity: AnalyticsGranularity;
  points: AnalyticsTimeseriesPoint[];
};

/** GET /v1/admin/analytics/sales-breakdown */
export type SalesStatusBreakdown = {
  status: 'pending' | 'processed' | 'cancelled' | (string & {});
  count: number;
  amount: number;
};

export type SalesBreakdownResponse = {
  byStatus: SalesStatusBreakdown[];
};

/** GET /v1/admin/analytics/top-performers */
export type TopSellerEntry = {
  userId: string;
  displayName: string;
  sellerCode: string | null;
  salesCount: number;
  salesAmount: number;
};

export type TopCommissionerEntry = {
  userId: string;
  displayName: string;
  sellerCode: string | null;
  commissionsAmount: number;
};

export type TopPerformersResponse = {
  bySales: TopSellerEntry[];
  byCommissions: TopCommissionerEntry[];
};

/** GET /v1/admin/analytics/withdrawals-breakdown */
export type WithdrawalsStatusBreakdown = {
  status: 'pending' | 'approved' | 'paid' | 'rejected' | (string & {});
  count: number;
  amount: number;
};

export type WithdrawalsBreakdownResponse = {
  byStatus: WithdrawalsStatusBreakdown[];
  totalAmount: number;
  totalCount: number;
};
