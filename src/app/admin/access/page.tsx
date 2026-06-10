'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable, type Column } from '@/components/shared/data-table';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { RoleBadge } from '@/components/shared/role-badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { EditAdminPermissionsDialog } from '@/features/access/edit-admin-permissions-dialog';
import {
  useAdminsQuery,
  usePermissionCatalogQuery,
} from '@/hooks/queries/use-access';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { DEFAULT_PAGE_SIZE } from '@/constants/admin';
import type { AdminUser } from '@/types/admin/access';

function PermissionCatalogTable() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const query = usePermissionCatalogQuery();

  const columns: Column<{ key: string; label: string; labelAr: string; description: string; group: string }>[] = [
    { key: 'group', header: t('common.title'), cell: (p) => p.group },
    {
      key: 'label',
      header: t('common.name'),
      cell: (p) => (locale === 'ar' ? p.labelAr || p.label : p.label),
    },
    {
      key: 'key',
      header: '#',
      cell: (p) => <span className="font-mono text-xs">{p.key}</span>,
    },
    {
      key: 'description',
      header: t('common.description'),
      cell: (p) => <span className="text-xs text-muted-foreground">{p.description}</span>,
    },
  ];

  return (
    <DataTable
      data={query.data}
      columns={columns}
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={() => query.refetch()}
      getRowKey={(p) => p.key}
    />
  );
}

function AdminsList() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const query = useAdminsQuery({ page, limit: DEFAULT_PAGE_SIZE });
  const data = query.data;

  const columns: Column<AdminUser>[] = [
    {
      key: 'displayName',
      header: t('users.fields.displayName'),
      cell: (a) => (
        <div className="flex flex-col">
          <span className="font-medium">{a.displayName}</span>
          <span className="text-xs text-muted-foreground">{a.email}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: t('common.role'),
      cell: (a) => <RoleBadge role={a.role} />,
    },
    {
      key: 'status',
      header: t('common.status'),
      cell: (a) => <StatusBadge status={a.status} />,
    },
    {
      key: 'permCount',
      header: t('users.fields.permissions'),
      cell: (a) => (a.permissions?.length ?? 0).toString(),
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'w-48 text-end',
      className: 'text-end',
      cell: (a) => <EditAdminPermissionsDialog admin={a} />,
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        data={data?.items}
        columns={columns}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => query.refetch()}
        getRowKey={(a) => a.id}
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

export default function AccessPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader title={t('access.title')} />
      <Tabs defaultValue="admins">
        <TabsList>
          <TabsTrigger value="admins">{t('access.admins')}</TabsTrigger>
          <TabsTrigger value="catalog">{t('access.permissionCatalog')}</TabsTrigger>
        </TabsList>
        <TabsContent value="admins">
          <AdminsList />
        </TabsContent>
        <TabsContent value="catalog">
          <PermissionCatalogTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
