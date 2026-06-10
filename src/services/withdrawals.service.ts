import { api, unwrap } from '@/lib/api/client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  PayWithdrawalRequest,
  RejectWithdrawalRequest,
  Withdrawal,
  WithdrawalsListParams,
} from '@/types/admin/withdrawals';

export const withdrawalsService = {
  list: (params: WithdrawalsListParams = {}) =>
    unwrap(
      api.get<ApiResponse<PaginatedResponse<Withdrawal>>>('/v1/admin/withdrawals', {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 20,
          ...(params.status ? { status: params.status } : {}),
        },
      }),
    ),

  approve: (withdrawalId: string) =>
    unwrap(
      api.patch<ApiResponse<Withdrawal>>(`/v1/admin/withdrawals/${withdrawalId}/approve`),
    ),

  reject: (withdrawalId: string, body: RejectWithdrawalRequest) =>
    unwrap(
      api.patch<ApiResponse<Withdrawal>>(
        `/v1/admin/withdrawals/${withdrawalId}/reject`,
        body,
      ),
    ),

  markPaid: (withdrawalId: string, body: PayWithdrawalRequest) =>
    unwrap(
      api.patch<ApiResponse<Withdrawal>>(
        `/v1/admin/withdrawals/${withdrawalId}/pay`,
        body,
      ),
    ),
};
