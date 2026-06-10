import { api, unwrap } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';
import type { User } from '@/types/auth';
import type { HierarchyNode, ReassignParentRequest } from '@/types/admin/hierarchy';

export const hierarchyService = {
  tree: (rootId: string) =>
    unwrap(
      api.get<ApiResponse<HierarchyNode[]>>('/v1/admin/hierarchy', { params: { rootId } }),
    ),

  reassignParent: (userId: string, body: ReassignParentRequest) =>
    unwrap(
      api.patch<ApiResponse<User>>(`/v1/admin/hierarchy/${userId}/parent`, body),
    ),
};
