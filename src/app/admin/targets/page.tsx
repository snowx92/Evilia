'use client';

import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Target as TargetIcon, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { MetricCard } from '@/components/shared/metric-card';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage, getInitials } from '@/components/ui/avatar';
import {
  CreateTargetDialog,
  DeleteTargetButton,
  EditTargetDialog,
} from '@/features/targets/target-dialogs';
import { useTargetsQuery } from '@/hooks/queries/use-targets';
import { useUserQuery } from '@/hooks/queries/use-users';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { DEFAULT_PAGE_SIZE } from '@/constants/admin';
import { fadeUp, stagger } from '@/lib/motion';
import type { Target } from '@/types/admin/targets';

const STATUS_TONE: Record<string, 'success' | 'warning' | 'destructive' | 'muted'> = {
  active: 'warning',
  achieved: 'success',
  expired: 'muted',
};

function TargetCard({ target }: { target: Target }) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const progress = Math.min(100, (target.currentAmount / Math.max(target.targetAmount, 1)) * 100);
  const achieved = target.status === 'achieved' || target.currentAmount >= target.targetAmount;
  const tone = STATUS_TONE[target.status] ?? 'warning';
  const userQuery = useUserQuery(target.userId);
  const user = userQuery.data;

  return (
    <motion.article
      variants={fadeUp}
      className="group flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Badge variant={tone} className="text-[10px] uppercase">
            {t(`status.${target.status}`)}
          </Badge>
          <h3 className="text-base font-semibold leading-tight">{target.title}</h3>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {target.type}
          </p>
        </div>
        <div className="flex items-center gap-0.5">
          <EditTargetDialog target={target} />
          <DeleteTargetButton target={target} />
        </div>
      </header>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-semibold tabular-nums">
            {formatCurrency(target.currentAmount, locale)}
          </span>
          <span className="text-xs text-muted-foreground">
            / {formatCurrency(target.targetAmount, locale)}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'h-full rounded-full',
              achieved ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-brand-gradient',
            )}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{progress.toFixed(0)}%</span>
          {achieved && (
            <span className="inline-flex items-center gap-1 text-success">
              <CheckCircle2 className="h-3 w-3" /> {t('status.achieved')}
            </span>
          )}
        </div>
      </div>

      <footer className="space-y-3 border-t border-border/60 pt-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-7 w-7">
            {user?.profileImageUrl && (
              <AvatarImage src={user.profileImageUrl} alt={user.displayName} />
            )}
            <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
          </Avatar>
          {userQuery.isLoading ? (
            <Skeleton className="h-3 w-28" />
          ) : (
            <span className="text-[11px] font-medium text-foreground">
              {user?.displayName ?? target.userId}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            {formatDate(target.startDate, locale)} → {formatDate(target.endDate, locale)}
          </span>
        </div>
      </footer>
    </motion.article>
  );
}

export default function TargetsPage() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [page, setPage] = useState(1);
  const query = useTargetsQuery({ page, limit: DEFAULT_PAGE_SIZE });
  const data = query.data;
  const items = data?.items ?? [];

  const kpis = useMemo(() => {
    const total = items.length;
    const achieved = items.filter((tg) => tg.status === 'achieved').length;
    const targetSum = items.reduce((acc, tg) => acc + tg.targetAmount, 0);
    const currentSum = items.reduce((acc, tg) => acc + tg.currentAmount, 0);
    return { total, achieved, targetSum, currentSum };
  }, [items]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t('nav.targets')}
        title={t('targets.title')}
        description={t('analytics.daily')}
        actions={<CreateTargetDialog />}
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <MetricCard
          label={t('targets.title')}
          value={String(kpis.total)}
          icon={TargetIcon}
          accent="indigo"
          isLoading={query.isLoading}
        />
        <MetricCard
          label={t('status.achieved')}
          value={String(kpis.achieved)}
          icon={CheckCircle2}
          accent="emerald"
          isLoading={query.isLoading}
        />
        <MetricCard
          label={t('targets.fields.targetAmount')}
          value={formatCurrency(kpis.targetSum, locale)}
          icon={TrendingUp}
          accent="amber"
          isLoading={query.isLoading}
        />
        <MetricCard
          label={t('targets.fields.currentAmount')}
          value={formatCurrency(kpis.currentSum, locale)}
          icon={TrendingUp}
          accent="rose"
          isLoading={query.isLoading}
        />
      </motion.div>

      {query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : query.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <EmptyState title={t('common.noResults')} description={t('targets.title')} />
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((tg) => (
            <TargetCard key={tg.id} target={tg} />
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
