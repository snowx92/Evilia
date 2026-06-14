'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationsQuery,
} from '@/hooks/queries/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { useAuthStore } from '@/store/auth';
import { cn, formatDateTime } from '@/lib/utils';

export function NotificationsPopover() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const query = useNotificationsQuery({ page: 1, limit: 20 });
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const items = query.data?.items ?? [];
  const unread = items.filter((n) => !n.isRead).length;
  const viewAllHref =
    user?.role === 'seller' ? '/seller/notifications' : '/admin/notifications';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -end-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-semibold text-white shadow-card">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">{t('notifications_ext.title')}</p>
            {unread > 0 && (
              <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-medium text-primary">
                {t('notifications_ext.newCount', { count: unread })}
              </span>
            )}
          </div>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-[11px]"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
            >
              {markAll.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCheck className="h-3 w-3" />
              )}
              {t('notifications_ext.markAllRead')}
            </Button>
          )}
        </div>

        {/* List */}
        <ScrollArea className="max-h-[420px]">
          {query.isLoading ? (
            <div className="grid place-items-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="grid place-items-center gap-2 py-12 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
                <Bell className="h-5 w-5" />
              </span>
              <p className="text-xs text-muted-foreground">{t('notifications_ext.empty')}</p>
            </div>
          ) : (
            <ul className="divide-y divide-border/40">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!n.isRead) markOne.mutate(n.id);
                    }}
                    className={cn(
                      'flex w-full items-start gap-3 px-4 py-3 text-start transition-colors hover:bg-muted/60',
                      !n.isRead && 'bg-primary-soft/30',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                        n.isRead ? 'bg-transparent' : 'bg-primary',
                      )}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className={cn('text-[13px]', !n.isRead && 'font-semibold')}>
                        {n.title}
                      </p>
                      {n.message && (
                        <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">
                          {n.message}
                        </p>
                      )}
                      <p className="mt-1 text-[10px] text-muted-foreground/80">
                        {formatDateTime(n.createdAt, locale)}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>

        {/* Footer — view all */}
        <div className="border-t border-border/60 px-3 py-2 text-center">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full text-[11px]"
            onClick={() => setOpen(false)}
          >
            <Link href={viewAllHref}>{t('notifications_ext.viewAll')}</Link>
          </Button>
        </div>

        {/* Floating live indicator */}
        {query.isFetching && !query.isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-t border-border/60 px-4 py-1.5 text-[10px] text-muted-foreground"
          >
            <Loader2 className="me-1.5 inline h-3 w-3 animate-spin" />
            {t('common.loading')}
          </motion.div>
        )}
      </PopoverContent>
    </Popover>
  );
}
