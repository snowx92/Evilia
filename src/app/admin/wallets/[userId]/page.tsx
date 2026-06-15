'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  Wallet as WalletIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage, getInitials } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  useAdjustWalletMutation,
  useWalletQuery,
  useWalletTransactionsQuery,
} from '@/hooks/queries/use-wallets';
import { ResetWalletDialog } from '@/features/wallets/reset-wallet-dialog';
import { useUserQuery } from '@/hooks/queries/use-users';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { cn, formatCurrency, formatDateTime } from '@/lib/utils';
import { fadeUp, stagger } from '@/lib/motion';
import { DEFAULT_PAGE_SIZE } from '@/constants/admin';
import { toast } from '@/components/ui/sonner';
import { ApiError } from '@/types/api';
import type { WalletTransaction } from '@/types/admin/wallets';

const adjustSchema = z.object({
  amount: z.coerce.number().refine((n) => n !== 0, { message: 'required' }),
  type: z.enum(['bonus', 'adjustment']),
  description: z.string().min(1),
});
type AdjustValues = z.infer<typeof adjustSchema>;

function AdjustDialog({ userId, currentBalance }: { userId: string; currentBalance?: number }) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [open, setOpen] = useState(false);
  const adjust = useAdjustWalletMutation();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<AdjustValues>({
    resolver: zodResolver(adjustSchema),
    defaultValues: { type: 'bonus', amount: 0, description: '' },
  });

  const amount = Number(watch('amount')) || 0;
  const previewBalance = (currentBalance ?? 0) + amount;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await adjust.mutateAsync({ userId, body: values });
      toast.success(t('common.save'));
      setOpen(false);
      reset();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{t('wallets.adjust')}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('wallets.adjust')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3" noValidate>
          <div className="space-y-2">
            <Label>{t('common.amount')}</Label>
            <Input type="number" step="0.01" dir="ltr" {...register('amount')} />
          </div>
          <div className="space-y-2">
            <Label>{t('targets.fields.type')}</Label>
            <Select
              value={watch('type')}
              onValueChange={(v) => setValue('type', v as 'bonus' | 'adjustment')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bonus">{t('transaction.type.bonus')}</SelectItem>
                <SelectItem value="adjustment">{t('transaction.type.adjustment')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('common.description')}</Label>
            <Textarea {...register('description')} rows={3} />
          </div>

          {/* Before / after preview */}
          {currentBalance !== undefined && (
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-xs">
              <div className="flex flex-col leading-tight">
                <span className="text-muted-foreground">{t('wallets.balance')}</span>
                <span className="font-semibold tabular-nums">
                  {formatCurrency(currentBalance, locale)}
                </span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex flex-col leading-tight text-end">
                <span className="text-muted-foreground">{t('common.save')}</span>
                <span
                  className={cn(
                    'font-semibold tabular-nums',
                    amount > 0 && 'text-success',
                    amount < 0 && 'text-destructive',
                  )}
                >
                  {formatCurrency(previewBalance, locale)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || adjust.isPending}>
              {(isSubmitting || adjust.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function TxRow({ tx }: { tx: WalletTransaction }) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const outflow = tx.type === 'withdrawal';
  const Arrow = outflow ? ArrowUpRight : ArrowDownLeft;

  return (
    <motion.li
      variants={fadeUp}
      className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-transparent px-4 py-3 transition-all hover:border-border/60 hover:bg-card"
    >
      <span
        className={cn(
          'grid h-9 w-9 place-items-center rounded-xl',
          outflow ? 'bg-destructive-soft text-destructive' : 'bg-success-soft text-success',
        )}
      >
        <Arrow className="h-4 w-4" />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-medium">
          {tx.description ?? t(`transaction.type.${tx.type}`)}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {t(`transaction.type.${tx.type}`)} · {formatDateTime(tx.createdAt, locale)}
        </p>
      </div>
      <div className="text-end leading-tight">
        <p
          className={cn(
            'text-sm font-semibold tabular-nums',
            outflow ? 'text-destructive' : 'text-success',
          )}
        >
          {outflow ? '−' : '+'} {formatCurrency(tx.amount, locale)}
        </p>
        {tx.balanceAfter !== undefined && (
          <p className="text-[10px] text-muted-foreground">
            → {formatCurrency(tx.balanceAfter, locale)}
          </p>
        )}
      </div>
    </motion.li>
  );
}

export default function UserWalletPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);

  const wallet = useWalletQuery(userId);
  const user = useUserQuery(userId);
  const [txPage, setTxPage] = useState(1);
  const txs = useWalletTransactionsQuery(userId, { page: txPage, limit: DEFAULT_PAGE_SIZE });
  const u = user.data;
  const w = wallet.data;

  return (
    <div className="space-y-8">
      <Button asChild variant="ghost" size="sm" className="-ms-3 gap-1.5">
        <Link href="/admin/wallets">
          <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" />
          {t('common.back')}
        </Link>
      </Button>

      <PageHeader
        eyebrow={t('nav.wallets')}
        title={u?.displayName ?? userId}
        description={u?.email}
        actions={
          <div className="flex items-center gap-2">
            <ResetWalletDialog userId={userId} userName={u?.displayName} />
            <AdjustDialog userId={userId} currentBalance={w?.balance} />
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Avatar className="h-12 w-12">
            {u?.profileImageUrl && (
              <AvatarImage src={u.profileImageUrl} alt={u.displayName} />
            )}
            <AvatarFallback>{getInitials(u?.displayName ?? userId)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <CardTitle className="text-lg">
              {u?.displayName ?? userId}{' '}
              {u?.role && (
                <Badge variant="brand" className="ms-2 align-middle text-[10px]">
                  {t(`role.${u.role}`)}
                </Badge>
              )}
            </CardTitle>
            <span className="font-mono text-[11px] text-muted-foreground">{userId}</span>
          </div>
        </CardHeader>
        <CardContent>
          {wallet.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : w ? (
            <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
              <Stat label={t('wallets.balance')} value={formatCurrency(w.balance, locale)} />
              <Stat label={t('wallets.available')} value={formatCurrency(w.available, locale)} />
              <Stat
                label={t('wallets.pendingWithdrawal')}
                value={formatCurrency(w.pendingWithdrawal, locale)}
              />
              <Stat
                label={t('wallets.onGoingOrders')}
                value={formatCurrency(w.onGoingOrdersBalance ?? 0, locale)}
              />
              <Stat label={t('wallets.totalEarned')} value={formatCurrency(w.totalEarned, locale)} />
              <Stat label={t('wallets.totalWithdrawn')} value={formatCurrency(w.totalWithdrawn, locale)} />
            </dl>
          ) : (
            <EmptyState title={t('common.noResults')} description={t('wallets.title')} />
          )}
          {w && (
            <p className="mt-5 text-xs text-muted-foreground">
              {t('wallets.lastUpdated')}: {formatDateTime(w.updatedAt, locale)}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WalletIcon className="h-4 w-4 text-primary" />
            {t('wallets.transactions')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {txs.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-2xl" />
              ))}
            </div>
          ) : txs.data && txs.data.items.length > 0 ? (
            <motion.ul
              variants={stagger}
              initial="hidden"
              animate="show"
              className="space-y-1.5"
            >
              {txs.data.items.map((tx) => (
                <TxRow key={tx.id} tx={tx} />
              ))}
            </motion.ul>
          ) : (
            <EmptyState title={t('common.noResults')} description={t('wallets.transactions')} />
          )}
          {txs.data && txs.data.totalPages > 1 && (
            <PaginationBar
              currentPage={txs.data.currentPage}
              totalPages={txs.data.totalPages}
              totalItems={txs.data.totalItems}
              onChange={setTxPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
