'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { salesService } from '@/services/sales.service';
import { queryKeys } from '@/lib/query-keys';
import type { Sale, SaleStatus, SalesListParams } from '@/types/admin/sales';

export function useSalesQuery(params: SalesListParams) {
  return useQuery({
    queryKey: queryKeys.sales.list(params),
    queryFn: () => salesService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useUpdateSaleStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ saleId, status }: { saleId: string; status: SaleStatus }) =>
      salesService.updateStatus(saleId, status),
    onMutate: ({ saleId, status }) => {
      // Optimistic: patch the status into every cached sales list page.
      qc.setQueriesData<{ items?: Sale[] }>({ queryKey: ['sales', 'list'] }, (data) => {
        if (!data?.items) return data;
        return {
          ...data,
          items: data.items.map((s) => (s.id === saleId ? { ...s, status } : s)),
        };
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['sales', 'list'] });
    },
  });
}
