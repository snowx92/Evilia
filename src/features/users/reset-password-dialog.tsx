'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { useChangeUserPasswordMutation } from '@/hooks/queries/use-users';
import { useTranslation } from '@/hooks/use-translation';
import { ApiError } from '@/types/api';
import type { User } from '@/types/auth';

const schema = z
  .object({
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'mismatch',
  });

type Values = z.infer<typeof schema>;

type Props = {
  user: User;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ResetPasswordDialog({
  user,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: Props) {
  const { t } = useTranslation();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (isControlled) onOpenChange?.(next);
    else setUncontrolledOpen(next);
  };

  const change = useChangeUserPasswordMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await change.mutateAsync({ userId: user.id, password: values.newPassword });
      toast.success(t('users.actions.passwordReset'));
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger === null ? null : (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button variant="outline" size="sm">
              <KeyRound className="h-4 w-4" />
              {t('users.actions.resetPassword')}
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            {t('users.actions.resetPassword')}
          </DialogTitle>
          <DialogDescription>
            {t('users.actions.resetPasswordDesc')}{' '}
            <span className="font-medium text-foreground">{user.displayName}</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="rp-new">{t('profile.newPassword')}</Label>
            <PasswordInput
              id="rp-new"
              dir="ltr"
              autoComplete="new-password"
              showLabel={t('auth.showPassword')}
              hideLabel={t('auth.hidePassword')}
              {...register('newPassword')}
              aria-invalid={Boolean(errors.newPassword)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rp-confirm">{t('profile.confirmPassword')}</Label>
            <PasswordInput
              id="rp-confirm"
              dir="ltr"
              autoComplete="new-password"
              showLabel={t('auth.showPassword')}
              hideLabel={t('auth.hidePassword')}
              {...register('confirmPassword')}
              aria-invalid={Boolean(errors.confirmPassword)}
            />
            {errors.confirmPassword?.message === 'mismatch' && (
              <p className="text-xs text-destructive">{t('profile.passwordMismatch')}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || change.isPending}>
              {(isSubmitting || change.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {t('users.actions.resetPassword')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
