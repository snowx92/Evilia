'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Banknote,
  Loader2,
  Wallet as WalletIcon,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { MetricCard } from '@/components/shared/metric-card';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Skeleton } from '@/components/ui/skeleton';
import { CopyButton } from '@/components/shared/copy-button';
import {
  useApproveWithdrawalMutation,
  usePayWithdrawalMutation,
  useRejectWithdrawalMutation,
  useWithdrawalsQuery,
} from '@/hooks/queries/use-withdrawals';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { cn, formatCurrency, formatDateTime } from '@/lib/utils';
import { DEFAULT_PAGE_SIZE, WITHDRAWAL_STATUSES } from '@/constants/admin';
import { fadeUp, stagger } from '@/lib/motion';
import { toast } from '@/components/ui/sonner';
import { ApiError } from '@/types/api';
import type { Withdrawal, WithdrawalStatus } from '@/types/admin/withdrawals';

const ALL = '__all__';

const STATUS_META: Record<
  string,
  { tone: 'success' | 'warning' | 'destructive' | 'brand'; Icon: typeof CheckCircle2 }
> = {
  paid: { tone: 'success', Icon: CheckCircle2 },
  approved: { tone: 'brand', Icon: CheckCircle2 },
  pending: { tone: 'warning', Icon: Clock },
  rejected: { tone: 'destructive', Icon: XCircle },
};

function StatusPill({ status }: { status: WithdrawalStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <Badge variant={meta.tone} className="gap-1 px-2 py-0.5">
      <meta.Icon className="h-3 w-3" />
      <span className="capitalize">{status}</span>
    </Badge>
  );
}

