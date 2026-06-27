'use client';

import { useState } from 'react';
import {
  KeyRound,
  MoreHorizontal,
  Pencil,
  ShieldCheck,
  ShieldOff,
  Trash2,
  UserCircle,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EditUserDialog } from './edit-user-dialog';
import { ResetPasswordDialog } from './reset-password-dialog';
import {
  useActivateUserMutation,
  useDeleteUserMutation,
  useSuspendUserMutation,
} from '@/hooks/queries/use-users';
import { useTranslation } from '@/hooks/use-translation';
import { toast } from '@/components/ui/sonner';
import { ApiError } from '@/types/api';
import { useAuthStore } from '@/store/auth';
import type { User } from '@/types/auth';

export function UserRowActions({ user }: { user: User }) {
  const { t } = useTranslation();
  const suspend = useSuspendUserMutation();
  const activate = useActivateUserMutation();
  const deleteMutation = useDeleteUserMutation();
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isActive = user.status === 'active';
  const isSeller = user.role === 'seller';
  const isSelf = user.id === currentUserId;
  const canDelete = isSeller && !isSelf;

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

  const onConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(user.id);
      toast.success(t('users.actions.deleted'));
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
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-destructive focus:text-destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  setTimeout(() => setDeleteOpen(true), 0);
                }}
              >
                <Trash2 className="h-4 w-4" />
                {t('users.actions.deleteUser')}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('users.actions.deleteUser')}</DialogTitle>
            <DialogDescription>{t('users.confirmDelete')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
