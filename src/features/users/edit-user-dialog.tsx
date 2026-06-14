'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Pencil } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LinksListEditor } from '@/components/shared/links-list-editor';
import { useUpdateUserMutation } from '@/hooks/queries/use-users';
import { useTranslation } from '@/hooks/use-translation';
import { toast } from '@/components/ui/sonner';
import { ApiError } from '@/types/api';
import type { Locale, User } from '@/types/auth';
import type { UpdateUserRequest } from '@/types/admin/users';

const schema = z.object({
  displayName: z.string().min(2),
  phone: z.string().optional(),
  language: z.enum(['ar', 'en']),
  sellerCode: z.string().optional(),
  directCommissionPercentage: z.coerce.number().min(0).max(100).optional(),
  networkCommissionPercentage: z.coerce.number().min(0).max(100).optional(),
  socialMediaLink: z
    .string()
    .url()
    .optional()
    .or(z.literal('').transform(() => undefined)),
});
type Values = z.infer<typeof schema>;

type Props = {
  user: User;
  /**
   * Custom trigger node. Defaults to a pencil icon button. Pass `null` to
   * suppress the trigger entirely (when driving the dialog with `open`).
   */
  trigger?: React.ReactNode;
  /** Controlled open state — when provided the dialog is fully controlled. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function EditUserDialog({ user, trigger, open: controlledOpen, onOpenChange }: Props) {
  const { t } = useTranslation();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (isControlled) onOpenChange?.(next);
    else setUncontrolledOpen(next);
  };
  const [affiliateLinks, setAffiliateLinks] = useState<string[]>(user.affiliateLinks ?? []);
  const update = useUpdateUserMutation();
  const isSeller = user.role === 'seller';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: user.displayName,
      phone: user.phone ?? '',
      language: (user.language as Locale) ?? 'ar',
      sellerCode: user.sellerCode ?? '',
      directCommissionPercentage:
        user.directCommissionPercentage ?? user.commissionPercentage ?? 0,
      networkCommissionPercentage: user.networkCommissionPercentage ?? 0,
      socialMediaLink: user.socialMediaLink ?? '',
    },
  });

  // Re-seed when the dialog opens, in case the user data refreshed underneath.
  useEffect(() => {
    if (open) {
      reset({
        displayName: user.displayName,
        phone: user.phone ?? '',
        language: (user.language as Locale) ?? 'ar',
        sellerCode: user.sellerCode ?? '',
        directCommissionPercentage:
          user.directCommissionPercentage ?? user.commissionPercentage ?? 0,
        networkCommissionPercentage: user.networkCommissionPercentage ?? 0,
        socialMediaLink: user.socialMediaLink ?? '',
      });
      setAffiliateLinks(user.affiliateLinks ?? []);
    }
  }, [open, user, reset]);

  const language = watch('language');

  const onSubmit = handleSubmit(async (values) => {
    const cleanedLinks = affiliateLinks.map((l) => l.trim()).filter(Boolean);
    const initialLinks = user.affiliateLinks ?? [];
    const linksChanged =
      cleanedLinks.length !== initialLinks.length ||
      cleanedLinks.some((l, i) => l !== initialLinks[i]);

    const body: UpdateUserRequest = {
      displayName: values.displayName,
      phone: values.phone || undefined,
      language: values.language,
      socialMediaLink: values.socialMediaLink ?? null,
    };

    if (isSeller) {
      body.sellerCode = values.sellerCode || null;
      if (values.directCommissionPercentage !== undefined) {
        body.directCommissionPercentage = values.directCommissionPercentage;
      }
      if (values.networkCommissionPercentage !== undefined) {
        body.networkCommissionPercentage = values.networkCommissionPercentage;
      }
      if (linksChanged) body.affiliateLinks = cleanedLinks;
    }

    try {
      await update.mutateAsync({ userId: user.id, body });
      toast.success(t('users.actions.userUpdated'));
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
            <Button variant="ghost" size="icon" aria-label={t('users.actions.editUser')}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            {t('users.actions.editUser')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="eu-displayName">{t('users.fields.displayName')}</Label>
              <Input
                id="eu-displayName"
                {...register('displayName')}
                aria-invalid={Boolean(errors.displayName)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eu-phone">{t('common.phone')}</Label>
              <Input id="eu-phone" type="tel" dir="ltr" {...register('phone')} />
            </div>

            <div className="space-y-2">
              <Label>{t('common.language')}</Label>
              <Select
                value={language}
                onValueChange={(v) => setValue('language', v as Locale, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isSeller && (
              <div className="space-y-2">
                <Label htmlFor="eu-sellerCode">{t('users.fields.sellerCode')}</Label>
                <Input id="eu-sellerCode" dir="ltr" {...register('sellerCode')} />
              </div>
            )}

            {isSeller && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="eu-direct">
                    {t('users.fields.directCommissionPercentage')}
                  </Label>
                  <Input
                    id="eu-direct"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    dir="ltr"
                    {...register('directCommissionPercentage')}
                    aria-invalid={Boolean(errors.directCommissionPercentage)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eu-network">
                    {t('users.fields.networkCommissionPercentage')}
                  </Label>
                  <Input
                    id="eu-network"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    dir="ltr"
                    {...register('networkCommissionPercentage')}
                    aria-invalid={Boolean(errors.networkCommissionPercentage)}
                  />
                </div>
              </>
            )}

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="eu-social">{t('users.fields.socialMediaLink')}</Label>
              <Input
                id="eu-social"
                type="url"
                dir="ltr"
                placeholder="https://"
                {...register('socialMediaLink')}
                aria-invalid={Boolean(errors.socialMediaLink)}
              />
            </div>

            {isSeller && (
              <div className="space-y-2 sm:col-span-2">
                <Label>{t('users.fields.affiliateLinks')}</Label>
                <LinksListEditor
                  value={affiliateLinks}
                  onChange={setAffiliateLinks}
                  placeholder="https://"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || update.isPending}>
              {(isSubmitting || update.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
