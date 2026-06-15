'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { walletsService } from '@/services/wallets.service';
import { queryKeys } from '@/lib/query-keys';
import type {
  AdjustWalletRequest,
  ResetWalletRequest,
  WalletTransactionsParams,
  WalletsListParams,
} from '@/types/admin/wallets';

export function useWalletsSummaryQuery() {
  return useQuery({
    queryKey: queryKeys.wallets.summary,
    queryFn: () => walletsService.summary(),
    staleTime: 60_000,
  });
}

export function useWalletsListQuery(params: WalletsListParams = {}) {
  return useQuery({
    queryKey: queryKeys.wallets.list(params),
    queryFn: () => walletsService.list(params),
    placeholderData: (prev) => prev,
  });
}

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

export function useAdjustWalletMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, body }: { userId: string; body: AdjustWalletRequest }) =>
      walletsService.adjust(userId, body),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.wallets.summary });
      qc.invalidateQueries({ queryKey: ['wallets', 'list'] });
      qc.invalidateQueries({ queryKey: queryKeys.wallets.get(userId) });
      qc.invalidateQueries({ queryKey: ['wallets', userId, 'transactions'] });
    },
  });
}

export function useResetWalletMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ResetWalletRequest) => walletsService.reset(body),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.wallets.summary });
      qc.invalidateQueries({ queryKey: ['wallets', 'list'] });
      if (userId) {
        qc.invalidateQueries({ queryKey: queryKeys.wallets.get(userId) });
        qc.invalidateQueries({ queryKey: ['wallets', userId, 'transactions'] });
      }
    },
  });
}
