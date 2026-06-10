import type { PaginationParams } from '@/types/api';
import type { TimestampLike } from '@/lib/utils';

export type ExpenseCategory = {
  id: string;
  name: string;
  description: string;
};

export type CreateExpenseCategoryRequest = {
  name: string;
  description: string;
};

export type Expense = {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  createdBy?: string;
  date?: TimestampLike;
  notes?: string;
  attachments?: string[];
  createdAt?: TimestampLike;
  itemIndex?: number;
};

export type ExpensesListParams = PaginationParams & {
  categoryId?: string;
};

export type CreateExpenseRequest = {
  title: string;
  amount: number;
  categoryId: string;
  date: string;
  notes: string;
  attachments: string[];
};

export type UpdateExpenseRequest = {
  title?: string;
  amount?: number;
};
