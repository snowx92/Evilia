'use client';

import { useQuery } from '@tanstack/react-query';
import { commissionsService } from '@/services/commissions.service';
import { queryKeys } from '@/lib/query-keys';
import type { CommissionsListParams } from '@/types/admin/commissions';

export function useCommissionsQuery(params: CommissionsListParams) {
  return useQuery({
    queryKey: queryKeys.commissions.list(params),
    queryFn: () => commissionsService.list(params),
    placeholderData: (prev) => prev,
  });
}
