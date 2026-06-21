'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect, useRef } from 'react';
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
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search } from 'lucide-react';
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
              <PasswordInput
                id="a-password"
                dir="ltr"
                showLabel={t('auth.showPassword')}
                hideLabel={t('auth.hidePassword')}
                {...register('password')}
              />
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

  // Debounce the search so we don't fire a request on every keystroke.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(parentSearch), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [parentSearch]);

  // Sellers can be parented under admins or other sellers.
  // When the user types in the picker we pass `search` to the API so we're not
  // limited to the first 100 results (important when there are 100+ sellers).
  const usersQuery = useUsersQuery({ page: 1, limit: 100, ...(debouncedSearch ? { search: debouncedSearch } : {}) });
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
  // We pass `search` to the server, but also fall back to client-side
  // filtering in case the backend doesn't yet support the param.
  const q = parentSearch.trim().toLowerCase();
  const filteredParents = q
    ? users.filter(
        (u) =>
          u.displayName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.sellerCode ?? '').toLowerCase().includes(q),
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
              <PasswordInput
                id="s-password"
                dir="ltr"
                showLabel={t('auth.showPassword')}
                hideLabel={t('auth.hidePassword')}
                {...register('password')}
              />
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
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-col">
                    {/* Search input — plain controlled input, no cmdk to fight with */}
                    <div className="relative border-b border-border/60 p-2">
                      <Search className="pointer-events-none absolute start-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={parentSearch}
                        onChange={(e) => setParentSearch(e.target.value)}
                        placeholder={t('common.search')}
                        className="h-8 ps-7 text-sm"
                        autoFocus
                      />
                    </div>
                    {/* Scrollable list. Wheel/touch are stopped above so the
                        outer Dialog never steals scroll. */}
                    <div
                      className="max-h-[260px] overflow-y-auto overscroll-contain p-1"
                      role="listbox"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setValue('parentId', '', { shouldValidate: true });
                          setParentPopoverOpen(false);
                          setParentSearch('');
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                      >
                        <Check
                          className={cn(
                            'h-4 w-4 shrink-0',
                            !parentId ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        <span className="text-muted-foreground">{t('common.none')}</span>
                      </button>
                      {usersQuery.isLoading ? (
                        <div className="grid place-items-center py-6 text-xs text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : filteredParents.length === 0 ? (
                        <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                          {t('common.noResults')}
                        </div>
                      ) : (
                        filteredParents.map((u) => (
                          <button
                            type="button"
                            key={u.id}
                            onClick={() => {
                              setValue('parentId', u.id, { shouldValidate: true });
                              setParentPopoverOpen(false);
                              setParentSearch('');
                            }}
                            className={cn(
                              'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent',
                              parentId === u.id && 'bg-primary-soft/40',
                            )}
                          >
                            <Check
                              className={cn(
                                'h-4 w-4 shrink-0',
                                parentId === u.id ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            <div className="flex min-w-0 flex-col text-start">
                              <span className="truncate text-sm">{u.displayName}</span>
                              <span className="truncate text-[11px] text-muted-foreground">
                                {u.email}
                                {u.sellerCode ? ` · ${u.sellerCode}` : ''}
                              </span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
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
