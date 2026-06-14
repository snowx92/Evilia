'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import { queryKeys } from '@/lib/query-keys';
import type {
  DailyAnalyticsParams,
  DailyAnalyticsSummary,
  DashboardRangeParams,
  LeaderboardParams,
  UserMonthlyHistoryParams,
} from '@/types/admin/analytics';

/* ── /v1/admin/analytics/dashboard ────────────────────────────────────────── */

export function useAnalyticsDashboardQuery(params: DashboardRangeParams) {
  return useQuery({
    queryKey: queryKeys.analytics.dashboard(params),
    queryFn: () => analyticsService.dashboard(params),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}

/* ── /v1/admin/analytics/daily ────────────────────────────────────────────── */

/**
 * Today snapshot — calls /daily with no params so the backend returns the
 * single-object shape for the current day.
 */
export function useDailyAnalyticsQuery() {
  return useQuery({
    queryKey: queryKeys.analytics.daily({}),
    queryFn: async () => {
      const res = await analyticsService.daily();
      // Defensive normalisation: API can return either an object or an array.
      const summary = Array.isArray(res) ? res[0] : res;
      return summary as DailyAnalyticsSummary | undefined;
    },
    staleTime: 60_000,
  });
}

/** Range mode — returns the array shape. */
export function useDailyAnalyticsRangeQuery(params: DailyAnalyticsParams) {
  return useQuery({
    queryKey: queryKeys.analytics.daily(params),
    queryFn: async () => {
      const res = await analyticsService.daily(params);
      const arr = Array.isArray(res) ? res : res ? [res] : [];
      return arr;
    },
    enabled: Boolean(params.from && params.to) || Boolean(params.date),
    staleTime: 60_000,
  });
}

/* ── /v1/admin/analytics/leaderboard ──────────────────────────────────────── */

export function useLeaderboardQuery(params: LeaderboardParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.analytics.leaderboard(params),
    queryFn: () => analyticsService.leaderboard(params),
    enabled,
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}

/* ── /v1/admin/analytics/users/{userId} ───────────────────────────────────── */

export function useUserMonthlyAnalyticsQuery(
  userId: string,
  month: string,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.analytics.userMonthly(userId, month),
    queryFn: () => analyticsService.userMonthly(userId, { month }),
    enabled: enabled && Boolean(userId) && Boolean(month),
    staleTime: 60_000,
  });
}

/* ── /v1/admin/analytics/users/{userId}/history ───────────────────────────── */

export function useUserMonthlyHistoryQuery(
  userId: string,
  params: UserMonthlyHistoryParams,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.analytics.userMonthlyHistory(userId, params),
    queryFn: () => analyticsService.userMonthlyHistory(userId, params),
    enabled: enabled && Boolean(userId) && Boolean(params.fromMonth) && Boolean(params.toMonth),
    staleTime: 60_000,
  });
}
