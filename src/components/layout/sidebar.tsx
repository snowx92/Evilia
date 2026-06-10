'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { useAuthStore, hasPermission } from '@/store/auth';
import { NAV_ITEMS } from './nav-config';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BrandMark } from './brand-mark';
import { Avatar, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const PRIMARY_SECTION = ['/admin'];
const OVERVIEW_HREFS = new Set(['/admin', '/admin/analytics']);
const COMMERCE_HREFS = new Set([
  '/admin/sales',
  '/admin/commissions',
  '/admin/wallets',
  '/admin/withdrawals',
  '/admin/targets',
  '/admin/expenses',
]);
const ORG_HREFS = new Set(['/admin/users', '/admin/hierarchy', '/admin/access']);

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const auth = useAuthStore();
  const user = useAuthStore((s) => s.user);

  const allowed = NAV_ITEMS.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(auth, item.permission);
  });

  const sections = [
    { key: 'overview', label: t('nav.dashboard'), items: allowed.filter((i) => OVERVIEW_HREFS.has(i.href)) },
    { key: 'commerce', label: t('sales.title'), items: allowed.filter((i) => COMMERCE_HREFS.has(i.href)) },
    { key: 'org', label: t('users.title'), items: allowed.filter((i) => ORG_HREFS.has(i.href)) },
  ].filter((s) => s.items.length > 0);

  return (
    <aside className="sticky top-0 hidden h-dvh w-[260px] shrink-0 flex-col border-e border-border/60 bg-surface/40 lg:flex">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <BrandMark />
        <div className="flex flex-col leading-tight">
          <span className="text-[15px] font-semibold tracking-tight">{t('app.shortName')}</span>
          <span className="text-[11px] text-muted-foreground">{t('app.title')}</span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="space-y-6">
          {sections.map((section) => (
            <div key={section.key} className="space-y-1.5">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    PRIMARY_SECTION.includes(item.href)
                      ? pathname === item.href
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                          active
                            ? 'text-foreground'
                            : 'text-muted-foreground hover:bg-surface hover:text-foreground',
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="sidebar-active-pill"
                            className="absolute inset-0 rounded-xl bg-surface shadow-card ring-1 ring-border/70"
                            transition={{ type: 'spring', bounce: 0.18, duration: 0.5 }}
                          />
                        )}
                        <Icon
                          className={cn(
                            'relative h-4 w-4 transition-colors',
                            active ? 'text-primary' : 'text-muted-foreground/80',
                          )}
                        />
                        <span className="relative flex-1">{t(item.labelKey)}</span>
                        {item.needsBackend && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                className="relative inline-flex h-2 w-2 items-center justify-center rounded-full bg-warning ring-2 ring-warning/30"
                                aria-label={t('backend.pending')}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="text-[11px]">
                              {t('backend.pending')}
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {active && !item.needsBackend && (
                          <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User footer */}
      {user && (
        <div className="m-3 flex items-center gap-3 rounded-2xl border border-border/70 bg-surface p-3 shadow-card">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-sm font-medium">{user.displayName}</span>
            <span className="truncate text-[11px] text-muted-foreground">{user.email}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
