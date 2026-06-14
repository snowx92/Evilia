'use client';

import Link from 'next/link';
import { Menu, LogOut, Search, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LocaleSwitcher } from '@/components/shared/locale-switcher';
import { Avatar, AvatarFallback, AvatarImage, getInitials } from '@/components/ui/avatar';
import { NotificationsPopover } from '@/features/notifications/notifications-popover';
import { useAuthStore } from '@/store/auth';
import { useLogout } from '@/hooks/queries/use-auth';
import { useTranslation } from '@/hooks/use-translation';

export function Topbar({ onMobileMenu }: { onMobileMenu?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const router = useRouter();
  const { t } = useTranslation();

  // Both portals share this Topbar; route to the profile page in the right area.
  const profilePath = user?.role === 'seller' ? '/seller/profile' : '/admin/profile';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Menu"
        onClick={onMobileMenu}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search shortcut — for the global command palette later */}
      <div className="hidden flex-1 max-w-md lg:block">
        <button
          type="button"
          className="group flex h-9 w-full items-center gap-2 rounded-xl border border-border/70 bg-surface/60 px-3 text-sm text-muted-foreground transition-colors hover:bg-surface"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-start">{t('common.search')}</span>
          <kbd className="hidden rounded-md border border-border/70 bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="ms-auto flex items-center gap-1.5">
        <LocaleSwitcher />
        <NotificationsPopover />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-10 items-center gap-2 rounded-xl border border-transparent px-1.5 transition-colors hover:border-border/70 hover:bg-surface"
            >
              <Avatar className="h-7 w-7">
                {user?.profileImageUrl ? (
                  <AvatarImage src={user.profileImageUrl} alt={user.displayName} />
                ) : null}
                <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
              </Avatar>
              <span className="hidden text-start sm:flex sm:flex-col sm:leading-tight">
                <span className="text-xs font-medium">{user?.displayName ?? '—'}</span>
                <span className="text-[11px] text-muted-foreground">{user?.email}</span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">{user?.displayName}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={profilePath} className="gap-2">
                <UserIcon className="h-4 w-4" />
                {t('common.profile')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                router.replace('/login');
              }}
              className="gap-2 text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              {t('common.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
