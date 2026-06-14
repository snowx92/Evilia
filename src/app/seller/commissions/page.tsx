'use client';

import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type Column } from '@/components/shared/data-table';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSellerCommissionsQuery } from '@/hooks/queries/use-seller';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';
import { downloadCsv, type CsvColumn } from '@/lib/csv-export';
import { DEFAULT_PAGE_SIZE } from '@/constants/admin';
import type { SellerCommission } from '@/types/seller';

export default function SellerCommissionsPage() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  useDocumentTitle(t('seller.nav.commissions'));
  const [page, setPage] = useState(1);
  const query = useSellerCommissionsQuery({ page, limit: DEFAULT_PAGE_SIZE });
  const data = query.data;
  const items = data?.items ?? [];

  const pageTotal = useMemo(
    () => items.reduce((sum, c) => sum + (c.amount ?? 0), 0),
    [items],
  );

  const exportRows = () => {
    const cols: CsvColumn<SellerCommission>[] = [
      { header: 'ID', value: (c) => c.id },
      { header: t('commissions.fields.percentage'), value: (c) => c.percentage },
      { header: t('seller.saleAmount'), value: (c) => c.saleAmount },
      { header: t('commissions.fields.amount'), value: (c) => c.amount },
    ];
    downloadCsv(`my-commissions-page-${page}`, items, cols);
  };

  const columns: Column<SellerCommission>[] = [
    {
      key: 'id',
      header: 'ID',
      cell: (c) => <span className="font-mono text-[11px] text-muted-foreground">{c.id}</span>,
    },
    {
      key: 'percentage',
      header: t('commissions.fields.percentage'),
      cell: (c) => formatPercent(c.percentage, locale),
    },
    {
      key: 'saleAmount',
      header: t('seller.saleAmount'),
      cell: (c) => (
        <span className="tabular-nums text-muted-foreground">
          {formatCurrency(c.saleAmount, locale)}
        </span>
      ),
    },
    {
      key: 'amount',
      header: t('commissions.fields.amount'),
      cell: (c) => (
        <span className="font-semibold tabular-nums text-success">
          {formatCurrency(c.amount, locale)}
        </span>
      ),
      className: 'text-end',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('seller.portal')}
        title={t('seller.nav.commissions')}
        description={
          data
            ? t('common.showing', {
                from: items.length ? (page - 1) * DEFAULT_PAGE_SIZE + 1 : 0,
                to: Math.min(page * DEFAULT_PAGE_SIZE, data.totalItems),
                total: formatNumber(data.totalItems, locale),
              })
            : undefined
        }
        actions={
          items.length ? (
            <Button variant="outline" size="sm" onClick={exportRows}>
              <Download className="h-4 w-4" />
              {t('common.exportCsv')}
            </Button>
          ) : null
        }
      />

      {items.length > 0 && (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-6 py-4">
            <div className="leading-tight">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {t('seller.sumOfPage')}
              </p>
              <p className="text-xl font-bold tabular-nums text-success">
                {formatCurrency(pageTotal, locale)}
              </p>
            </div>
            <div className="leading-tight">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {t('seller.totalsThisPage')}
              </p>
              <p className="text-xl font-bold tabular-nums">
                {formatNumber(items.length, locale)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <DataTable
        data={items}
        columns={columns}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => query.refetch()}
        getRowKey={(c) => c.id}
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
