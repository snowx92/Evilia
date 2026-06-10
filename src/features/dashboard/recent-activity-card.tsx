'use client';

import { Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { useNotificationsQuery } from '@/hooks/queries/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function RecentActivityCard() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const query = useNotificationsQuery({ page: 1, limit: 6 });
  const items = query.data?.items;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('nav.dashboard')}</CardTitle>
        <CardDescription>{t('dashboard.today')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {query.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))
        ) : !items || items.length === 0 ? (
          <EmptyState title={t('common.noResults')} className="py-8" />
        ) : (
          <ul className="space-y-3">
            {items.slice(0, 5).map((n) => (
              <li key={n.id} className="flex items-start gap-3">
                <span
                  className={cn(
                    'grid h-8 w-8 shrink-0 place-items-center rounded-full',
                    n.isRead ? 'bg-muted text-muted-foreground' : 'bg-primary-soft text-primary',
                  )}
                >
                  <Bell className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{n.title}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{n.message}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    {formatDateTime(n.createdAt, locale)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
