import { api, unwrap } from '@/lib/api/client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { User } from '@/types/auth';
import type {
  CreateSubAdminRequest,
  CreateMemberRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UsersListParams,
} from '@/types/admin/users';

export const usersService = {
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

  getById: (userId: string) =>
    unwrap(api.get<ApiResponse<User>>(`/v1/admin/users/${userId}`)),

  create: (body: CreateSubAdminRequest) =>
    unwrap(api.post<ApiResponse<CreateUserResponse>>('/v1/admin/users', body)),

  createMember: (body: CreateMemberRequest) =>
    unwrap(api.post<ApiResponse<CreateUserResponse>>('/v1/admin/users', body)),

  update: (userId: string, body: UpdateUserRequest) =>
    unwrap(api.put<ApiResponse<User>>(`/v1/admin/users/${userId}`, body)),

  suspend: (userId: string) =>
    unwrap(api.patch<ApiResponse<User>>(`/v1/admin/users/${userId}/suspend`)),

  activate: (userId: string) =>
    unwrap(api.patch<ApiResponse<User>>(`/v1/admin/users/${userId}/activate`)),
};
