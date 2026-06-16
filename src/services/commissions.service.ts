import { api, unwrap } from '@/lib/api/client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Commission, CommissionsListParams } from '@/types/admin/commissions';

export const commissionsService = {
  list: (params: CommissionsListParams = {}) =>
    unwrap(
      api.get<ApiResponse<PaginatedResponse<Commission>>>('/v1/admin/commissions', {
        params: { page: params.page ?? 1, limit: params.limit ?? 20 },
      }),
    ),
};
