'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { withdrawalsService } from '@/services/withdrawals.service';
import { queryKeys } from '@/lib/query-keys';
import type {
  PayWithdrawalRequest,
  RejectWithdrawalRequest,
  WithdrawalsListParams,
} from '@/types/admin/withdrawals';

export function useWithdrawalsQuery(params: WithdrawalsListParams) {
  return useQuery({
    queryKey: queryKeys.withdrawals.list(params),
    queryFn: () => withdrawalsService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useApproveWithdrawalMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => withdrawalsService.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['withdrawals', 'list'] }),
  });
}

export function useRejectWithdrawalMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: RejectWithdrawalRequest }) =>
      withdrawalsService.reject(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['withdrawals', 'list'] }),
  });
}

export function usePayWithdrawalMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: PayWithdrawalRequest }) =>
      withdrawalsService.markPaid(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['withdrawals', 'list'] }),
  });
}
