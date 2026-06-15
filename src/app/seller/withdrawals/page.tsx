'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Banknote, Loader2, Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable, type Column } from '@/components/shared/data-table';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { StatusBadge } from '@/components/shared/status-badge';
import { toast } from '@/components/ui/sonner';
import {
  useRequestWithdrawalMutation,
  useSellerWalletQuery,
  useSellerWithdrawalsQuery,
} from '@/hooks/queries/use-seller';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency } from '@/lib/utils';
import { DEFAULT_PAGE_SIZE } from '@/constants/admin';
import { ApiError } from '@/types/api';
import type { SellerWithdrawal } from '@/types/seller';

const buildSchema = (max: number, t: (k: string) => string) =>
  z.object({
    amount: z.coerce
      .number()
      .positive()
      .refine((n) => n <= max, { message: t('seller.amountTooHigh') }),
    paymentMethod: z.enum(['WALLET', 'IPN']),
    paymentIdentifier: z.string().min(4),
  });

function RequestWithdrawalDialog({
  available,
  pending,
}: {
  available: number;
  pending: number;
}) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [open, setOpen] = useState(false);
  const request = useRequestWithdrawalMutation();
  const schema = buildSchema(available, t);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0, paymentMethod: 'IPN', paymentIdentifier: '' },
  });

  const amount = Number(watch('amount')) || 0;
  const paymentMethod = watch('paymentMethod');
  const remaining = Math.max(0, available - amount);
  const overLimit = amount > available;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await request.mutateAsync({
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        paymentIdentifier: values.paymentIdentifier.trim(),
      });
      toast.success(t('seller.withdrawalSubmitted'));
      reset();
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-success text-white hover:bg-success/90">
          <Plus className="h-4 w-4" />
          {t('seller.requestWithdrawal')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-4 w-4" />
            {t('seller.requestWithdrawal')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {/* Balance summary */}
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-border/60 bg-muted/40 p-3 text-center">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {t('wallets.available')}
              </p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums">
                {formatCurrency(available, locale)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {t('wallets.pendingWithdrawal')}
              </p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums">
                {formatCurrency(pending, locale)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {t('common.next')}
              </p>
              <p
                className={`mt-0.5 text-sm font-semibold tabular-nums ${
                  overLimit ? 'text-destructive' : ''
                }`}
              >
                {formatCurrency(remaining, locale)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">{t('seller.requestedAmount')}</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={available}
              dir="ltr"
              {...register('amount')}
              aria-invalid={Boolean(errors.amount)}
            />
            {errors.amount?.message && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
            {/* Quick presets */}
            <div className="flex flex-wrap gap-1.5">
              {[25, 50, 75, 100].map((pct) => (
                <Button
                  key={pct}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  onClick={() => {
                    const val = Math.floor((available * pct) / 100);
                    setValue('amount', val, { shouldValidate: true });
                  }}
                >
                  {pct}%
                </Button>
              ))}
            </div>
          </div>

          {/* Payment method */}
          <div className="space-y-2">
            <Label>{t('withdrawals.fields.paymentMethod')}</Label>
            <Select
              value={paymentMethod}
              onValueChange={(v) =>
                setValue('paymentMethod', v as 'WALLET' | 'IPN', { shouldDirty: true })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IPN">{t('withdrawals.method.IPN')}</SelectItem>
                <SelectItem value="WALLET">{t('withdrawals.method.WALLET')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment identifier */}
          <div className="space-y-2">
            <Label htmlFor="paymentIdentifier">
              {t('withdrawals.fields.paymentIdentifier')}
            </Label>
            <Input
              id="paymentIdentifier"
              type="tel"
              dir="ltr"
              placeholder="01025006647"
              {...register('paymentIdentifier')}
              aria-invalid={Boolean(errors.paymentIdentifier)}
            />
            <p className="text-[11px] text-muted-foreground">
              {t('withdrawals.identifierHelp')}
            </p>
          </div>

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || request.isPending}
              className="bg-success text-white hover:bg-success/90"
            >
              {(isSubmitting || request.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {t('common.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function SellerWithdrawalsPage() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const wallet = useSellerWalletQuery();
  const [page, setPage] = useState(1);
  const query = useSellerWithdrawalsQuery({ page, limit: DEFAULT_PAGE_SIZE });
  const data = query.data;

  const columns: Column<SellerWithdrawal>[] = [
    {
      key: 'amount',
      header: t('withdrawals.fields.amount'),
      cell: (w) => (
        <span className="font-semibold tabular-nums">{formatCurrency(w.amount, locale)}</span>
      ),
    },
    {
      key: 'paymentMethod',
      header: t('withdrawals.fields.paymentMethod'),
      cell: (w) =>
        w.paymentMethod ? (
          <span className="text-sm">{t(`withdrawals.method.${w.paymentMethod}`)}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      key: 'paymentIdentifier',
      header: t('withdrawals.fields.paymentIdentifier'),
      cell: (w) =>
        w.paymentIdentifier ? (
          <span className="font-mono text-xs" dir="ltr">
            {w.paymentIdentifier}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      key: 'status',
      header: t('common.status'),
      cell: (w) => <StatusBadge status={w.status} />,
      className: 'text-end',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('seller.portal')}
        title={t('seller.nav.withdrawals')}
        description={
          wallet.data
            ? `${t('wallets.available')}: ${formatCurrency(wallet.data.available, locale)}`
            : undefined
        }
        actions={
          <RequestWithdrawalDialog
            available={wallet.data?.available ?? 0}
            pending={wallet.data?.pendingWithdrawal ?? 0}
          />
        }
      />

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={data?.items}
            columns={columns}
            isLoading={query.isLoading}
            isError={query.isError}
            onRetry={() => query.refetch()}
            getRowKey={(w) => w.id}
          />
        </CardContent>
      </Card>

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
