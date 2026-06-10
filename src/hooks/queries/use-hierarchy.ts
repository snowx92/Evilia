'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hierarchyService } from '@/services/hierarchy.service';
import { queryKeys } from '@/lib/query-keys';
import type { ReassignParentRequest } from '@/types/admin/hierarchy';

export function useHierarchyTreeQuery(rootId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.hierarchy.tree(rootId),
    queryFn: () => hierarchyService.tree(rootId),
    enabled: enabled && Boolean(rootId),
  });
}

export function useReassignParentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, body }: { userId: string; body: ReassignParentRequest }) =>
      hierarchyService.reassignParent(userId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hierarchy'] }),
  });
}
