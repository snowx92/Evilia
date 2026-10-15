import { api, unwrap } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';
import type { SystemConfig, UpdateSystemConfigRequest } from '@/types/admin/system-config';

export const systemConfigService = {
  /** GET /v1/admin/system-config (super admin only) */
  get: () => unwrap(api.get<ApiResponse<SystemConfig>>('/v1/admin/system-config')),

  /** PUT /v1/admin/system-config (super admin only) */
  update: (body: UpdateSystemConfigRequest) =>
    unwrap(api.put<ApiResponse<SystemConfig>>('/v1/admin/system-config', body)),
};
