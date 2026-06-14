'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sellerService } from '@/services/seller.service';
import { queryKeys } from '@/lib/query-keys';
import type {
  RequestWithdrawalRequest,
  SellerPaginationParams,
} from '@/types/seller';

// ─── Network ─────────────────────────────────────────────────────────────────

export function useSellerNetworkQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.seller.network,
    queryFn: () => sellerService.network(),
    enabled,
    staleTime: 60_000,
  });
}

export function useSellerNetworkTreeQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.seller.networkTree,
    queryFn: () => sellerService.networkTree(),
    enabled,
    staleTime: 60_000,
  });
}

export function useSellerNetworkRevenueQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.seller.networkRevenue,
    queryFn: () => sellerService.networkRevenue(),
    enabled,
    staleTime: 60_000,
  });
}

export function useSellerNetworkCommissionsQuery(params: SellerPaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.seller.networkCommissions(params),
    queryFn: () => sellerService.networkCommissions(params),
    placeholderData: (prev) => prev,
  });
}

// ─── Sales ───────────────────────────────────────────────────────────────────

export function useSellerSalesQuery(params: SellerPaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.seller.sales(params),
    queryFn: () => sellerService.sales(params),
    placeholderData: (prev) => prev,
  });
}

// ─── Commissions ─────────────────────────────────────────────────────────────

export function useSellerCommissionsQuery(params: SellerPaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.seller.commissions(params),
    queryFn: () => sellerService.commissions(params),
    placeholderData: (prev) => prev,
  });
}

// ─── Wallet ──────────────────────────────────────────────────────────────────

export function useSellerWalletQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.seller.wallet,
    queryFn: () => sellerService.wallet(),
    enabled,
    staleTime: 30_000,
  });
}

export function useSellerWalletTransactionsQuery(params: SellerPaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.seller.walletTransactions(params),
    queryFn: () => sellerService.walletTransactions(params),
    placeholderData: (prev) => prev,
  });
}

// ─── Withdrawals ─────────────────────────────────────────────────────────────

export function useSellerWithdrawalsQuery(params: SellerPaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.seller.withdrawals(params),
    queryFn: () => sellerService.withdrawals(params),
    placeholderData: (prev) => prev,
  });
}

export function useRequestWithdrawalMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RequestWithdrawalRequest) => sellerService.requestWithdrawal(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller', 'withdrawals'] });
      qc.invalidateQueries({ queryKey: queryKeys.seller.wallet });
    },
  });
}
