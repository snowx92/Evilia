import { api, unwrap } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';
import type {
  AnalyticsOverview,
  AnalyticsRangeParams,
  AnalyticsTimeseries,
  DailyAnalyticsSummary,
  SalesBreakdownResponse,
  TopPerformersResponse,
  UserMonthlyAnalytics,
  WithdrawalsBreakdownResponse,
} from '@/types/admin/analytics';

export const analyticsService = {
  /* ── EXISTING ─────────────────────────────────────────────────────────── */

  daily: () =>
    unwrap(api.get<ApiResponse<DailyAnalyticsSummary>>('/v1/admin/analytics/daily')),

  userMonthly: (userId: string) =>
    unwrap(
      api.get<ApiResponse<UserMonthlyAnalytics>>(`/v1/admin/analytics/users/${userId}`),
    ),

  /* ── PROPOSED ─────────────────────────────────────────────────────────────
     See docs/analytics-proposed-endpoints.md for the request/response contract.
     Until the backend ships these, the page renders deterministic preview data.
     ─────────────────────────────────────────────────────────────────────── */

  overview: (params: AnalyticsRangeParams) =>
    unwrap(
      api.get<ApiResponse<AnalyticsOverview>>('/v1/admin/analytics/overview', { params }),
    ),

  timeseries: (params: AnalyticsRangeParams) =>
    unwrap(
      api.get<ApiResponse<AnalyticsTimeseries>>('/v1/admin/analytics/timeseries', { params }),
    ),

  salesBreakdown: (params: Pick<AnalyticsRangeParams, 'from' | 'to'>) =>
    unwrap(
      api.get<ApiResponse<SalesBreakdownResponse>>('/v1/admin/analytics/sales-breakdown', {
        params,
      }),
    ),

  topPerformers: (params: Pick<AnalyticsRangeParams, 'from' | 'to'> & { limit?: number }) =>
    unwrap(
      api.get<ApiResponse<TopPerformersResponse>>('/v1/admin/analytics/top-performers', {
        params: { limit: 5, ...params },
      }),
    ),

  withdrawalsBreakdown: (params: Pick<AnalyticsRangeParams, 'from' | 'to'>) =>
    unwrap(
      api.get<ApiResponse<WithdrawalsBreakdownResponse>>(
        '/v1/admin/analytics/withdrawals-breakdown',
        { params },
      ),
    ),
};
