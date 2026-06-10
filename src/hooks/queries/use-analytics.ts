'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import { queryKeys } from '@/lib/query-keys';
import {
  demoOverview,
  demoSalesBreakdown,
  demoTimeseries,
  demoTopPerformers,
  demoWithdrawalsBreakdown,
} from '@/lib/analytics-demo';
import { ApiError } from '@/types/api';
import type {
  AnalyticsGranularity,
  AnalyticsOverview,
  AnalyticsRangeParams,
  AnalyticsTimeseries,
  SalesBreakdownResponse,
  TopPerformersResponse,
  WithdrawalsBreakdownResponse,
} from '@/types/admin/analytics';

/* ── Existing endpoints ────────────────────────────────────────────────── */

export function useDailyAnalyticsQuery() {
  return useQuery({
    queryKey: queryKeys.analytics.daily,
    queryFn: () => analyticsService.daily(),
    staleTime: 60_000,
  });
}

export function useUserMonthlyAnalyticsQuery(userId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.analytics.userMonthly(userId),
    queryFn: () => analyticsService.userMonthly(userId),
    enabled: enabled && Boolean(userId),
  });
}

/* ── Proposed endpoints ────────────────────────────────────────────────────
   Each hook tries the backend first; on 404 (not yet implemented) it falls
   back to deterministic preview data and surfaces `isDemo: true` so the UI
   can show a "preview data" pill. Any other error surfaces normally.
   ─────────────────────────────────────────────────────────────────────── */

type WithDemo<T> = { data: T; isDemo: boolean; isLoading: boolean; isError: boolean };

function isMissingEndpoint(err: unknown): boolean {
  return err instanceof ApiError && (err.status === 404 || err.status === 501 || err.status === 0);
}

export function useAnalyticsTimeseries(
  from: Date,
  to: Date,
  granularity: AnalyticsGranularity,
): WithDemo<AnalyticsTimeseries> {
  const params: AnalyticsRangeParams = {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
    granularity,
  };
  const q = useQuery({
    queryKey: ['analytics', 'timeseries', params],
    queryFn: () => analyticsService.timeseries(params),
    retry: (count, err) => (isMissingEndpoint(err) ? false : count < 1),
    staleTime: 60_000,
  });

  if (q.data) return { data: q.data, isDemo: false, isLoading: false, isError: false };
  if (q.isLoading)
    return {
      data: { granularity, points: [] },
      isDemo: false,
      isLoading: true,
      isError: false,
    };
  // Backend not implemented (or unreachable) → render demo data so design previews end-to-end.
  if (isMissingEndpoint(q.error) || q.isError) {
    return { data: demoTimeseries(from, to, granularity), isDemo: true, isLoading: false, isError: false };
  }
  return { data: { granularity, points: [] }, isDemo: false, isLoading: false, isError: true };
}

export function useAnalyticsOverview(
  from: Date,
  to: Date,
  granularity: AnalyticsGranularity,
  fallbackSeries: AnalyticsTimeseries,
): WithDemo<AnalyticsOverview> {
  const params: AnalyticsRangeParams = {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
    granularity,
  };
  const q = useQuery({
    queryKey: ['analytics', 'overview', params],
    queryFn: () => analyticsService.overview(params),
    retry: (count, err) => (isMissingEndpoint(err) ? false : count < 1),
    staleTime: 60_000,
  });
  if (q.data) return { data: q.data, isDemo: false, isLoading: false, isError: false };
  if (q.isLoading) {
    return {
      data: {
        totalSales: 0,
        totalCommissions: 0,
        newUsers: 0,
        paidWithdrawals: 0,
        deltaSales: 0,
        deltaCommissions: 0,
        deltaNewUsers: 0,
        deltaPaidWithdrawals: 0,
      },
      isDemo: false,
      isLoading: true,
      isError: false,
    };
  }
  return { data: demoOverview(fallbackSeries), isDemo: true, isLoading: false, isError: false };
}

export function useAnalyticsSalesBreakdown(
  from: Date,
  to: Date,
  fallbackSeries: AnalyticsTimeseries,
): WithDemo<SalesBreakdownResponse> {
  const params = {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
  const q = useQuery({
    queryKey: ['analytics', 'sales-breakdown', params],
    queryFn: () => analyticsService.salesBreakdown(params),
    retry: (count, err) => (isMissingEndpoint(err) ? false : count < 1),
    staleTime: 60_000,
  });
  if (q.data) return { data: q.data, isDemo: false, isLoading: false, isError: false };
  if (q.isLoading)
    return { data: { byStatus: [] }, isDemo: false, isLoading: true, isError: false };
  return { data: demoSalesBreakdown(fallbackSeries), isDemo: true, isLoading: false, isError: false };
}

export function useAnalyticsTopPerformers(
  from: Date,
  to: Date,
  fallbackSeries: AnalyticsTimeseries,
): WithDemo<TopPerformersResponse> {
  const params = {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
  const q = useQuery({
    queryKey: ['analytics', 'top-performers', params],
    queryFn: () => analyticsService.topPerformers(params),
    retry: (count, err) => (isMissingEndpoint(err) ? false : count < 1),
    staleTime: 60_000,
  });
  if (q.data) return { data: q.data, isDemo: false, isLoading: false, isError: false };
  if (q.isLoading)
    return {
      data: { bySales: [], byCommissions: [] },
      isDemo: false,
      isLoading: true,
      isError: false,
    };
  return { data: demoTopPerformers(fallbackSeries), isDemo: true, isLoading: false, isError: false };
}

export function useAnalyticsWithdrawals(
  from: Date,
  to: Date,
  fallbackSeries: AnalyticsTimeseries,
): WithDemo<WithdrawalsBreakdownResponse> {
  const params = {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
  const q = useQuery({
    queryKey: ['analytics', 'withdrawals-breakdown', params],
    queryFn: () => analyticsService.withdrawalsBreakdown(params),
    retry: (count, err) => (isMissingEndpoint(err) ? false : count < 1),
    staleTime: 60_000,
  });
  if (q.data) return { data: q.data, isDemo: false, isLoading: false, isError: false };
  if (q.isLoading)
    return {
      data: { byStatus: [], totalAmount: 0, totalCount: 0 },
      isDemo: false,
      isLoading: true,
      isError: false,
    };
  return {
    data: demoWithdrawalsBreakdown(fallbackSeries),
    isDemo: true,
    isLoading: false,
    isError: false,
  };
}
