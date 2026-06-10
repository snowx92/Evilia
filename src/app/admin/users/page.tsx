'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type Column } from '@/components/shared/data-table';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { StatusBadge } from '@/components/shared/status-badge';
import { RoleBadge } from '@/components/shared/role-badge';
import { UsersFilterBar } from '@/features/users/users-filter-bar';
import { CreateMemberDialog, CreateAdminDialog } from '@/features/users/create-user-dialog';
import { UserRowActions } from '@/features/users/user-row-actions';
import { useUsersQuery } from '@/hooks/queries/use-users';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatDate, formatPercent } from '@/lib/utils';
import { DEFAULT_PAGE_SIZE } from '@/constants/admin';
import type { User, UserRole, UserStatus } from '@/types/auth';

export default function UsersPage() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{ role?: UserRole; status?: UserStatus }>({});

  const params = { page, limit: DEFAULT_PAGE_SIZE, ...filters };
  const query = useUsersQuery(params);
  const data = query.data;

  const columns: Column<User>[] = [
    {
      key: 'displayName',
      header: t('users.fields.displayName'),
      cell: (u) => (
        <div className="flex flex-col">
          <span className="font-medium">{u.displayName}</span>
          <span className="text-xs text-muted-foreground">{u.email}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: t('common.role'),
      cell: (u) => <RoleBadge role={u.role} />,
    },
    {
      key: 'sellerCode',
      header: t('users.fields.sellerCode'),
      cell: (u) => u.sellerCode ?? '—',
    },
    {
      key: 'commissionPercentage',
      header: t('users.fields.commissionPercentage'),
      cell: (u) => formatPercent(u.commissionPercentage, locale),
    },
    {
      key: 'status',
      header: t('common.status'),
      cell: (u) => <StatusBadge status={u.status} />,
    },
    {
      key: 'createdAt',
      header: t('users.fields.createdAt'),
      cell: (u) => formatDate(u.createdAt, locale),
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'w-12',
      cell: (u) => <UserRowActions user={u} />,
      className: 'text-end',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title={t('users.title')}
        actions={
          <div className="flex items-center gap-2">
            <CreateAdminDialog />
            <CreateMemberDialog />
          </div>
        }
      />
      <UsersFilterBar
        role={filters.role}
        status={filters.status}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />
      <DataTable
        data={data?.items}
        columns={columns}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => query.refetch()}
        getRowKey={(u) => u.id}
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
