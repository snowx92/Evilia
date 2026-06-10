'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accessService } from '@/services/access.service';
import { queryKeys } from '@/lib/query-keys';
import type {
  AdminsListParams,
  UpdateAdminPermissionsRequest,
} from '@/types/admin/access';

export function usePermissionCatalogQuery() {
  return useQuery({
    queryKey: queryKeys.access.permissionCatalog,
    queryFn: () => accessService.permissionCatalog(),
    staleTime: 10 * 60_000,
  });
}

export function useAdminsQuery(params: AdminsListParams) {
  return useQuery({
    queryKey: queryKeys.access.admins(params),
    queryFn: () => accessService.listAdmins(params),
    placeholderData: (prev) => prev,
  });
}

export function useUpdateAdminPermissionsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      adminId,
      body,
    }: {
      adminId: string;
      body: UpdateAdminPermissionsRequest;
    }) => accessService.updateAdminPermissions(adminId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['access'] }),
  });
}
