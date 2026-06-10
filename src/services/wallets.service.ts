import { api, unwrap } from '@/lib/api/client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Wallet } from '@/types/auth';
import type {
  AdjustWalletRequest,
  AllWalletTransactionsParams,
  WalletSnapshot,
  WalletTransaction,
  WalletTransactionsParams,
  WalletsListParams,
} from '@/types/admin/wallets';

export const walletsService = {
  /* ── Existing ─────────────────────────────────────────────────────────── */

  get: (userId: string) =>
    unwrap(api.get<ApiResponse<Wallet>>(`/v1/admin/wallets/${userId}`)),

  transactions: (userId: string, params: WalletTransactionsParams = {}) =>
    unwrap(
      api.get<ApiResponse<PaginatedResponse<WalletTransaction>>>(
        `/v1/admin/wallets/${userId}/transactions`,
        { params: { page: params.page ?? 1, limit: params.limit ?? 20 } },
      ),
    ),

  adjust: (userId: string, body: AdjustWalletRequest) =>
    unwrap(api.post<ApiResponse<Wallet>>(`/v1/admin/wallets/${userId}/adjust`, body)),

  /* ── PROPOSED — see docs/proposed-endpoints.md ────────────────────────── */

  list: (params: WalletsListParams = {}) =>
    unwrap(
      api.get<ApiResponse<PaginatedResponse<WalletSnapshot>>>('/v1/admin/wallets', {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 20,
          ...(params.search ? { search: params.search } : {}),
          ...(params.role ? { role: params.role } : {}),
        },
      }),
    ),

  allTransactions: (params: AllWalletTransactionsParams = {}) =>
    unwrap(
      api.get<ApiResponse<PaginatedResponse<WalletTransaction>>>(
        '/v1/admin/wallets/transactions',
        {
          params: {
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            ...(params.userId ? { userId: params.userId } : {}),
            ...(params.type ? { type: params.type } : {}),
            ...(params.from ? { from: params.from } : {}),
            ...(params.to ? { to: params.to } : {}),
          },
        },
      ),
    ),
};
