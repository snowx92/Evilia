'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { useAuthStore } from '@/store/auth';
import { SELLER_NAV_ITEMS } from './seller-nav-config';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BrandMark } from './brand-mark';
import { Avatar, AvatarFallback, AvatarImage, getInitials } from '@/components/ui/avatar';

type SellerSidebarProps = {
  variant?: 'desktop' | 'drawer';
  onNavigate?: () => void;
};

export function SellerSidebar({ variant = 'desktop', onNavigate }: SellerSidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  return (
    <aside
      className={cn(
        'flex h-dvh w-[260px] shrink-0 flex-col border-e border-border/60 bg-surface/40',
        variant === 'desktop' && 'sticky top-0 hidden lg:flex',
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <BrandMark />
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[15px] font-semibold tracking-tight">
            {t('app.shortName')}
          </span>
          <span className="truncate text-[11px] text-success">{t('seller.portal')}</span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="space-y-1">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            {t('seller.nav.section')}
          </p>
          <ul className="space-y-0.5">
            {SELLER_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === '/seller'
                  ? pathname === '/seller'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    prefetch
                    href={item.href}
                    onClick={() => onNavigate?.()}
                    className={cn(
                      'group/nav flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-surface text-foreground shadow-card ring-1 ring-border/70'
                        : 'text-muted-foreground hover:bg-surface/70 hover:text-foreground',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-colors',
                        active ? 'text-success' : 'text-muted-foreground/80',
                      )}
                    />
                    <span className="flex-1 truncate text-start">{t(item.labelKey)}</span>
                    {active && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </ScrollArea>

      {/* User footer */}
      {user && (
        <div className="m-3 flex items-center gap-3 rounded-2xl border border-border/70 bg-surface p-3 shadow-card">
          <Avatar className="h-9 w-9 shrink-0">
            {user.profileImageUrl ? (
              <AvatarImage src={user.profileImageUrl} alt={user.displayName} />
            ) : null}
            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col leading-tight text-start">
            <span className="truncate text-sm font-medium">{user.displayName}</span>
            <span className="truncate text-[11px] text-muted-foreground">
              {user.sellerCode ?? user.email}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
