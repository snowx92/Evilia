'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type Column } from '@/components/shared/data-table';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SalePicker } from '@/components/shared/sale-picker';
import { useCommissionsBySaleQuery, useCommissionsQuery } from '@/hooks/queries/use-commissions';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency, formatDate, formatPercent } from '@/lib/utils';
import { DEFAULT_PAGE_SIZE } from '@/constants/admin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Commission } from '@/types/admin/commissions';
import type { Sale } from '@/types/admin/sales';

function CommissionsTable({
  data,
  isLoading,
  isError,
  onRetry,
}: {
  data: Commission[] | undefined;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);

  const columns: Column<Commission>[] = [
    {
      key: 'recipientId',
      header: t('commissions.fields.recipientId'),
      cell: (c) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs">{c.recipientId}</span>
          <span className="text-xs text-muted-foreground">{c.recipientRole}</span>
        </div>
      ),
    },
    {
      key: 'saleId',
      header: t('commissions.fields.saleId'),
      cell: (c) => <span className="font-mono text-xs">{c.saleId}</span>,
    },
    {
      key: 'percentage',
      header: t('commissions.fields.percentage'),
      cell: (c) => formatPercent(c.percentage, locale),
    },
    {
      key: 'saleAmount',
      header: t('commissions.fields.saleAmount'),
      cell: (c) => formatCurrency(c.saleAmount, locale),
    },
    {
      key: 'amount',
      header: t('commissions.fields.amount'),
      cell: (c) => (
        <span className="font-medium text-foreground">{formatCurrency(c.amount, locale)}</span>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      cell: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: 'createdAt',
      header: t('common.date'),
      cell: (c) => formatDate(c.createdAt, locale),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      onRetry={onRetry}
      getRowKey={(c) => c.id}
    />
  );
}

function AllCommissions() {
  const [page, setPage] = useState(1);
  const query = useCommissionsQuery({ page, limit: DEFAULT_PAGE_SIZE });
  const data = query.data;
  return (
    <div className="space-y-4">
      <CommissionsTable
        data={data?.items}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => query.refetch()}
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

function CommissionsBySale() {
  const { t } = useTranslation();
  const [sale, setSale] = useState<Sale | null>(null);
  const query = useCommissionsBySaleQuery(sale?.id ?? '', Boolean(sale));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('commissions.bySale')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="sr-only">{t('commissions.fields.saleId')}</Label>
          <SalePicker value={sale} onChange={setSale} placeholder={t('commissions.fields.saleId')} />
        </CardContent>
      </Card>
      {sale && (
        <CommissionsTable
          data={query.data}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => query.refetch()}
        />
      )}
    </div>
  );
}

export default function CommissionsPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('nav.commissions')}
        title={t('commissions.title')}
        description={t('analytics.daily')}
      />
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">{t('commissions.title')}</TabsTrigger>
          <TabsTrigger value="by-sale">{t('commissions.bySale')}</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <AllCommissions />
        </TabsContent>
        <TabsContent value="by-sale">
          <CommissionsBySale />
        </TabsContent>
      </Tabs>
    </div>
  );
}
