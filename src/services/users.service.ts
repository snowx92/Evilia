import { api, unwrap } from '@/lib/api/client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { User } from '@/types/auth';
import type {
  CreateSellerRequest,
  CreateSubAdminRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UsersListParams,
} from '@/types/admin/users';

export const usersService = {
  /** GET /v1/admin/users?page&limit&role&status */
  list: (params: UsersListParams = {}) =>
    unwrap(
      api.get<ApiResponse<PaginatedResponse<User>>>('/v1/admin/users', {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 20,
          ...(params.role ? { role: params.role } : {}),
          ...(params.status ? { status: params.status } : {}),
        },
      }),
    ),

  /** GET /v1/admin/users/{userId} */
  getById: (userId: string) =>
    unwrap(api.get<ApiResponse<User>>(`/v1/admin/users/${userId}`)),

  /** POST /v1/admin/users — create admin / sub-admin (super admin only). */
  createAdmin: (body: CreateSubAdminRequest) =>
    unwrap(api.post<ApiResponse<CreateUserResponse>>('/v1/admin/users', body)),

  /** POST /v1/admin/users — create seller. */
  createSeller: (body: CreateSellerRequest) =>
    unwrap(api.post<ApiResponse<CreateUserResponse>>('/v1/admin/users', body)),

  /** PUT /v1/admin/users/{userId} */
  update: (userId: string, body: UpdateUserRequest) =>
    unwrap(api.put<ApiResponse<User>>(`/v1/admin/users/${userId}`, body)),

  /** PATCH /v1/admin/users/{userId}/suspend */
  suspend: (userId: string) => {
    if (!userId) throw new Error('suspend: userId is required');
    return unwrap(
      api.patch<ApiResponse<User>>(`/v1/admin/users/${encodeURIComponent(userId)}/suspend`),
    );
  },

  /** PATCH /v1/admin/users/{userId}/activate */
  activate: (userId: string) => {
    if (!userId) throw new Error('activate: userId is required');
    return unwrap(
      api.patch<ApiResponse<User>>(`/v1/admin/users/${encodeURIComponent(userId)}/activate`),
    );
  },

  /** PATCH /v1/admin/users/{userId}/password — admin-driven password reset. */
  changePassword: (userId: string, password: string) => {
    if (!userId) throw new Error('changePassword: userId is required');
    return unwrap(
      api.patch<ApiResponse<{ success: boolean }>>(
        `/v1/admin/users/${encodeURIComponent(userId)}/password`,
        { password },
      ),
    );
  },
};
