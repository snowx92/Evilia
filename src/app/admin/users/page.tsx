'use client';

import { useMemo, useState } from 'react';
import { Download, ExternalLink, Link as LinkIcon, Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type Column } from '@/components/shared/data-table';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { StatusBadge } from '@/components/shared/status-badge';
import { RoleBadge } from '@/components/shared/role-badge';
import { Avatar, AvatarFallback, AvatarImage, getInitials } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UsersFilterBar } from '@/features/users/users-filter-bar';
import { CreateSellerDialog, CreateAdminDialog } from '@/features/users/create-user-dialog';
import { UserRowActions } from '@/features/users/user-row-actions';
import { useUsersQuery } from '@/hooks/queries/use-users';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatDate, formatPercent } from '@/lib/utils';
import { downloadCsv, type CsvColumn } from '@/lib/csv-export';
import { DEFAULT_PAGE_SIZE } from '@/constants/admin';
import type { User, UserRole, UserStatus } from '@/types/auth';

export default function UsersPage() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  useDocumentTitle(t('users.title'));
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{ role?: UserRole; status?: UserStatus }>({});
  const [search, setSearch] = useState('');

  const params = { page, limit: DEFAULT_PAGE_SIZE, ...filters };
  const query = useUsersQuery(params);
  const data = query.data;

  // Client-side narrowing on the current page — fast, doesn't replace server filters.
  const filtered = useMemo(() => {
    const items = data?.items ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.sellerCode ?? '').toLowerCase().includes(q) ||
        (u.phone ?? '').toLowerCase().includes(q),
    );
  }, [data, search]);

  const exportRows = () => {
    const rows = filtered;
    const cols: CsvColumn<User>[] = [
      { header: 'ID', value: (u) => u.id },
      { header: t('users.fields.displayName'), value: (u) => u.displayName },
      { header: t('common.email'), value: (u) => u.email },
      { header: t('common.phone'), value: (u) => u.phone ?? '' },
      { header: t('users.fields.sellerCode'), value: (u) => u.sellerCode ?? '' },
      { header: t('common.role'), value: (u) => u.role },
      { header: t('common.status'), value: (u) => u.status },
      {
        header: t('users.fields.directCommissionPercentage'),
        value: (u) =>
          u.directCommissionPercentage ?? u.commissionPercentage ?? 0,
      },
      {
        header: t('users.fields.networkCommissionPercentage'),
        value: (u) => u.networkCommissionPercentage ?? 0,
      },
      { header: t('users.fields.parentId'), value: (u) => u.parentId ?? '' },
      { header: t('users.fields.createdAt'), value: (u) => String(u.createdAt) },
    ];
    downloadCsv(`users-page-${page}`, rows, cols);
  };

  const columns: Column<User>[] = [
    {
      key: 'displayName',
      header: t('users.fields.displayName'),
      cell: (u) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            {u.profileImageUrl && (
              <AvatarImage src={u.profileImageUrl} alt={u.displayName} />
            )}
            <AvatarFallback className="text-xs">{getInitials(u.displayName)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{u.displayName}</span>
            <span className="text-xs text-muted-foreground">{u.email}</span>
          </div>
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
      cell: (u) => {
        const direct = u.directCommissionPercentage ?? u.commissionPercentage ?? 0;
        const network = u.networkCommissionPercentage ?? 0;
        return (
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] text-muted-foreground">
              {t('users.fields.directCommissionShort')}:{' '}
              <span className="font-medium text-foreground">
                {formatPercent(direct, locale)}
              </span>
            </span>
            <span className="text-[11px] text-muted-foreground">
              {t('users.fields.networkCommissionShort')}:{' '}
              <span className="font-medium text-foreground">
                {formatPercent(network, locale)}
              </span>
            </span>
          </div>
        );
      },
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
      key: 'links',
      header: t('users.fields.affiliateLinks'),
      cell: (u) => (
        <div className="flex flex-col gap-1.5">
          {u.socialMediaLink && (
            <a
              href={u.socialMediaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 truncate text-xs text-primary hover:underline max-w-[160px]"
              title={u.socialMediaLink}
            >
              <LinkIcon className="h-3 w-3 shrink-0" />
              <span className="truncate">{u.socialMediaLink.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
          {u.affiliateLinks && u.affiliateLinks.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              {u.affiliateLinks.map((link, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 truncate text-xs text-muted-foreground hover:text-primary hover:underline max-w-[160px]"
                  title={link}
                >
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  <span className="truncate">{link.replace(/^https?:\/\//, '')}</span>
                </a>
              ))}
            </div>
          ) : !u.socialMediaLink ? (
            <span className="text-xs text-muted-foreground/50">—</span>
          ) : null}
        </div>
      ),
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
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportRows}
              disabled={!filtered.length}
              aria-label={t('common.exportCsv')}
            >
              <Download className="h-4 w-4" />
              {t('common.exportCsv')}
            </Button>
            <CreateAdminDialog />
            <CreateSellerDialog />
          </div>
        }
      />

      {/* Filters + search */}
      <Card>
        <CardContent className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('common.search')}
              className="ps-10"
              aria-label={t('common.search')}
            />
          </div>
          <UsersFilterBar
            role={filters.role}
            status={filters.status}
            onChange={(next) => {
              setFilters(next);
              setPage(1);
            }}
          />
        </CardContent>
      </Card>

      <DataTable
        data={filtered}
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
          pageSize={DEFAULT_PAGE_SIZE}
          onChange={setPage}
          disabled={query.isFetching}
        />
      )}
    </div>
  );
}
