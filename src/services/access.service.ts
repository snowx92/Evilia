import { api, unwrap } from '@/lib/api/client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  AdminUser,
  AdminsListParams,
  PermissionCatalog,
  UpdateAdminPermissionsRequest,
} from '@/types/admin/access';

export const accessService = {
  permissionCatalog: () =>
    unwrap(api.get<ApiResponse<PermissionCatalog>>('/v1/admin/permissions')),

  listAdmins: (params: AdminsListParams = {}) =>
    unwrap(
      api.get<ApiResponse<PaginatedResponse<AdminUser>>>('/v1/admin/admins', {
        params: { page: params.page ?? 1, limit: params.limit ?? 20 },
      }),
    ),

  updateAdminPermissions: (adminId: string, body: UpdateAdminPermissionsRequest) =>
    unwrap(
      api.put<ApiResponse<AdminUser>>(`/v1/admin/admins/${adminId}/permissions`, body),
    ),
};
