import { api, unwrap } from '@/lib/api/client';
import type {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  MeResponse,
  Notification,
  UpdateProfileRequest,
  User,
} from '@/types/auth';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api';

export const authService = {
  login: (body: LoginRequest) =>
    unwrap(api.post<ApiResponse<LoginResponse>>('/v1/auth/login', body)),

  me: () => unwrap(api.get<ApiResponse<MeResponse>>('/v1/me')),

  updateProfile: (body: UpdateProfileRequest) =>
    unwrap(api.put<ApiResponse<{ user: User }>>('/v1/me/profile', body)),

  changePassword: (body: ChangePasswordRequest) =>
    unwrap(
      api.put<ApiResponse<{ success: boolean }>>('/v1/auth/change-password', body),
    ),

  registerFcmToken: (token: string) =>
    unwrap(api.put<ApiResponse<null>>('/v1/me/fcm-token', { token })),

  listNotifications: (params: PaginationParams = {}) =>
    unwrap(
      api.get<ApiResponse<PaginatedResponse<Notification>>>('/v1/me/notifications', {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 20,
        },
      }),
    ),

  markNotificationRead: (notificationId: string) =>
    unwrap(api.patch<ApiResponse<null>>(`/v1/me/notifications/${notificationId}/read`)),

  markAllNotificationsRead: () =>
    unwrap(api.patch<ApiResponse<null>>('/v1/me/notifications/read-all')),
};
