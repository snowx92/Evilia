'use client';

import { useQuery } from '@tanstack/react-query';
import { salesService } from '@/services/sales.service';
import { queryKeys } from '@/lib/query-keys';
import type { SalesListParams } from '@/types/admin/sales';

export function useSalesQuery(params: SalesListParams) {
  return useQuery({
    queryKey: queryKeys.sales.list(params),
    queryFn: () => salesService.list(params),
    placeholderData: (prev) => prev,
  });
}
