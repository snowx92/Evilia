'use client';

import { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type Column } from '@/components/shared/data-table';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  CreateCategoryDialog,
  CreateExpenseDialog,
  EditExpenseDialog,
} from '@/features/expenses/expense-dialogs';
import {
  useDeleteExpenseCategoryMutation,
  useDeleteExpenseMutation,
  useExpenseCategoriesQuery,
  useExpensesQuery,
} from '@/hooks/queries/use-expenses';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DEFAULT_PAGE_SIZE } from '@/constants/admin';
import { toast } from '@/components/ui/sonner';
import { UserName } from '@/components/shared/user-name';
import { ApiError } from '@/types/api';
import type { Expense, ExpenseCategory } from '@/types/admin/expenses';

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

function DeleteCategoryButton({ id }: { id: string }) {
  const { t } = useTranslation();
  const remove = useDeleteExpenseCategoryMutation();
  const onClick = async () => {
    if (!window.confirm(t('expenses.confirmDeleteCategory'))) return;
    try {
      await remove.mutateAsync(id);
      toast.success(t('common.save'));
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={remove.isPending}
      className="text-destructive hover:bg-destructive/10"
      aria-label={t('common.delete')}
    >
      {remove.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}

/**
 * Category filter rendered as a horizontal pill row so non-technical operators
 * can see every category at a glance. "All" is the leftmost pill.
 */
function CategoryChips({
  categories,
  selected,
  onSelect,
}: {
  categories: ExpenseCategory[] | undefined;
  selected: string | undefined;
  onSelect: (id: string | undefined) => void;
}) {
  const { t } = useTranslation();
  if (!categories?.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={() => onSelect(undefined)}
        className={cn(
          'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
          !selected
            ? 'border-primary bg-primary text-primary-foreground shadow-sm'
            : 'border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
        )}
      >
        {t('common.all')}
      </button>
      {categories.map((c) => {
        const active = selected === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              active
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
          >
            {c.name}
          </button>
        );
      })}
    </div>
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
      header: t('expenses.fields.createdBy'),
      cell: (e) =>
        e.createdBy ? <UserName userId={e.createdBy} avatarSize={24} /> : '—',
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
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {t('expenses.filterByCategory')}
        </p>
        <CategoryChips
          categories={categories.data}
          selected={categoryId}
          onSelect={(id) => {
            setCategoryId(id);
            setPage(1);
          }}
        />
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
    {
      key: 'actions',
      header: '',
      headClassName: 'w-12 text-end',
      className: 'text-end',
      cell: (c) => <DeleteCategoryButton id={c.id} />,
    },
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
