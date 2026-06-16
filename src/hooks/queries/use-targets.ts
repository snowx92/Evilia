'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { targetsService } from '@/services/targets.service';
import { queryKeys } from '@/lib/query-keys';
import type {
  CreateTargetRequest,
  TargetsListParams,
  UpdateTargetRequest,
} from '@/types/admin/targets';

export function useTargetsQuery(params: TargetsListParams) {
  return useQuery({
    queryKey: queryKeys.targets.list(params),
    queryFn: () => targetsService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateTargetMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTargetRequest) => targetsService.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['targets', 'list'] }),
  });
}

export function useUpdateTargetMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateTargetRequest }) =>
      targetsService.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['targets', 'list'] }),
  });
}

export function useDeleteTargetMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => targetsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['targets', 'list'] }),
  });
}
