import { api, unwrap } from '@/lib/api/client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  CatalogListParams,
  CatalogProduct,
  CatalogProductInput,
} from '@/types/admin/catalog';

const CATALOG_TIMEOUT_MS = 120_000;

export const catalogService = {
  list: (params: CatalogListParams = {}) =>
    unwrap(
      api.get<ApiResponse<PaginatedResponse<CatalogProduct>>>('/v1/admin/catalog/products', {
        params: { page: params.page ?? 1, limit: params.limit ?? 20 },
      }),
    ),

  get: (id: string) => {
    if (!id) throw new Error('get: catalog product id is required');
    return unwrap(
      api.get<ApiResponse<CatalogProduct>>(
        `/v1/admin/catalog/products/${encodeURIComponent(id)}`,
      ),
    );
  },

  create: (body: CatalogProductInput) =>
    unwrap(
      api.post<ApiResponse<CatalogProduct>>('/v1/admin/catalog/products', body, {
        timeout: CATALOG_TIMEOUT_MS,
      }),
    ),

  update: (id: string, body: CatalogProductInput) => {
    if (!id) throw new Error('update: catalog product id is required');
    return unwrap(
      api.put<ApiResponse<CatalogProduct>>(
        `/v1/admin/catalog/products/${encodeURIComponent(id)}`,
        body,
        { timeout: CATALOG_TIMEOUT_MS },
      ),
    );
  },

  remove: (id: string) => {
    if (!id) throw new Error('remove: catalog product id is required');
    return unwrap(
      api.delete<ApiResponse<null>>(
        `/v1/admin/catalog/products/${encodeURIComponent(id)}`,
      ),
    );
  },
};
