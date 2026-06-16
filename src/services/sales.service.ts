import { api, unwrap } from '@/lib/api/client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Sale, SaleStatus, SalesListParams } from '@/types/admin/sales';

export const salesService = {
  list: (params: SalesListParams = {}) =>
    unwrap(
      api.get<ApiResponse<PaginatedResponse<Sale>>>('/v1/admin/sales', {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 20,
          ...(params.status ? { status: params.status } : {}),
        },
      }),
    ),

  /** GET /v1/admin/sales/{saleId} — returns `{ sale }`. */
  getById: (saleId: string) => {
    if (!saleId) throw new Error('getById: saleId is required');
    return unwrap(
      api.get<ApiResponse<{ sale: Sale }>>(
        `/v1/admin/sales/${encodeURIComponent(saleId)}`,
      ),
    ).then((d) => d.sale);
  },

  /** PATCH /v1/admin/sales/{saleId}/status — body `{ status }`. */
  updateStatus: (saleId: string, status: SaleStatus) => {
    if (!saleId) throw new Error('updateStatus: saleId is required');
    return unwrap(
      api.patch<ApiResponse<Sale>>(
        `/v1/admin/sales/${encodeURIComponent(saleId)}/status`,
        { status },
      ),
    );
  },
};
