'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { systemConfigService } from '@/services/system-config.service';
import { queryKeys } from '@/lib/query-keys';
import type { UpdateSystemConfigRequest } from '@/types/admin/system-config';

export function useSystemConfigQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.systemConfig.detail,
    queryFn: () => systemConfigService.get(),
    enabled,
  });
}

export function useUpdateSystemConfigMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateSystemConfigRequest) => systemConfigService.update(body),
    onSuccess: (data) => qc.setQueryData(queryKeys.systemConfig.detail, data),
  });
}
