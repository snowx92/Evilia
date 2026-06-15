import { api, unwrap } from '@/lib/api/client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Wallet } from '@/types/auth';
import type {
  AdjustWalletRequest,
  ResetWalletRequest,
  WalletListRow,
  WalletTransaction,
  WalletTransactionsParams,
  WalletsListParams,
  WalletsSummary,
} from '@/types/admin/wallets';

export const walletsService = {
  /** GET /v1/admin/wallets/summary */
  summary: () =>
    unwrap(api.get<ApiResponse<WalletsSummary>>('/v1/admin/wallets/summary')),

  /** GET /v1/admin/wallets?page&limit&role&status&search */
  list: (params: WalletsListParams = {}) =>
    unwrap(
      api.get<ApiResponse<PaginatedResponse<WalletListRow>>>('/v1/admin/wallets', {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 20,
          ...(params.role ? { role: params.role } : {}),
          ...(params.status ? { status: params.status } : {}),
          ...(params.search ? { search: params.search } : {}),
        },
      }),
    ),

  /** GET /v1/admin/wallets/{userId} */
  get: (userId: string) =>
    unwrap(api.get<ApiResponse<Wallet>>(`/v1/admin/wallets/${userId}`)),

  /** GET /v1/admin/wallets/{userId}/transactions */
  transactions: (userId: string, params: WalletTransactionsParams = {}) =>
    unwrap(
      api.get<ApiResponse<PaginatedResponse<WalletTransaction>>>(
        `/v1/admin/wallets/${userId}/transactions`,
        { params: { page: params.page ?? 1, limit: params.limit ?? 20 } },
      ),
    ),

  /** POST /v1/admin/wallets/{userId}/adjust */
  adjust: (userId: string, body: AdjustWalletRequest) =>
    unwrap(api.post<ApiResponse<Wallet>>(`/v1/admin/wallets/${userId}/adjust`, body)),

  /** POST /v1/admin/wallets/reset — omit userId to reset ALL wallets. */
  reset: (body: ResetWalletRequest) =>
    unwrap(api.post<ApiResponse<{ success: boolean }>>('/v1/admin/wallets/reset', body)),
};
