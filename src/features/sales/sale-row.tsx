'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Hash, ArrowUpRight, Wallet } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/shared/status-badge';
import { CopyButton } from '@/components/shared/copy-button';
import { CommissionStrip } from './commission-strip';
import { CommissionBreakdown } from './commission-breakdown';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { cn, formatCurrency, formatDateTime } from '@/lib/utils';
import type { Sale } from '@/types/admin/sales';

const ROLE_BADGE: Record<string, 'brand' | 'success' | 'warning' | 'muted'> = {
  seller: 'brand',
  leader: 'success',
  admin: 'warning',
};

export function SaleRow({ sale }: { sale: Sale }) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [open, setOpen] = useState(false);

  const totalCommissions = sale.commissions.reduce((acc, c) => acc + c.amount, 0);
  const commissionRatio = sale.amount > 0 ? (totalCommissions / sale.amount) * 100 : 0;
  const net = sale.amount - totalCommissions;
  const distinctRoles = new Set(sale.commissions.map((c) => c.role));

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
        {/* Expand chevron */}
        <TableCell className="w-10">
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground group-hover:bg-muted"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </TableCell>

        {/* Seller */}
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{getInitials(sale.sellerCode)}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-medium">{sale.sellerCode}</span>
              <span className="truncate font-mono text-[11px] text-muted-foreground">
                {sale.sellerId}
              </span>
            </div>
          </div>
        </TableCell>

        {/* External reference + source */}
        <TableCell>
          <div className="flex flex-col gap-1 leading-tight">
            <span className="flex items-center gap-1">
              <Hash className="h-3 w-3 text-muted-foreground" />
              <span className="font-mono text-xs">{sale.externalId}</span>
              <CopyButton value={sale.externalId} className="ms-0.5" />
            </span>
            <Badge variant="outline" className="w-fit text-[10px] uppercase tracking-wider">
              {sale.source}
            </Badge>
          </div>
        </TableCell>

        {/* Amount */}
        <TableCell>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tabular-nums">
              {formatCurrency(sale.amount, locale, sale.currency)}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {t('common.amount')}
            </span>
          </div>
        </TableCell>

        {/* Commission strip */}
        <TableCell className="min-w-[220px]">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium tabular-nums">
                {formatCurrency(totalCommissions, locale, sale.currency)}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {commissionRatio.toFixed(1)}% · {sale.commissions.length} {t('commissions.title')}
              </span>
            </div>
            <CommissionStrip commissions={sale.commissions} saleAmount={sale.amount} />
          </div>
        </TableCell>

        {/* Roles */}
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {Array.from(distinctRoles).map((role) => (
              <Badge key={role} variant={ROLE_BADGE[role] ?? 'outline'} className="text-[10px]">
                {role}
              </Badge>
            ))}
          </div>
        </TableCell>

        {/* Status */}
        <TableCell>
          <StatusBadge status={sale.status} />
        </TableCell>

        {/* Date */}
        <TableCell className="text-end">
          <div className="flex flex-col items-end leading-tight">
            <span className="text-sm">{formatDateTime(sale.importedAt, locale)}</span>
            <span className="text-[11px] text-muted-foreground">{t('common.date')}</span>
          </div>
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
                  <CommissionBreakdown sale={sale} />
                  <div className="space-y-3 rounded-xl border border-border/70 bg-surface p-4 lg:col-span-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('common.details')}
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
                          {t('commissions.title')}
                        </dt>
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
                      {t('common.details')}
                    </p>
                    <dl className="space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">External ID</dt>
                        <dd className="flex items-center gap-1 font-mono text-xs">
                          {sale.externalId}
                          <CopyButton value={sale.externalId} />
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">Internal ID</dt>
                        <dd className="flex items-center gap-1 font-mono text-xs">
                          <span className="max-w-[150px] truncate">{sale.id}</span>
                          <CopyButton value={sale.id} />
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-muted-foreground">{t('common.title')}</dt>
                        <dd>{sale.source}</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-muted-foreground">{t('common.date')}</dt>
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
              </motion.div>
            </TableCell>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}
