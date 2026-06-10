'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type Column } from '@/components/shared/data-table';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreateCategoryDialog,
  CreateExpenseDialog,
  EditExpenseDialog,
} from '@/features/expenses/expense-dialogs';
import {
  useDeleteExpenseMutation,
  useExpenseCategoriesQuery,
  useExpensesQuery,
} from '@/hooks/queries/use-expenses';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DEFAULT_PAGE_SIZE } from '@/constants/admin';
import { toast } from '@/components/ui/sonner';
import { ApiError } from '@/types/api';
import type { Expense, ExpenseCategory } from '@/types/admin/expenses';

const ALL = '__all__';

function DeleteButton({ id }: { id: string }) {
  const { t } = useTranslation();
  const remove = useDeleteExpenseMutation();
  const onClick = async () => {
    if (!window.confirm(t('expenses.confirmDelete'))) return;
    try {
      await remove.mutateAsync(id);
      toast.success(t('common.save'));
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  };
  return (
    <Button variant="ghost" size="icon" onClick={onClick} className="text-destructive">
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

function ExpensesList() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const categories = useExpenseCategoriesQuery();
  const params = { page, limit: DEFAULT_PAGE_SIZE, ...(categoryId ? { categoryId } : {}) };
  const query = useExpensesQuery(params);
  const data = query.data;

  const categoryName = (id: string) =>
    categories.data?.find((c) => c.id === id)?.name ?? id;

  const columns: Column<Expense>[] = [
    {
      key: 'title',
      header: t('expenses.fields.title'),
      cell: (e) => (
        <div className="flex flex-col leading-tight">
          <span className="font-medium">{e.title}</span>
          {e.notes && <span className="truncate text-xs text-muted-foreground">{e.notes}</span>}
        </div>
      ),
    },
    {
      key: 'category',
      header: t('expenses.fields.category'),
      cell: (e) => categoryName(e.categoryId),
    },
    {
      key: 'amount',
      header: t('expenses.fields.amount'),
      cell: (e) => (
        <span className="font-medium tabular-nums">{formatCurrency(e.amount, locale)}</span>
      ),
    },
    {
      key: 'createdBy',
      header: t('common.role'),
      cell: (e) =>
        e.createdBy ? (
          <span className="font-mono text-[11px] text-muted-foreground">{e.createdBy}</span>
        ) : (
          '—'
        ),
    },
    {
      key: 'date',
      header: t('expenses.fields.date'),
      cell: (e) => (e.date ? formatDate(e.date, locale) : '—'),
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'w-24 text-end',
      className: 'text-end',
      cell: (e) => (
        <div className="flex items-center justify-end gap-1">
          <EditExpenseDialog expense={e} />
          <DeleteButton id={e.id} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={categoryId ?? ALL}
          onValueChange={(v) => {
            setCategoryId(v === ALL ? undefined : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-60">
            <SelectValue placeholder={t('expenses.filterByCategory')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t('common.all')}</SelectItem>
            {categories.data?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable
        data={data?.items}
        columns={columns}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => query.refetch()}
        getRowKey={(e) => e.id}
      />
      {data && (
        <PaginationBar
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          totalItems={data.totalItems}
          onChange={setPage}
          disabled={query.isFetching}
        />
      )}
    </div>
  );
}

function CategoriesList() {
  const { t } = useTranslation();
  const categories = useExpenseCategoriesQuery();

  const columns: Column<ExpenseCategory>[] = [
    { key: 'name', header: t('common.name'), cell: (c) => c.name },
    { key: 'description', header: t('common.description'), cell: (c) => c.description },
    { key: 'id', header: '#', cell: (c) => <span className="font-mono text-xs">{c.id}</span> },
  ];

  return (
    <DataTable
      data={categories.data}
      columns={columns}
      isLoading={categories.isLoading}
      isError={categories.isError}
      onRetry={() => categories.refetch()}
      getRowKey={(c) => c.id}
    />
  );
}

export default function ExpensesPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title={t('expenses.title')}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <CreateCategoryDialog />
            <CreateExpenseDialog />
          </div>
        }
      />
      <Tabs defaultValue="expenses">
        <TabsList>
          <TabsTrigger value="expenses">{t('expenses.title')}</TabsTrigger>
          <TabsTrigger value="categories">{t('expenses.categories')}</TabsTrigger>
        </TabsList>
        <TabsContent value="expenses">
          <ExpensesList />
        </TabsContent>
        <TabsContent value="categories">
          <CategoriesList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
