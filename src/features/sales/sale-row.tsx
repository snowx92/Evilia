'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowUpRight, Loader2, Wallet, AlertTriangle } from 'lucide-react';
import { TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/sonner';
import { StatusBadge } from '@/components/shared/status-badge';
import { useUpdateSaleStatusMutation } from '@/hooks/queries/use-sales';
import { ApiError } from '@/types/api';
import { SALE_STATUSES } from '@/constants/admin';
import type { SaleStatus } from '@/types/admin/sales';
import { CopyButton } from '@/components/shared/copy-button';
import { CommissionStrip } from './commission-strip';
import { CommissionBreakdown } from './commission-breakdown';
import { SaleOrderDetails } from './sale-order-details';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import {
  cn,
  formatCurrency,
  formatDateTime,
} from '@/lib/utils';
import {
  parseSaleMetadata,
  saleCommissionTotal,
  saleProductSummary,
} from '@/lib/sale-metadata';
import type { Sale } from '@/types/admin/sales';

export function SaleRow({ sale }: { sale: Sale }) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [open, setOpen] = useState(false);

  const meta = parseSaleMetadata(sale.metadata);
  const totalCommissions = saleCommissionTotal(
    sale.commissions,
    meta.payment?.affiliateCommission,
  );
  const commissionRatio = sale.amount > 0 ? (totalCommissions / sale.amount) * 100 : 0;
  const net = sale.amount - totalCommissions;
  const productSummary = saleProductSummary(meta);
  const orderStatus = meta.orderStatus;
  const trafficSource = meta.utmData?.source;
  const isUnmatchedSeller = Boolean(meta.unmatchedSellerCode);

  return (
    <>
      <motion.tr
        layout
        className={cn(
          'group cursor-pointer border-b border-border/60 transition-colors hover:bg-primary-soft/30',
          open && 'bg-primary-soft/20',
        )}
        onClick={() => setOpen((v) => !v)}
      >
        <TableCell className="w-10">
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground group-hover:bg-muted"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </TableCell>

        {/* Traffic source — order id moved to the expanded panel below */}
        <TableCell>
          {trafficSource ? (
            <Badge variant="outline" className="w-fit text-[10px] uppercase tracking-wider">
              {trafficSource}
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">{t('common.none')}</span>
          )}
        </TableCell>

        {/* Seller */}
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{getInitials(sale.sellerCode)}</AvatarFallback>
            </Avatar>
            <span className="truncate text-sm font-medium">{sale.sellerCode}</span>
          </div>
        </TableCell>

        {/* Product summary (customer PII hidden) */}
        <TableCell className="max-w-[240px]">
          {productSummary ? (
            <span className="block truncate text-sm">{productSummary}</span>
          ) : (
            <span className="text-sm text-muted-foreground">{t('common.none')}</span>
          )}
        </TableCell>

        {/* Amount */}
        <TableCell>
          <span className="text-sm font-semibold tabular-nums">
            {formatCurrency(sale.amount, locale, sale.currency)}
          </span>
        </TableCell>

        {/* Commissions */}
        <TableCell className="min-w-[180px]">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium tabular-nums">
                {formatCurrency(totalCommissions, locale, sale.currency)}
              </span>
              {isUnmatchedSeller ? (
                <span
                  className="inline-flex items-center gap-0.5 text-warning-foreground"
                  title={t('sales.unmatchedSeller')}
                >
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                  <span className="text-[10px] font-medium uppercase tracking-wide">
                    {t('sales.unmatched')}
                  </span>
                </span>
              ) : null}
              {totalCommissions > 0 && !isUnmatchedSeller ? (
                <span className="text-[11px] text-muted-foreground">
                  {commissionRatio.toFixed(1)}%
                </span>
              ) : null}
            </div>
            {sale.commissions.length > 0 ? (
              <CommissionStrip commissions={sale.commissions} saleAmount={sale.amount} />
            ) : null}
          </div>
        </TableCell>

        {/* Status — clickable dropdown to change */}
        <TableCell>
          <div
            className="flex flex-col items-start gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <SaleStatusChanger sale={sale} />
            {orderStatus ? (
              <Badge variant="muted" className="w-fit text-[10px]">
                {orderStatus}
              </Badge>
            ) : null}
          </div>
        </TableCell>

        {/* Date */}
        <TableCell className="text-end">
          <span className="text-sm">{formatDateTime(sale.importedAt, locale)}</span>
        </TableCell>
      </motion.tr>

      <AnimatePresence initial={false}>
        {open && (
          <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-muted/30"
          >
            <TableCell colSpan={8} className="p-0">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="grid gap-5 px-6 py-5 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <SaleOrderDetails meta={meta} currency={sale.currency} />
                  </div>

                  <div className="space-y-5">
                    {sale.commissions.length > 0 ? (
                      <CommissionBreakdown sale={sale} />
                    ) : null}

                    <div className="space-y-3 rounded-xl border border-border/70 bg-surface p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {t('sales.financialSummary')}
                      </p>
                      <dl className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <dt className="text-muted-foreground">{t('common.amount')}</dt>
                          <dd className="font-medium tabular-nums">
                            {formatCurrency(sale.amount, locale, sale.currency)}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between">
                          <dt className="text-muted-foreground">{t('commissions.title')}</dt>
                          <dd className="font-medium tabular-nums text-destructive">
                            − {formatCurrency(totalCommissions, locale, sale.currency)}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between border-t border-border/60 pt-2">
                          <dt className="flex items-center gap-1.5 font-medium">
                            <Wallet className="h-3.5 w-3.5 text-primary" />
                            {t('wallets.available')}
                          </dt>
                          <dd className="font-semibold tabular-nums text-success">
                            {formatCurrency(net, locale, sale.currency)}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="space-y-3 rounded-xl border border-border/70 bg-surface p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {t('sales.orderMeta')}
                      </p>
                      <dl className="space-y-2 text-sm">
                        {meta.orderId ? (
                          <div className="flex items-center justify-between gap-3">
                            <dt className="text-muted-foreground">{t('sales.orderId')}</dt>
                            <dd className="flex items-center gap-1 font-mono text-xs">
                              {meta.orderId}
                              <CopyButton value={meta.orderId} />
                            </dd>
                          </div>
                        ) : null}
                        {meta.storeId ? (
                          <div className="flex items-center justify-between gap-3">
                            <dt className="text-muted-foreground">{t('sales.storeId')}</dt>
                            <dd className="flex items-center gap-1 font-mono text-xs">
                              <span className="max-w-[150px] truncate">{meta.storeId}</span>
                              <CopyButton value={meta.storeId} />
                            </dd>
                          </div>
                        ) : null}
                        {meta.pickupMethod ? (
                          <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">{t('sales.pickupMethod')}</dt>
                            <dd>{meta.pickupMethod}</dd>
                          </div>
                        ) : null}
                        {meta.country ? (
                          <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">{t('sales.country')}</dt>
                            <dd>{meta.country}</dd>
                          </div>
                        ) : null}
                        {meta.trigger ? (
                          <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">{t('sales.trigger')}</dt>
                            <dd className="font-mono text-xs">{meta.trigger}</dd>
                          </div>
                        ) : null}
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-muted-foreground">{t('sales.externalId')}</dt>
                          <dd className="flex items-center gap-1 font-mono text-xs">
                            <span className="max-w-[150px] truncate">{sale.externalId}</span>
                            <CopyButton value={sale.externalId} />
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-muted-foreground">{t('sales.internalId')}</dt>
                          <dd className="flex items-center gap-1 font-mono text-xs">
                            <span className="max-w-[150px] truncate">{sale.id}</span>
                            <CopyButton value={sale.id} />
                          </dd>
                        </div>
                        <div className="flex items-center justify-between">
                          <dt className="text-muted-foreground">{t('sales.processedAt')}</dt>
                          <dd>{formatDateTime(sale.processedAt, locale)}</dd>
                        </div>
                      </dl>
                      <a
                        href={`/admin/commissions?saleId=${encodeURIComponent(sale.id)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        {t('commissions.bySale')}
                        <ArrowUpRight className="h-3 w-3 rtl:-scale-x-100" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TableCell>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Status changer ─────────────────────────────────────────────────────────

function SaleStatusChanger({ sale }: { sale: Sale }) {
  const { t } = useTranslation();
  const update = useUpdateSaleStatusMutation();

  const onPick = async (next: SaleStatus) => {
    if (next === sale.status) return;
    try {
      await update.mutateAsync({ saleId: sale.id, status: next });
      toast.success(t('common.save'));
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto gap-1 p-0.5 hover:bg-transparent"
          disabled={update.isPending}
          aria-label={t('sales.changeStatus')}
          title={t('sales.changeStatus')}
        >
          <StatusBadge status={sale.status} />
          {update.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {t('sales.changeStatus')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SALE_STATUSES.map((s) => (
          <DropdownMenuItem
            key={s}
            onSelect={() => onPick(s)}
            className={cn('gap-2 text-sm', s === sale.status && 'bg-primary-soft/40')}
          >
            <StatusBadge status={s} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
