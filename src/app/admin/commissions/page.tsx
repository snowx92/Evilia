'use client';

import { useMemo, useState } from 'react';
import { Filter, X } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type Column } from '@/components/shared/data-table';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { StatusBadge } from '@/components/shared/status-badge';
import { UserName } from '@/components/shared/user-name';
import { UserPicker } from '@/components/shared/user-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useCommissionsQuery } from '@/hooks/queries/use-commissions';
import { useSaleQuery } from '@/hooks/queries/use-sales';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency, formatDate, formatPercent } from '@/lib/utils';
import { parseSaleMetadata, prettyOrderRef, saleProductSummary } from '@/lib/sale-metadata';
import { DEFAULT_PAGE_SIZE } from '@/constants/admin';
import type { Commission, CommissionStatus } from '@/types/admin/commissions';
import type { User } from '@/types/auth';

const ALL = '__all__';

/**
 * Per-row sale info — shows a clean order ref (#12345 via prettyOrderRef),
 * the top product, and the sale date with the closing seller code.
 * Never exposes the raw saleId or the ugly composite externalId.
 * Loads via `useSaleQuery` which React Query dedupes across rows.
 */
function SaleSummary({ saleId }: { saleId: string }) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const sale = useSaleQuery(saleId);

  if (sale.isLoading) {
    return (
      <div className="space-y-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-28" />
      </div>
    );
  }

  if (!sale.data) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const s = sale.data;
  const meta = parseSaleMetadata(s.metadata);
  const ref = prettyOrderRef(s.externalId, meta);
  const productSummary = saleProductSummary(meta);

  return (
    <div className="flex min-w-0 flex-col leading-tight">
      <span className="truncate text-sm font-medium">{ref}</span>
      {productSummary && (
        <span className="truncate text-[12px] text-foreground/80">{productSummary}</span>
      )}
      <span className="truncate text-[11px] text-muted-foreground">
        {formatDate(s.importedAt, locale)}
        {s.sellerCode ? ` · ${t('commissions.soldBy')} ${s.sellerCode}` : ''}
      </span>
    </div>
  );
}

export default function CommissionsPage() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [page, setPage] = useState(1);
  const [seller, setSeller] = useState<User | null>(null);
  const [status, setStatus] = useState<CommissionStatus | undefined>(undefined);

  // The API only paginates today — no recipientId/status server filters yet.
  // We pull a larger page when a filter is active so the client-side filter
  // produces useful results without hitting every page individually.
  const hasFilter = Boolean(seller || status);
  const limit = hasFilter ? 100 : DEFAULT_PAGE_SIZE;
  const query = useCommissionsQuery({ page, limit });
  const data = query.data;

  const filtered = useMemo(() => {
    const items = data?.items ?? [];
    return items.filter((c) => {
      if (seller && c.recipientId !== seller.id) return false;
      if (status && c.status !== status) return false;
      return true;
    });
  }, [data?.items, seller, status]);

  const clearFilters = () => {
    setSeller(null);
    setStatus(undefined);
    setPage(1);
  };

  const columns: Column<Commission>[] = [
    {
      key: 'recipient',
      header: t('commissions.fields.recipientId'),
      cell: (c) => (
        <UserName
          userId={c.recipientId}
          link
          showRole
          avatarSize={28}
          nameClassName="text-sm"
        />
      ),
    },
    {
      key: 'sale',
      header: t('sales.title'),
      cell: (c) => <SaleSummary saleId={c.saleId} />,
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
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('nav.commissions')}
        title={t('commissions.title')}
        description={t('analytics.daily')}
      />

      {/* Filter bar */}
      <Card>
        <CardContent className="flex flex-col gap-3 py-4 lg:flex-row lg:items-end">
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t('commissions.filters.seller')}
            </Label>
            <UserPicker
              value={seller}
              onChange={(u) => {
                setSeller(u);
                setPage(1);
              }}
              placeholder={t('commissions.filters.sellerPlaceholder')}
              role="seller"
            />
          </div>
          <div className="w-full space-y-1.5 lg:w-56">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t('common.status')}
            </Label>
            <Select
              value={status ?? ALL}
              onValueChange={(v) => {
                setStatus(v === ALL ? undefined : (v as CommissionStatus));
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('common.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t('common.all')}</SelectItem>
                <SelectItem value="pending">{t('status.pending')}</SelectItem>
                <SelectItem value="credited">{t('status.credited')}</SelectItem>
                <SelectItem value="paid">{t('status.paid')}</SelectItem>
                <SelectItem value="cancelled">{t('status.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {hasFilter && (
            <Button variant="ghost" onClick={clearFilters} className="gap-1.5">
              <X className="h-4 w-4" />
              {t('common.clearFilters')}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Active-filter banner — only when client-side filtered */}
      {hasFilter && data && filtered.length < data.items.length && (
        <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Filter className="h-3 w-3" />
          {t('commissions.filters.clientSideNote', {
            shown: String(filtered.length),
            loaded: String(data.items.length),
          })}
        </p>
      )}

      <DataTable
        data={filtered}
        columns={columns}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => query.refetch()}
        getRowKey={(c) => c.id}
      />

      {data && !hasFilter && (
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
