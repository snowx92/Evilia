'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { useResetWalletMutation } from '@/hooks/queries/use-wallets';
import { useTranslation } from '@/hooks/use-translation';
import { toast } from '@/components/ui/sonner';
import { ApiError } from '@/types/api';

const CONFIRM_WORD = 'RESET';

type Props = {
  /** When provided, resets only this user's wallet. Omit to reset ALL wallets. */
  userId?: string;
  userName?: string;
};

export function ResetWalletDialog({ userId, userName }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [password, setPassword] = useState('');
  const reset = useResetWalletMutation();

  const isAll = !userId;
  const canSubmit = confirm === CONFIRM_WORD && password.trim().length > 0;

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setConfirm('');
      setPassword('');
    }
  };

  const onSubmit = async () => {
    if (!canSubmit) return;
    try {
      await reset.mutateAsync({ password: password.trim(), ...(userId ? { userId } : {}) });
      toast.success(t('wallets.resetSuccess'));
      handleClose(false);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-1.5">
          <RotateCcw className="h-4 w-4" />
          {isAll ? t('wallets.resetAll') : t('wallets.reset')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {isAll ? t('wallets.resetAll') : t('wallets.reset')}
          </DialogTitle>
        </DialogHeader>

        {/* Danger banner */}
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-semibold text-destructive">
            {t('common.dangerZone')}
          </p>
          <p className="mt-1 text-muted-foreground">
            {isAll ? t('wallets.resetWarningAll') : t('wallets.resetWarning')}
          </p>
          {!isAll && userName && (
            <p className="mt-2 font-medium text-foreground">{userName}</p>
          )}
        </div>

        <div className="space-y-4">
          {/* Password */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t('wallets.resetPassword')}
            </Label>
            <PasswordInput
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showLabel={t('auth.showPassword')}
              hideLabel={t('auth.hidePassword')}
              placeholder="••••••••"
              autoComplete="off"
            />
          </div>

          {/* Confirmation word */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t('wallets.resetConfirmLabel', { word: CONFIRM_WORD })}
            </Label>
            <Input
              dir="ltr"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value.toUpperCase())}
              placeholder={CONFIRM_WORD}
              className="font-mono tracking-widest"
              autoComplete="off"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleClose(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={onSubmit}
            disabled={!canSubmit || reset.isPending}
          >
            {reset.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isAll ? t('wallets.resetAll') : t('wallets.reset')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
