import { api, unwrap } from '@/lib/api/client';
import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
  Notification,
} from '@/types/auth';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api';

export const authService = {
  login: (body: LoginRequest) =>
    unwrap(api.post<ApiResponse<LoginResponse>>('/v1/auth/login', body)),

  me: () => unwrap(api.get<ApiResponse<MeResponse>>('/v1/me')),

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
