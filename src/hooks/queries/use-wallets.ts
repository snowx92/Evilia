'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { walletsService } from '@/services/wallets.service';
import { queryKeys } from '@/lib/query-keys';
import { ApiError } from '@/types/api';
import type {
  AdjustWalletRequest,
  AllWalletTransactionsParams,
  WalletTransactionsParams,
  WalletsListParams,
} from '@/types/admin/wallets';

export function useWalletQuery(userId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.wallets.get(userId),
    queryFn: () => walletsService.get(userId),
    enabled: enabled && Boolean(userId),
  });
}

export function useWalletTransactionsQuery(userId: string, params: WalletTransactionsParams = {}) {
  return useQuery({
    queryKey: queryKeys.wallets.transactions(userId, params),
    queryFn: () => walletsService.transactions(userId, params),
    enabled: Boolean(userId),
    placeholderData: (prev) => prev,
  });
}

/** Wallets list (proposed endpoint with demo fallback). */
export function useWalletsListQuery(params: WalletsListParams = {}) {
  const q = useQuery({
    queryKey: ['wallets', 'list', params],
    queryFn: () => walletsService.list(params),
    placeholderData: (prev) => prev,
    retry: (count, err) => {
      if (err instanceof ApiError && (err.status === 404 || err.status === 501)) return false;
      return count < 1;
    },
  });

  const isMissing =
    q.error instanceof ApiError &&
    (q.error.status === 404 || q.error.status === 501 || q.error.status === 0);

  if (q.data) return { data: q.data, isLoading: false, isDemo: false, isError: false };
  if (q.isLoading) return { data: undefined, isLoading: true, isDemo: false, isError: false };
  if (isMissing || q.isError) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { demoWalletsList } = require('@/lib/wallets-list-demo') as typeof import('@/lib/wallets-list-demo');
    return { data: demoWalletsList(params), isLoading: false, isDemo: true, isError: false };
  }
  return { data: undefined, isLoading: false, isDemo: false, isError: true };
}

export function useAllWalletTransactionsQuery(params: AllWalletTransactionsParams = {}) {
  const q = useQuery({
    queryKey: ['wallets', 'all-transactions', params],
    queryFn: () => walletsService.allTransactions(params),
    placeholderData: (prev) => prev,
    retry: (count, err) => {
      // Don't hammer the backend if the endpoint isn't live yet.
      if (err instanceof ApiError && (err.status === 404 || err.status === 501)) return false;
      return count < 1;
    },
  });

  // Lazy import demo data so it stays tree-shakeable.
  const isMissing =
    q.error instanceof ApiError && (q.error.status === 404 || q.error.status === 501 || q.error.status === 0);

  if (q.data) return { data: q.data, isLoading: false, isDemo: false, isError: false };
  if (q.isLoading)
    return { data: undefined, isLoading: true, isDemo: false, isError: false };
  if (isMissing || q.isError) {
    // Synthesize on the fly so design previews end-to-end.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { demoAllWalletTransactions } = require('@/lib/wallets-demo') as typeof import('@/lib/wallets-demo');
    return {
      data: demoAllWalletTransactions(params),
      isLoading: false,
      isDemo: true,
      isError: false,
    };
  }
  return { data: undefined, isLoading: false, isDemo: false, isError: true };
}

export function useAdjustWalletMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, body }: { userId: string; body: AdjustWalletRequest }) =>
      walletsService.adjust(userId, body),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.wallets.get(userId) });
      qc.invalidateQueries({ queryKey: ['wallets', userId, 'transactions'] });
    },
  });
}