function RejectDialog({ w }: { w: Withdrawal }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const reject = useRejectWithdrawalMutation();
  const submit = async () => {
    if (!reason.trim()) return;
    try {
      await reject.mutateAsync({ id: w.id, body: { reason } });
      toast.success(t('common.save'));
      setOpen(false);
      setReason('');
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 text-destructive">
          <XCircle className="h-4 w-4" />
          {t('common.reject')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('withdrawals_ext.rejectionReason')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label>{t('common.reason')}</Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="destructive" onClick={submit} disabled={reject.isPending || !reason.trim()}>
            {reject.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PayDialog({ w }: { w: Withdrawal }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [ref, setRef] = useState('');
  const pay = usePayWithdrawalMutation();
  const submit = async () => {
    if (!ref.trim()) return;
    try {
      await pay.mutateAsync({ id: w.id, body: { paymentReference: ref } });
      toast.success(t('common.save'));
      setOpen(false);
      setRef('');
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 text-success">
          <Banknote className="h-4 w-4" />
          {t('common.markPaid')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('withdrawals.paymentReference')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label>{t('withdrawals.fields.reference')}</Label>
          <Input value={ref} onChange={(e) => setRef(e.target.value)} dir="ltr" />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={submit} disabled={pay.isPending || !ref.trim()}>
            {pay.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ApproveButton({ w }: { w: Withdrawal }) {
  const { t } = useTranslation();
  const approve = useApproveWithdrawalMutation();
  const onClick = async () => {
    if (!window.confirm(t('withdrawals.confirmApprove'))) return;
    try {
      await approve.mutateAsync(w.id);
      toast.success(t('common.save'));
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  };
  return (
    <Button variant="ghost" size="sm" className="gap-1 text-success" onClick={onClick}>
      <CheckCircle2 className="h-4 w-4" />
      {t('common.approve')}
    </Button>
  );
}

function WithdrawalCard({ w }: { w: Withdrawal }) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const rejected = w.status === 'rejected';

  return (
    <motion.div
      variants={fadeUp}
      className="group rounded-2xl border border-border/70 bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
        {/* Left: requester + amount */}
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{getInitials(w.userId)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-baseline gap-2">
              <p className="truncate font-mono text-sm font-medium">{w.userId}</p>
              <StatusPill status={w.status} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold tabular-nums">
                {formatCurrency(w.amount, locale)}
              </span>
              <span className="text-xs text-muted-foreground">{t('common.amount')}</span>
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex flex-wrap items-center justify-end gap-1">
          {w.status === 'pending' && (
            <>
              <ApproveButton w={w} />
              <RejectDialog w={w} />
            </>
          )}
          {w.status === 'approved' && <PayDialog w={w} />}
        </div>
      </div>

      {/* Payment instructions from the seller */}
      {(w.paymentMethod || w.paymentIdentifier) && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border/60 bg-muted/30 px-5 py-3 text-xs">
          {w.paymentMethod ? (
            <div className="flex items-center gap-2 leading-tight">
              <span className="font-medium uppercase tracking-wider text-muted-foreground/80">
                {t('withdrawals.fields.paymentMethod')}
              </span>
              <Badge variant="outline" className="text-[10px] uppercase">
                {t(`withdrawals.method.${w.paymentMethod}`)}
              </Badge>
            </div>
          ) : null}
          {w.paymentIdentifier ? (
            <div className="flex items-center gap-2 leading-tight">
              <span className="font-medium uppercase tracking-wider text-muted-foreground/80">
                {t('withdrawals.fields.paymentIdentifier')}
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-sm" dir="ltr">
                {w.paymentIdentifier}
                <CopyButton value={w.paymentIdentifier} />
              </span>
            </div>
          ) : null}
        </div>
      )}

      {/* Timeline */}
      <div className="border-t border-border/60 px-5 py-4">
        <ol className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Requested */}
          <li className="flex items-start gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
              <Clock className="h-3.5 w-3.5" />
            </span>
            <div className="leading-tight">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {t('withdrawals_ext.requestedAt')}
              </p>
              <p className="text-xs">{formatDateTime(w.requestedAt, locale)}</p>
            </div>
          </li>

          <span className="hidden h-px flex-1 bg-border sm:block" aria-hidden="true" />

          {/* Reviewed */}
          {w.reviewedAt ? (
            <li className="flex items-start gap-3">
              <span
                className={cn(
                  'grid h-7 w-7 shrink-0 place-items-center rounded-full',
                  rejected
                    ? 'bg-destructive-soft text-destructive'
                    : 'bg-success-soft text-success',
                )}
              >
                {rejected ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              </span>
              <div className="leading-tight">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t('withdrawals_ext.reviewedAt')}
                </p>
                <p className="text-xs">{formatDateTime(w.reviewedAt, locale)}</p>
                {w.reviewedBy && (
                  <p className="font-mono text-[10px] text-muted-foreground">{w.reviewedBy}</p>
                )}
              </div>
            </li>
          ) : (
            <li className="flex items-center gap-3 text-muted-foreground/60">
              <span className="grid h-7 w-7 place-items-center rounded-full border border-dashed border-border">
                <Clock className="h-3.5 w-3.5" />
              </span>
              <p className="text-[11px]">{t('withdrawals_ext.reviewedAt')}</p>
            </li>
          )}

          <span className="hidden h-px flex-1 bg-border sm:block" aria-hidden="true" />

          {/* Outcome */}
          {w.status === 'paid' && w.paymentReference ? (
            <li className="flex items-start gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-success-soft text-success">
                <Banknote className="h-3.5 w-3.5" />
              </span>
              <div className="leading-tight">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t('withdrawals.fields.reference')}
                </p>
                <span className="inline-flex items-center gap-1 font-mono text-xs">
                  {w.paymentReference}
                  <CopyButton value={w.paymentReference} />
                </span>
              </div>
            </li>
          ) : w.status === 'rejected' && w.rejectionReason ? (
            <li className="flex items-start gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-destructive-soft text-destructive">
                <XCircle className="h-3.5 w-3.5" />
              </span>
              <div className="leading-tight">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t('withdrawals_ext.rejectionReason')}
                </p>
                <p className="text-xs">{w.rejectionReason}</p>
              </div>
            </li>
          ) : (
            <li className="flex items-center gap-3 text-muted-foreground/60">
              <span className="grid h-7 w-7 place-items-center rounded-full border border-dashed border-border">
                <WalletIcon className="h-3.5 w-3.5" />
              </span>
              <p className="text-[11px]">{t('common.details')}</p>
            </li>
          )}
        </ol>
      </div>
    </motion.div>
  );
}

export default function WithdrawalsPage() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<WithdrawalStatus | undefined>(undefined);

  const params = { page, limit: DEFAULT_PAGE_SIZE, ...(status ? { status } : {}) };
  const query = useWithdrawalsQuery(params);
  const data = query.data;
  const items = data?.items ?? [];

  const kpis = useMemo(() => {
    const stats = { paid: 0, pending: 0, rejected: 0, paidCount: 0 };
    items.forEach((w) => {
      if (w.status === 'paid') {
        stats.paid += w.amount;
        stats.paidCount += 1;
      } else if (w.status === 'pending') {
        stats.pending += w.amount;
      } else if (w.status === 'rejected') {
        stats.rejected += w.amount;
      }
    });
    return stats;
  }, [items]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t('nav.withdrawals')}
        title={t('withdrawals.title')}
        description={t('analytics.daily')}
        actions={
          <Select
            value={status ?? ALL}
            onValueChange={(v) => {
              setStatus(v === ALL ? undefined : (v as WithdrawalStatus));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder={t('withdrawals.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('common.all')}</SelectItem>
              {WITHDRAWAL_STATUSES.map((s) => (
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
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <MetricCard
          label={t('status.paid')}
          value={formatCurrency(kpis.paid, locale)}
          icon={CheckCircle2}
          accent="emerald"
          isLoading={query.isLoading}
        />
        <MetricCard
          label={t('status.pending')}
          value={formatCurrency(kpis.pending, locale)}
          icon={Clock}
          accent="amber"
          isLoading={query.isLoading}
        />
        <MetricCard
          label={t('status.rejected')}
          value={formatCurrency(kpis.rejected, locale)}
          icon={XCircle}
          accent="rose"
          isLoading={query.isLoading}
        />
        <MetricCard
          label={t('withdrawals.title')}
          value={String(kpis.paidCount)}
          icon={Banknote}
          accent="indigo"
          isLoading={query.isLoading}
        />
      </motion.div>

      {query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : query.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <EmptyState title={t('common.noResults')} description={t('withdrawals.title')} />
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid gap-3 lg:grid-cols-2"
        >
          {items.map((w) => (
            <WithdrawalCard key={w.id} w={w} />
          ))}
        </motion.div>
      )}

      {data && data.totalPages > 1 && (
        <PaginationBar
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          totalItems={data.totalItems}
          onChange={setPage}
        />
      )}
    </div>
  );
}
