'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Loader2, Wallet, AlertTriangle, CreditCard } from 'lucide-react';
import { TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage, getInitials } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserQuery } from '@/hooks/queries/use-users';
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
import { useSaleQuery, useUpdateSaleStatusMutation } from '@/hooks/queries/use-sales';
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
  prettyOrderRef,
  saleCommissionTotal,
  saleProductSummary,
} from '@/lib/sale-metadata';
import type { Sale } from '@/types/admin/sales';

export function SaleRow({ sale, knownSellerId }: { sale: Sale; knownSellerId?: string }) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [open, setOpen] = useState(false);

  // Fetch the seller once at the top so both the cell and the commission
  // estimate can reuse it without re-fetching.
  // `knownSellerId` is provided when rendering inside a seller's profile page —
  // the lean list API sometimes omits sellerId even for attributed orders.
  const seller = useUserQuery(sale.sellerId ?? knownSellerId ?? '');
  const sellerUser = seller.data;

  // The list endpoint returns lean rows — full product / customer / payment
  // metadata only ships through the single-sale endpoint, so we lazily fetch
  // it when the operator opens the panel. The hook stays disabled until then.
  const detail = useSaleQuery(open ? sale.id : '');
  const richSale = detail.data ?? sale;

  const meta = parseSaleMetadata(richSale.metadata);
  const orderRef = prettyOrderRef(sale.externalId, meta);

  // The API stopped sending commissions inline until the order is delivered.
  // When the list is empty we compute the *expected* commission from the
  // seller's configured direct rate so the row doesn't show a misleading 0.
  const actualCommissions = saleCommissionTotal(
    sale.commissions,
    meta.payment?.affiliateCommission,
  );
  const directRate =
    sellerUser?.directCommissionPercentage ?? sellerUser?.commissionPercentage ?? 0;
  const expectedCommission = (sale.amount * directRate) / 100;
  const isExpectedCommission =
    actualCommissions === 0 && directRate > 0 && sale.status !== 'delivered';
  const totalCommissions = isExpectedCommission ? expectedCommission : actualCommissions;

  const commissionRatio = sale.amount > 0 ? (totalCommissions / sale.amount) * 100 : 0;
  const net = sale.amount - totalCommissions;
  const productSummary = saleProductSummary(meta);
  const orderStatus = meta.orderStatus;
  const trafficSource = meta.utmData?.source;
  // `unmatchedSellerCode` is a server flag frozen at ingest time. If the seller
  // was registered AFTER the sale was imported, the flag stays stale even
  // though the code now resolves to a real user. So we trust a live user
  // lookup as the source of truth: if `sellerUser` resolves, we treat the
  // sale as matched, regardless of what the metadata says.
  const sellerLookupResolved = Boolean(sellerUser);
  const isUnmatchedSeller =
    Boolean(meta.unmatchedSellerCode) && !sellerLookupResolved && !seller.isLoading;

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

        {/* Seller — photo + display name from the user record */}
        <TableCell>
          <SellerCell
            sellerCode={sale.sellerCode}
            user={sellerUser}
            isLoading={seller.isLoading}
            isUnmatched={isUnmatchedSeller}
          />
        </TableCell>

        {/* Product summary (customer PII hidden). Falls back to the order
            ref + paymentType chip when the API didn't send any metadata. */}
        <TableCell className="max-w-[240px]">
          {productSummary ? (
            <span className="block truncate text-sm">{productSummary}</span>
          ) : (
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs text-muted-foreground">{orderRef}</span>
              {sale.paymentType ? (
                <Badge variant="outline" className="w-fit gap-1 text-[10px] uppercase">
                  <CreditCard className="h-3 w-3" />
                  {sale.paymentType}
                </Badge>
              ) : null}
            </div>
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
              <span
                className={cn(
                  'text-sm font-medium tabular-nums',
                  isExpectedCommission && 'text-amber-600',
                )}
              >
                {formatCurrency(totalCommissions, locale, sale.currency)}
              </span>
              {isExpectedCommission ? (
                <span
                  className="text-[10px] font-medium uppercase tracking-wide text-amber-600"
                  title={t('sales.expectedCommission')}
                >
                  {t('sales.expectedCommission')}
                </span>
              ) : null}
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
                    {detail.isLoading && !detail.data ? (
                      <div className="space-y-3">
                        <Skeleton className="h-32 w-full rounded-xl" />
                        <Skeleton className="h-20 w-full rounded-xl" />
                        <Skeleton className="h-28 w-full rounded-xl" />
                      </div>
                    ) : (
                      <SaleOrderDetails meta={meta} currency={sale.currency} />
                    )}
                  </div>

                  <div className="space-y-5">
                    {richSale.commissions.length > 0 ? (
                      <CommissionBreakdown sale={richSale} />
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
                          <dt className="text-muted-foreground">
                            {isExpectedCommission
                              ? t('sales.expectedCommission')
                              : t('commissions.title')}
                          </dt>
                          <dd
                            className={cn(
                              'font-medium tabular-nums',
                              isExpectedCommission ? 'text-amber-600' : 'text-destructive',
                            )}
                          >
                            {isExpectedCommission ? '' : '− '}
                            {formatCurrency(totalCommissions, locale, sale.currency)}
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
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-muted-foreground">{t('sales.orderId')}</dt>
                          <dd className="flex items-center gap-1 font-mono text-xs">
                            {orderRef}
                            <CopyButton value={orderRef} />
                          </dd>
                        </div>
                        {richSale.paymentType ? (
                          <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">{t('sales.paymentType')}</dt>
                            <dd>
                              <Badge variant="outline" className="text-[10px] uppercase">
                                {richSale.paymentType}
                              </Badge>
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
                        {richSale.processedAt ? (
                          <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">{t('sales.processedAt')}</dt>
                            <dd>{formatDateTime(richSale.processedAt, locale)}</dd>
                          </div>
                        ) : null}
                        {richSale.deliveredAt ? (
                          <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">{t('sales.deliveredAt')}</dt>
                            <dd>{formatDateTime(richSale.deliveredAt, locale)}</dd>
                          </div>
                        ) : null}
                        {richSale.commissionsCreditedAt ? (
                          <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">
                              {t('sales.commissionsCreditedAt')}
                            </dt>
                            <dd>{formatDateTime(richSale.commissionsCreditedAt, locale)}</dd>
                          </div>
                        ) : null}
                      </dl>
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

/**
 * Seller cell — shows the seller's real profile photo + display name with
 * the sellerCode as a secondary line. Receives the user record from the
 * parent so we don't re-fetch per cell.
 */
function SellerCell({
  sellerCode,
  user,
  isLoading,
  isUnmatched,
}: {
  sellerCode: string;
  user: { displayName: string; profileImageUrl?: string | null } | undefined;
  isLoading: boolean;
  isUnmatched?: boolean;
}) {
  const { t } = useTranslation();
  const displayName = user?.displayName ?? sellerCode;

  return (
    <div className="flex items-center gap-3">
      <Avatar
        className={cn(
          'h-9 w-9',
          isUnmatched && 'ring-2 ring-warning/40',
        )}
      >
        {user?.profileImageUrl && (
          <AvatarImage src={user.profileImageUrl} alt={displayName} />
        )}
        <AvatarFallback
          className={cn(
            isUnmatched && 'bg-warning-soft text-warning-foreground',
          )}
        >
          {getInitials(displayName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col leading-tight">
        {isLoading ? (
          <Skeleton className="h-3.5 w-24" />
        ) : (
          <span className="truncate text-sm font-medium">{displayName}</span>
        )}
        {sellerCode && (
          <span className="truncate text-[11px] text-muted-foreground">{sellerCode}</span>
        )}
        {isUnmatched ? (
          <span
            className="mt-0.5 inline-flex w-fit items-center gap-1 rounded-full bg-warning-soft px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-warning-foreground"
            title={t('sales.unmatchedSeller')}
          >
            <AlertTriangle className="h-3 w-3" aria-hidden />
            {t('sales.unmatched')}
          </span>
        ) : null}
      </div>
    </div>
  );
}
