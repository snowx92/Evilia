'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogService } from '@/services/catalog.service';
import { queryKeys } from '@/lib/query-keys';
import type { CatalogListParams, CatalogProductInput } from '@/types/admin/catalog';

export function useCatalogListQuery(params: CatalogListParams) {
  return useQuery({
    queryKey: queryKeys.catalog.list(params),
    queryFn: () => catalogService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useCatalogProductQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.catalog.detail(id),
    queryFn: () => catalogService.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateCatalogProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CatalogProductInput) => catalogService.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['catalog'] }),
  });
}

export function useUpdateCatalogProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CatalogProductInput }) =>
      catalogService.update(id, body),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['catalog'] });
      qc.invalidateQueries({ queryKey: queryKeys.catalog.detail(vars.id) });
    },
  });
}

export function useDeleteCatalogProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => catalogService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['catalog'] }),
  });
}
