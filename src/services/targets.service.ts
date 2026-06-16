import { api, unwrap } from '@/lib/api/client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  CreateTargetRequest,
  Target,
  TargetsListParams,
  UpdateTargetRequest,
} from '@/types/admin/targets';

export const targetsService = {
  list: (params: TargetsListParams = {}) =>
    unwrap(
      api.get<ApiResponse<PaginatedResponse<Target>>>('/v1/admin/targets', {
        params: { page: params.page ?? 1, limit: params.limit ?? 20 },
      }),
    ),

  create: (body: CreateTargetRequest) =>
    unwrap(api.post<ApiResponse<Target>>('/v1/admin/targets', body)),

  update: (targetId: string, body: UpdateTargetRequest) =>
    unwrap(api.put<ApiResponse<Target>>(`/v1/admin/targets/${targetId}`, body)),

  remove: (targetId: string) => {
    if (!targetId) throw new Error('remove: targetId is required');
    return unwrap(
      api.delete<ApiResponse<null>>(`/v1/admin/targets/${encodeURIComponent(targetId)}`),
    );
  },
};
