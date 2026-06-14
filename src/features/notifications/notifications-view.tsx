'use client';

import { useState } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationsQuery,
} from '@/hooks/queries/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { cn, formatDateTime } from '@/lib/utils';

const PAGE_SIZE = 20;

export function NotificationsView() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [page, setPage] = useState(1);
  const query = useNotificationsQuery({ page, limit: PAGE_SIZE });
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const data = query.data;
  const items = data?.items ?? [];
  const unread = items.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('notifications_ext.title')}
        title={t('notifications_ext.title')}
        actions={
          unread > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              className="gap-1.5"
            >
              {markAll.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5" />
              )}
              {t('notifications_ext.markAllRead')}
            </Button>
          ) : null
        }
      />

      <Card>
        <CardContent className="p-0">
          {query.isError ? (
            <div className="p-6">
              <ErrorState onRetry={() => query.refetch()} />
            </div>
          ) : query.isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-10">
              <EmptyState
                title={t('notifications_ext.empty')}
                description={t('notifications_ext.title')}
              />
            </div>
          ) : (
            <ul className="divide-y divide-border/40">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => !n.isRead && markOne.mutate(n.id)}
                    className={cn(
                      'flex w-full items-start gap-3 px-5 py-4 text-start transition-colors hover:bg-muted/40',
                      !n.isRead && 'bg-primary-soft/30',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-1.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl',
                        n.isRead
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-primary-soft text-primary',
                      )}
                    >
                      <Bell className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1 leading-tight">
                      <p
                        className={cn(
                          'text-sm',
                          !n.isRead && 'font-semibold',
                        )}
                      >
                        {n.title}
                      </p>
                      {n.message && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {n.message}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-muted-foreground/80">
                        {formatDateTime(n.createdAt, locale)}
                      </p>
                    </div>
                    {!n.isRead && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {data && data.totalPages > 1 && (
        <PaginationBar
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          totalItems={data.totalItems}
          pageSize={PAGE_SIZE}
          onChange={setPage}
          disabled={query.isFetching}
        />
      )}
    </div>
  );
}
