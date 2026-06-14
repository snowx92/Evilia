'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ScrollText, Users } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { MetricCard } from '@/components/shared/metric-card';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SaleRow } from '@/features/sales/sale-row';
import { useSalesQuery } from '@/hooks/queries/use-sales';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { parseSaleMetadata, saleCommissionTotal } from '@/lib/sale-metadata';
import { DEFAULT_PAGE_SIZE, SALE_STATUSES } from '@/constants/admin';
import { stagger } from '@/lib/motion';
import type { SaleStatus } from '@/types/admin/sales';

const ALL = '__all__';

export default function SalesPage() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<SaleStatus | undefined>(undefined);

  const params = { page, limit: DEFAULT_PAGE_SIZE, ...(status ? { status } : {}) };
  const query = useSalesQuery(params);
  const data = query.data;
  const items = data?.items ?? [];

  const kpis = useMemo(() => {
    if (items.length === 0) {
      return {
        gross: 0,
        commissions: 0,
        sellers: 0,
        currency: 'EGP',
      };
    }
    const gross = items.reduce((acc, s) => acc + (s.amount ?? 0), 0);
    const commissions = items.reduce((acc, s) => {
      const meta = parseSaleMetadata(s.metadata);
      return acc + saleCommissionTotal(s.commissions ?? [], meta.payment?.affiliateCommission);
    }, 0);
    const sellers = new Set(items.map((s) => s.sellerCode).filter(Boolean)).size;
    return {
      gross,
      commissions,
      sellers,
      currency: items[0]?.currency ?? 'EGP',
    };
  }, [items]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t('nav.sales')}
        title={t('sales.title')}
        description={t('analytics.daily')}
        actions={
          <Select
            value={status ?? ALL}
            onValueChange={(v) => {
              setStatus(v === ALL ? undefined : (v as SaleStatus));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder={t('sales.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('common.all')}</SelectItem>
              {SALE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`status.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <MetricCard
          label={t('dashboard.totalSales')}
          value={formatCurrency(kpis.gross, locale, kpis.currency)}
          sublabel={t('seller.totalsThisPage')}
          icon={TrendingUp}
          isLoading={query.isLoading}
          accent="indigo"
        />
        <MetricCard
          label={t('commissions.title')}
          value={formatCurrency(kpis.commissions, locale, kpis.currency)}
          sublabel={t('seller.totalsThisPage')}
          icon={ScrollText}
          isLoading={query.isLoading}
          accent="emerald"
        />
        <MetricCard
          label={t('sales.sellersOnPage')}
          value={formatNumber(kpis.sellers, locale)}
          sublabel={t('seller.totalsThisPage')}
          icon={Users}
          isLoading={query.isLoading}
          accent="rose"
        />
      </motion.div>

      {/* Premium sales table */}
      {query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>{t('sales.trafficSource')}</TableHead>
                <TableHead>{t('sales.seller')}</TableHead>
                <TableHead>{t('sales.order')}</TableHead>
                <TableHead>{t('common.amount')}</TableHead>
                <TableHead>{t('commissions.title')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-end">{t('common.date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={`sk-${i}`} className="border-b border-border/60">
                      {Array.from({ length: 8 }).map((__, j) => (
                        <td key={j} className="px-5 py-4">
                          <Skeleton className="h-4 w-full max-w-[160px]" />
                        </td>
                      ))}
                    </tr>
                  ))
                : items.map((s) => <SaleRow key={s.id} sale={s} />)}
            </TableBody>
          </Table>
          {!query.isLoading && items.length === 0 && (
            <div className="p-6">
              <EmptyState title={t('common.noResults')} />
            </div>
          )}
        </div>
      )}

      {data && data.totalPages > 1 && (
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
