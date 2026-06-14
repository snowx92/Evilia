'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Loader2, UserPlus, ShieldPlus, ChevronsUpDown, Check } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { LinksListEditor } from '@/components/shared/links-list-editor';
import {
  useCreateAdminMutation,
  useCreateSellerMutation,
  useUsersQuery,
} from '@/hooks/queries/use-users';
import { usePermissionCatalogQuery } from '@/hooks/queries/use-access';
import { useTranslation } from '@/hooks/use-translation';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { ApiError } from '@/types/api';

// ─── Create Admin ────────────────────────────────────────────────────────────

const adminSchema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  isSuperAdmin: z.boolean(),
  socialMediaLink: z
    .string()
    .url()
    .optional()
    .or(z.literal('').transform(() => undefined)),
});
type AdminValues = z.infer<typeof adminSchema>;

export function CreateAdminDialog() {
  const [open, setOpen] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const { t } = useTranslation();
  const catalog = usePermissionCatalogQuery();
  const create = useCreateAdminMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      isSuperAdmin: false,
      socialMediaLink: '',
    },
  });

  const isSuperAdmin = watch('isSuperAdmin');

  const onSubmit = handleSubmit(async (values) => {
    try {
      await create.mutateAsync({
        displayName: values.displayName,
        email: values.email,
        password: values.password,
        role: 'admin',
        isSuperAdmin: values.isSuperAdmin,
        permissions,
        ...(values.socialMediaLink ? { socialMediaLink: values.socialMediaLink } : {}),
      });
      toast.success(t('common.save'));
      setOpen(false);
      reset();
      setPermissions([]);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  });

  const togglePermission = (key: string) =>
    setPermissions((prev) => (prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ShieldPlus className="h-4 w-4" />
          {t('users.createSubAdmin')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('users.createSubAdmin')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="a-displayName">{t('users.fields.displayName')}</Label>
              <Input
                id="a-displayName"
                {...register('displayName')}
                aria-invalid={Boolean(errors.displayName)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-email">{t('common.email')}</Label>
              <Input
                id="a-email"
                type="email"
                dir="ltr"
                {...register('email')}
                aria-invalid={Boolean(errors.email)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-password">{t('auth.passwordLabel')}</Label>
              <Input id="a-password" type="password" dir="ltr" {...register('password')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-social">{t('users.fields.socialMediaLink')}</Label>
              <Input
                id="a-social"
                type="url"
                dir="ltr"
                placeholder="https://"
                {...register('socialMediaLink')}
                aria-invalid={Boolean(errors.socialMediaLink)}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={isSuperAdmin}
              onCheckedChange={(v) => setValue('isSuperAdmin', Boolean(v), { shouldDirty: true })}
            />
            {t('users.fields.isSuperAdmin')}
          </label>

          {!isSuperAdmin && catalog.data && (
            <div className="space-y-2">
              <Label>{t('users.fields.permissions')}</Label>
              <div className="grid max-h-52 grid-cols-1 gap-2 overflow-auto rounded-xl border border-border/70 p-3 sm:grid-cols-2">
                {catalog.data.map((p) => (
                  <label key={p.key} className="flex items-start gap-2 text-xs">
                    <Checkbox
                      checked={permissions.includes(p.key)}
                      onCheckedChange={() => togglePermission(p.key)}
                    />
                    <span>
                      <span className="font-medium">{p.labelAr || p.label}</span>
                      <span className="block text-muted-foreground">{p.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || create.isPending}>
              {(isSubmitting || create.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Create Seller ───────────────────────────────────────────────────────────

const sellerSchema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(1),
  sellerCode: z.string().optional(),
  parentId: z.string().optional(),
  directCommissionPercentage: z.coerce.number().min(0).max(100),
  networkCommissionPercentage: z.coerce.number().min(0).max(100),
  socialMediaLink: z
    .string()
    .url()
    .optional()
    .or(z.literal('').transform(() => undefined)),
});
type SellerValues = z.infer<typeof sellerSchema>;

export function CreateSellerDialog() {
  const [open, setOpen] = useState(false);
  const [parentPopoverOpen, setParentPopoverOpen] = useState(false);
  const [parentSearch, setParentSearch] = useState('');
  const [affiliateLinks, setAffiliateLinks] = useState<string[]>([]);
  const { t } = useTranslation();
  const create = useCreateSellerMutation();
  // Sellers can be parented under admins or other sellers.
  const usersQuery = useUsersQuery({ page: 1, limit: 100 });
  const users = usersQuery.data?.items ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SellerValues>({
    resolver: zodResolver(sellerSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      phone: '',
      sellerCode: '',
      parentId: '',
      directCommissionPercentage: 0,
      networkCommissionPercentage: 0,
      socialMediaLink: '',
    },
  });

  const parentId = watch('parentId');
  const selectedParent = users.find((u) => u.id === parentId);
  const filteredParents = parentSearch
    ? users.filter(
        (u) =>
          u.displayName.toLowerCase().includes(parentSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(parentSearch.toLowerCase()),
      )
    : users;

  const onSubmit = handleSubmit(async (values) => {
    try {
      const cleanedLinks = affiliateLinks.map((l) => l.trim()).filter(Boolean);
      await create.mutateAsync({
        displayName: values.displayName,
        email: values.email,
        password: values.password,
        phone: values.phone,
        role: 'seller',
        directCommissionPercentage: values.directCommissionPercentage,
        networkCommissionPercentage: values.networkCommissionPercentage,
        ...(values.sellerCode ? { sellerCode: values.sellerCode } : {}),
        ...(values.parentId ? { parentId: values.parentId } : { parentId: null }),
        ...(values.socialMediaLink ? { socialMediaLink: values.socialMediaLink } : {}),
        ...(cleanedLinks.length ? { affiliateLinks: cleanedLinks } : {}),
      });
      toast.success(t('common.save'));
      setOpen(false);
      reset();
      setAffiliateLinks([]);
      setParentSearch('');
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4" />
          {t('users.create')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('users.create')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="s-displayName">{t('users.fields.displayName')}</Label>
              <Input
                id="s-displayName"
                {...register('displayName')}
                aria-invalid={Boolean(errors.displayName)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="s-email">{t('common.email')}</Label>
              <Input
                id="s-email"
                type="email"
                dir="ltr"
                {...register('email')}
                aria-invalid={Boolean(errors.email)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="s-phone">{t('common.phone')}</Label>
              <Input
                id="s-phone"
                type="tel"
                dir="ltr"
                {...register('phone')}
                aria-invalid={Boolean(errors.phone)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="s-password">{t('auth.passwordLabel')}</Label>
              <Input id="s-password" type="password" dir="ltr" {...register('password')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="s-sellerCode">{t('users.fields.sellerCode')}</Label>
              <Input id="s-sellerCode" dir="ltr" {...register('sellerCode')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="s-direct-commission">
                {t('users.fields.directCommissionPercentage')}
              </Label>
              <Input
                id="s-direct-commission"
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
              <Label htmlFor="s-network-commission">
                {t('users.fields.networkCommissionPercentage')}
              </Label>
              <Input
                id="s-network-commission"
                type="number"
                step="0.01"
                min="0"
                max="100"
                dir="ltr"
                {...register('networkCommissionPercentage')}
                aria-invalid={Boolean(errors.networkCommissionPercentage)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="s-social">{t('users.fields.socialMediaLink')}</Label>
              <Input
                id="s-social"
                type="url"
                dir="ltr"
                placeholder="https://"
                {...register('socialMediaLink')}
                aria-invalid={Boolean(errors.socialMediaLink)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>{t('users.fields.affiliateLinks')}</Label>
              <LinksListEditor
                value={affiliateLinks}
                onChange={setAffiliateLinks}
                placeholder="https://"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>{t('users.fields.parentId')}</Label>
              <Popover open={parentPopoverOpen} onOpenChange={setParentPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    className={cn(
                      'w-full justify-between font-normal',
                      !selectedParent && 'text-muted-foreground',
                    )}
                  >
                    <span className="truncate">
                      {selectedParent ? selectedParent.displayName : t('users.fields.selectParent')}
                    </span>
                    <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="z-[60] w-[--radix-popover-trigger-width] p-0"
                  align="start"
                  side="bottom"
                  sideOffset={4}
                  collisionPadding={16}
                >
                  <Command shouldFilter={false}>
                    <CommandInput
                      value={parentSearch}
                      onValueChange={setParentSearch}
                      placeholder={t('common.search')}
                    />
                    <CommandList className="max-h-[260px] overflow-y-auto overscroll-contain">
                      <CommandEmpty>{t('common.noResults')}</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value=""
                          onSelect={() => {
                            setValue('parentId', '', { shouldValidate: true });
                            setParentPopoverOpen(false);
                            setParentSearch('');
                          }}
                        >
                          <Check
                            className={cn(
                              'h-4 w-4 shrink-0',
                              !parentId ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          <span className="text-muted-foreground">{t('common.none')}</span>
                        </CommandItem>
                        {filteredParents.map((u) => (
                          <CommandItem
                            key={u.id}
                            value={u.id}
                            onSelect={() => {
                              setValue('parentId', u.id, { shouldValidate: true });
                              setParentPopoverOpen(false);
                              setParentSearch('');
                            }}
                          >
                            <Check
                              className={cn(
                                'h-4 w-4 shrink-0',
                                parentId === u.id ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate text-sm">{u.displayName}</span>
                              <span className="truncate text-[11px] text-muted-foreground">
                                {u.email}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || create.isPending}>
              {(isSubmitting || create.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
