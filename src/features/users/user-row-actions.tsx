'use client';

import { useState } from 'react';
import { KeyRound, MoreHorizontal, Pencil, ShieldCheck, ShieldOff, UserCircle } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { EditUserDialog } from './edit-user-dialog';
import { ResetPasswordDialog } from './reset-password-dialog';
import { useActivateUserMutation, useSuspendUserMutation } from '@/hooks/queries/use-users';
import { useTranslation } from '@/hooks/use-translation';
import { toast } from '@/components/ui/sonner';
import { ApiError } from '@/types/api';
import type { User } from '@/types/auth';

export function UserRowActions({ user }: { user: User }) {
  const { t } = useTranslation();
  const suspend = useSuspendUserMutation();
  const activate = useActivateUserMutation();
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const isActive = user.status === 'active';

  const onToggleStatus = async () => {
    if (!user?.id) return;
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
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={t('common.actions')}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/users/${encodeURIComponent(user.id)}`} className="gap-2">
              <UserCircle className="h-4 w-4" />
              {t('users.actions.viewProfile')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            onSelect={(e) => {
              // Defer opening the dialog so Radix can finish closing the menu first.
              e.preventDefault();
              setTimeout(() => setEditOpen(true), 0);
            }}
          >
            <Pencil className="h-4 w-4" />
            {t('users.actions.editUser')}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/admin/wallets/${encodeURIComponent(user.id)}`}>
              {t('users.actions.viewWallet')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            onSelect={(e) => {
              e.preventDefault();
              setTimeout(() => setResetOpen(true), 0);
            }}
          >
            <KeyRound className="h-4 w-4" />
            {t('users.actions.resetPassword')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onToggleStatus} className="gap-2">
            {isActive ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            {isActive ? t('users.actions.suspend') : t('users.actions.activate')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Controlled edit dialog — opened via the menu item above. */}
      {editOpen && (
        <EditUserDialog
          user={user}
          trigger={null}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
      {resetOpen && (
        <ResetPasswordDialog
          user={user}
          trigger={null}
          open={resetOpen}
          onOpenChange={setResetOpen}
        />
      )}
    </>
  );
}
