import { api, unwrap } from '@/lib/api/client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  RequestWithdrawalRequest,
  SellerCommission,
  SellerNetworkCommission,
  SellerNetworkMember,
  SellerNetworkRevenue,
  SellerNetworkTreeNode,
  SellerPaginationParams,
  SellerSale,
  SellerWallet,
  SellerWalletTransaction,
  SellerWithdrawal,
} from '@/types/seller';

const withPagination = (params: SellerPaginationParams = {}) => ({
  page: params.page ?? 1,
  limit: params.limit ?? 20,
});

export const sellerService = {
  // ── Network ────────────────────────────────────────────────────────────────

  /** GET /v1/sellers/network */
  network: () =>
    unwrap(api.get<ApiResponse<SellerNetworkMember[]>>('/v1/sellers/network')),

  /** GET /v1/sellers/network/tree */
  networkTree: () =>
    unwrap(api.get<ApiResponse<SellerNetworkTreeNode>>('/v1/sellers/network/tree')),

  /** GET /v1/sellers/network/revenue */
  networkRevenue: () =>
    unwrap(api.get<ApiResponse<SellerNetworkRevenue>>('/v1/sellers/network/revenue')),

  /** GET /v1/sellers/network/commissions */
  networkCommissions: (params: SellerPaginationParams = {}) =>
    unwrap(
      api.get<ApiResponse<PaginatedResponse<SellerNetworkCommission>>>(
        '/v1/sellers/network/commissions',
        { params: withPagination(params) },
      ),
    ),

  // ── Sales ──────────────────────────────────────────────────────────────────

  /** GET /v1/sellers/sales */
  sales: (params: SellerPaginationParams = {}) =>
    unwrap(
      api.get<ApiResponse<PaginatedResponse<SellerSale>>>('/v1/sellers/sales', {
        params: withPagination(params),
      }),
    ),

  // ── Commissions ────────────────────────────────────────────────────────────

  /** GET /v1/sellers/commissions */
  commissions: (params: SellerPaginationParams = {}) =>
    unwrap(
      api.get<ApiResponse<PaginatedResponse<SellerCommission>>>('/v1/sellers/commissions', {
        params: withPagination(params),
      }),
    ),

  // ── Wallet ─────────────────────────────────────────────────────────────────

  /** GET /v1/sellers/wallet */
  wallet: () => unwrap(api.get<ApiResponse<SellerWallet>>('/v1/sellers/wallet')),

  /** GET /v1/sellers/wallet/transactions */
  walletTransactions: (params: SellerPaginationParams = {}) =>
    unwrap(
      api.get<ApiResponse<PaginatedResponse<SellerWalletTransaction>>>(
        '/v1/sellers/wallet/transactions',
        { params: withPagination(params) },
      ),
    ),

  // ── Withdrawals ────────────────────────────────────────────────────────────

  /** GET /v1/sellers/withdrawals */
  withdrawals: (params: SellerPaginationParams = {}) =>
    unwrap(
      api.get<ApiResponse<PaginatedResponse<SellerWithdrawal>>>('/v1/sellers/withdrawals', {
        params: withPagination(params),
      }),
    ),

  /** POST /v1/sellers/withdrawals */
  requestWithdrawal: (body: RequestWithdrawalRequest) =>
    unwrap(api.post<ApiResponse<SellerWithdrawal>>('/v1/sellers/withdrawals', body)),
};
