import { api, unwrap } from '@/lib/api/client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  CreateExpenseCategoryRequest,
  CreateExpenseRequest,
  Expense,
  ExpenseCategory,
  ExpensesListParams,
  UpdateExpenseRequest,
} from '@/types/admin/expenses';

export const expensesService = {
  listCategories: () =>
    unwrap(api.get<ApiResponse<ExpenseCategory[]>>('/v1/admin/expenses/categories')),

  createCategory: (body: CreateExpenseCategoryRequest) =>
    unwrap(api.post<ApiResponse<ExpenseCategory>>('/v1/admin/expenses/categories', body)),

  list: (params: ExpensesListParams = {}) =>
    unwrap(
      api.get<ApiResponse<PaginatedResponse<Expense>>>('/v1/admin/expenses', {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 20,
          ...(params.categoryId ? { categoryId: params.categoryId } : {}),
        },
      }),
    ),

  create: (body: CreateExpenseRequest) =>
    unwrap(api.post<ApiResponse<Expense>>('/v1/admin/expenses', body)),

  update: (expenseId: string, body: UpdateExpenseRequest) =>
    unwrap(api.put<ApiResponse<Expense>>(`/v1/admin/expenses/${expenseId}`, body)),

  remove: (expenseId: string) =>
    unwrap(api.delete<ApiResponse<null>>(`/v1/admin/expenses/${expenseId}`)),
};
