// Source of truth: docs/analytics-proposed-endpoints.md and the Postman
// collection (Admins / Admin — Analytics).
//
// All endpoints under /v1/admin/analytics require `analytics.read`.

import type { User } from '@/types/auth';

// ─── /v1/admin/analytics/dashboard ───────────────────────────────────────────

export type DashboardRangeParams = {
  /** Inclusive ISO date YYYY-MM-DD */
  from: string;
  /** Inclusive ISO date YYYY-MM-DD */
  to: string;
};

export type DashboardSummaryAmount = {
  amount: number;
  /** % change vs prior period of equal length. Positive = growth. */
  changePercentage: number;
};

export type DashboardSummaryCount = {
  count: number;
  changePercentage: number;
};

export type DashboardSummaryWithdrawals = {
  amount: number;
  count: number;
  changePercentage: number;
};

export type DashboardSummary = {
  totalSales: DashboardSummaryAmount;
  totalCommissions: DashboardSummaryAmount;
  activeUsers: DashboardSummaryCount;
  withdrawals: DashboardSummaryWithdrawals;
};

export type DashboardTodaySnapshot = {
  /** YYYY-MM-DD */
  date: string;
  /** Money value of all sales today. Omitted by the API when zero. */
  totalSalesAmount?: number;
  /** Money value of all commissions today. Omitted by the API when zero. */
  totalCommissionsAmount?: number;
  /** Count of active users today. */
  activeUsers: number;
};

export type DashboardSalesCommissionsPoint = {
  /** YYYY-MM-DD */
  date: string;
  totalSalesAmount: number;
  totalCommissionsAmount: number;
};

export type DashboardActiveUsersPoint = {
  /** YYYY-MM-DD */
  date: string;
  value: number;
};

export type DashboardTrends = {
  salesAndCommissions: DashboardSalesCommissionsPoint[];
  activeUsers: DashboardActiveUsersPoint[];
};

export type SalesStatus = 'processed' | 'pending' | 'cancelled' | (string & {});
export type WithdrawalStatusLabel = 'paid' | 'approved' | 'pending' | 'rejected' | (string & {});

export type SalesStatusBreakdownItem = {
  status: SalesStatus;
  count: number;
  amount: number;
};

export type WithdrawalsStatusBreakdownItem = {
  status: WithdrawalStatusLabel;
  count: number;
  amount: number;
};

export type DashboardSalesByStatus = {
  totalAmount: number;
  totalCount: number;
  breakdown: SalesStatusBreakdownItem[];
};

export type DashboardWithdrawalsByStatus = {
  totalAmount: number;
  totalCount: number;
  breakdown: WithdrawalsStatusBreakdownItem[];
};

export type AnalyticsDashboardResponse = {
  range: { from: string; to: string };
  summary: DashboardSummary;
  today: DashboardTodaySnapshot;
  trends: DashboardTrends;
  salesByStatus: DashboardSalesByStatus;
  withdrawalsByStatus: DashboardWithdrawalsByStatus;
};

// ─── /v1/admin/analytics/daily ───────────────────────────────────────────────

export type DailyAnalyticsParams = {
  /** Single day mode. */
  date?: string;
  /** Range mode (inclusive). */
  from?: string;
  /** Range mode (inclusive). */
  to?: string;
};

export type DailyAnalyticsSummary = {
  /** YYYY-MM-DD */
  date: string;
  /** Count of sales. Omitted by the API when zero. */
  totalSales?: number;
  /** Money value of all sales. Omitted by the API when zero. */
  totalSalesAmount?: number;
  /** Count of commission events. Omitted by the API when zero. */
  totalCommissions?: number;
  /** Money value of all commissions. Omitted by the API when zero. */
  totalCommissionsAmount?: number;
  /** Count of active users that day. */
  activeUsers: number;
};

/** The API returns a single object when called with `date`, an array when called with from/to. */
export type DailyAnalyticsResponse = DailyAnalyticsSummary | DailyAnalyticsSummary[];

// ─── /v1/admin/analytics/leaderboard ─────────────────────────────────────────

export type LeaderboardMetric =
  | 'salesAmount'
  | 'commissionsEarned'
  | 'networkSalesAmount';

export type LeaderboardParams = {
  /** YYYY-MM */
  month: string;
  metric: LeaderboardMetric;
  limit?: number;
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  metric: LeaderboardMetric;
  value: number;
  salesCount: number;
  user: User;
};

export type LeaderboardResponse = {
  /** YYYY-MM */
  month: string;
  metric: LeaderboardMetric;
  items: LeaderboardEntry[];
};

// ─── /v1/admin/analytics/users/{userId} ──────────────────────────────────────

export type UserMonthlyAnalyticsParams = {
  /** YYYY-MM */
  month: string;
};

export type UserMonthlyAnalytics = {
  userId: string;
  /** YYYY-MM */
  month: string;
  salesCount: number;
  salesAmount: number;
  commissionsEarned: number;
  networkSalesCount: number;
  networkSalesAmount: number;
};

// ─── /v1/admin/analytics/users/{userId}/history ──────────────────────────────

export type UserMonthlyHistoryParams = {
  /** YYYY-MM */
  fromMonth: string;
  /** YYYY-MM */
  toMonth: string;
};

export type UserMonthlyHistoryEntry = {
  userId: string;
  month: string;
  salesCount: number;
  salesAmount: number;
  commissionsEarned: number;
};
