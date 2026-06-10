'use client';

import { MoreHorizontal, ShieldCheck, ShieldOff } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useActivateUserMutation, useSuspendUserMutation } from '@/hooks/queries/use-users';
import { useTranslation } from '@/hooks/use-translation';
import { toast } from '@/components/ui/sonner';
import { ApiError } from '@/types/api';
import type { User } from '@/types/auth';

export function UserRowActions({ user }: { user: User }) {
  const { t } = useTranslation();
  const suspend = useSuspendUserMutation();
  const activate = useActivateUserMutation();
  const isActive = user.status === 'active';

  const onToggleStatus = async () => {
    const msg = isActive ? 'users.confirmSuspend' : 'users.confirmActivate';
    if (!window.confirm(t(msg))) return;
    try {
      if (isActive) await suspend.mutateAsync(user.id);
      else await activate.mutateAsync(user.id);
      toast.success(t('common.save'));
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('common.actions')}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/wallets?userId=${user.id}`}>{t('users.actions.viewWallet')}</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onToggleStatus} className="gap-2">
          {isActive ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
          {isActive ? t('users.actions.suspend') : t('users.actions.activate')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
