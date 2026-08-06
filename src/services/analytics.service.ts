import { api, unwrap } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';
import type {
  AnalyticsDashboardResponse,
  DailyAnalyticsParams,
  DailyAnalyticsResponse,
  DashboardRangeParams,
  LeaderboardParams,
  LeaderboardResponse,
  OwnerOverviewResponse,
  OwnerReportParams,
  OwnerReportResponse,
  SalesAnalyticsParams,
  SalesAnalyticsResponse,
  UserMonthlyAnalytics,
  UserMonthlyAnalyticsParams,
  UserMonthlyHistoryEntry,
  UserMonthlyHistoryParams,
} from '@/types/admin/analytics';

export const analyticsService = {
  /** GET /v1/admin/analytics/dashboard?from=YYYY-MM-DD&to=YYYY-MM-DD */
  dashboard: (params: DashboardRangeParams) =>
    unwrap(
      api.get<ApiResponse<AnalyticsDashboardResponse>>('/v1/admin/analytics/dashboard', {
        params,
      }),
    ),

  /** GET /v1/admin/analytics/owner-overview — live money + pipeline for home. */
  ownerOverview: () =>
    unwrap(api.get<ApiResponse<OwnerOverviewResponse>>('/v1/admin/analytics/owner-overview')),

  /** GET /v1/admin/analytics/owner-report?from&to — range P&L + trends. */
  ownerReport: (params: OwnerReportParams) =>
    unwrap(
      api.get<ApiResponse<OwnerReportResponse>>('/v1/admin/analytics/owner-report', {
        params,
      }),
    ),

  /** GET /v1/admin/analytics/sales?from&to&sellerId&scope — per-status breakdown. */
  sales: (params: SalesAnalyticsParams) =>
    unwrap(
      api.get<ApiResponse<SalesAnalyticsResponse>>('/v1/admin/analytics/sales', {
        params: {
          from: params.from,
          to: params.to,
          ...(params.sellerId ? { sellerId: params.sellerId } : {}),
          ...(params.scope ? { scope: params.scope } : {}),
        },
      }),
    ),

  /**
   * GET /v1/admin/analytics/daily
   * Pass `date` for a single-day object, or `from`/`to` for an array of days.
   */
  daily: (params: DailyAnalyticsParams = {}) =>
    unwrap(
      api.get<ApiResponse<DailyAnalyticsResponse>>('/v1/admin/analytics/daily', { params }),
    ),

  /** GET /v1/admin/analytics/leaderboard?month=YYYY-MM&metric=...&limit=... */
  leaderboard: (params: LeaderboardParams) =>
    unwrap(
      api.get<ApiResponse<LeaderboardResponse>>('/v1/admin/analytics/leaderboard', {
        params: { limit: 10, ...params },
      }),
    ),

  /** GET /v1/admin/analytics/users/{userId}?month=YYYY-MM */
  userMonthly: (userId: string, params: UserMonthlyAnalyticsParams) =>
    unwrap(
      api.get<ApiResponse<UserMonthlyAnalytics>>(`/v1/admin/analytics/users/${userId}`, {
        params,
      }),
    ),

  /** GET /v1/admin/analytics/users/{userId}/history?fromMonth=YYYY-MM&toMonth=YYYY-MM */
  userMonthlyHistory: (userId: string, params: UserMonthlyHistoryParams) =>
    unwrap(
      api.get<ApiResponse<UserMonthlyHistoryEntry[]>>(
        `/v1/admin/analytics/users/${userId}/history`,
        { params },
      ),
    ),
};
