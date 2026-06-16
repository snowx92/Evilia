'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { expensesService } from '@/services/expenses.service';
import { queryKeys } from '@/lib/query-keys';
import type {
  CreateExpenseCategoryRequest,
  CreateExpenseRequest,
  ExpensesListParams,
  UpdateExpenseRequest,
} from '@/types/admin/expenses';

export function useExpenseCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.expenses.categories,
    queryFn: () => expensesService.listCategories(),
    staleTime: 5 * 60_000,
  });
}

export function useCreateExpenseCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateExpenseCategoryRequest) => expensesService.createCategory(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.expenses.categories }),
  });
}

export function useDeleteExpenseCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => expensesService.removeCategory(categoryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.expenses.categories });
      // Expenses list may include categoryId references that just disappeared.
      qc.invalidateQueries({ queryKey: ['expenses', 'list'] });
    },
  });
}

export function useExpensesQuery(params: ExpensesListParams) {
  return useQuery({
    queryKey: queryKeys.expenses.list(params),
    queryFn: () => expensesService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateExpenseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateExpenseRequest) => expensesService.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses', 'list'] }),
  });
}

export function useUpdateExpenseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateExpenseRequest }) =>
      expensesService.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses', 'list'] }),
  });
}

export function useDeleteExpenseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses', 'list'] }),
  });
}
