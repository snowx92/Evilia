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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useCreateUserMutation, useCreateMemberMutation, useUsersQuery } from '@/hooks/queries/use-users';
import { usePermissionCatalogQuery } from '@/hooks/queries/use-access';
import { useTranslation } from '@/hooks/use-translation';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { ApiError } from '@/types/api';
import type { UserRole } from '@/types/auth';

// ─── Create Admin (sub-admin) ────────────────────────────────────────────────

const adminSchema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  isSuperAdmin: z.boolean(),
});
type AdminValues = z.infer<typeof adminSchema>;

export function CreateAdminDialog() {
  const [open, setOpen] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const { t } = useTranslation();
  const catalog = usePermissionCatalogQuery();
  const create = useCreateUserMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: { displayName: '', email: '', password: '', isSuperAdmin: false },
  });

  const isSuperAdmin = watch('isSuperAdmin');

  const onSubmit = handleSubmit(async (values) => {
    try {
      await create.mutateAsync({
        displayName: values.displayName,
        email: values.email,
        password: values.password,
        role: 'sub-admin' as UserRole,
        isSuperAdmin: values.isSuperAdmin,
        permissions,
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
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="a-password">{t('auth.passwordLabel')}</Label>
              <Input id="a-password" type="password" dir="ltr" {...register('password')} />
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

// ─── Create Member (leader / seller) ─────────────────────────────────────────

const memberSchema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(1),
  role: z.enum(['leader', 'seller']),
  sellerCode: z.string().optional(),
  parentId: z.string().optional(),
  commissionPercentage: z.coerce.number().min(0).max(100),
});
type MemberValues = z.infer<typeof memberSchema>;

export function CreateMemberDialog() {
  const [open, setOpen] = useState(false);
  const [parentPopoverOpen, setParentPopoverOpen] = useState(false);
  const [parentSearch, setParentSearch] = useState('');
  const { t } = useTranslation();
  const create = useCreateMemberMutation();
  const usersQuery = useUsersQuery({ page: 1, limit: 100 });
  const users = usersQuery.data?.items ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MemberValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      phone: '',
      role: 'leader',
      sellerCode: '',
      parentId: '',
      commissionPercentage: 0,
    },
  });

  const role = watch('role');
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
      await create.mutateAsync({
        displayName: values.displayName,
        email: values.email,
        password: values.password,
        phone: values.phone,
        role: values.role,
        commissionPercentage: values.commissionPercentage,
        ...(values.role === 'seller' && values.sellerCode ? { sellerCode: values.sellerCode } : {}),
        ...(values.parentId ? { parentId: values.parentId } : { parentId: null }),
      });
      toast.success(t('common.save'));
      setOpen(false);
      reset();
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
            {/* Display name */}
            <div className="space-y-2">
              <Label htmlFor="m-displayName">{t('users.fields.displayName')}</Label>
              <Input
                id="m-displayName"
                {...register('displayName')}
                aria-invalid={Boolean(errors.displayName)}
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label>{t('common.role')}</Label>
              <Select
                value={role}
                onValueChange={(v) => setValue('role', v as 'leader' | 'seller', { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leader">{t('role.leader')}</SelectItem>
                  <SelectItem value="seller">{t('role.seller')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="m-email">{t('common.email')}</Label>
              <Input
                id="m-email"
                type="email"
                dir="ltr"
                {...register('email')}
                aria-invalid={Boolean(errors.email)}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="m-phone">{t('common.phone')}</Label>
              <Input
                id="m-phone"
                type="tel"
                dir="ltr"
                {...register('phone')}
                aria-invalid={Boolean(errors.phone)}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="m-password">{t('auth.passwordLabel')}</Label>
              <Input id="m-password" type="password" dir="ltr" {...register('password')} />
            </div>

            {/* Commission */}
            <div className="space-y-2">
              <Label htmlFor="m-commission">{t('users.fields.commissionPercentage')}</Label>
              <Input
                id="m-commission"
                type="number"
                step="0.01"
                min="0"
                max="100"
                dir="ltr"
                {...register('commissionPercentage')}
                aria-invalid={Boolean(errors.commissionPercentage)}
              />
            </div>

            {/* Seller code — only for seller */}
            {role === 'seller' && (
              <div className="space-y-2">
                <Label htmlFor="m-sellerCode">{t('users.fields.sellerCode')}</Label>
                <Input id="m-sellerCode" dir="ltr" {...register('sellerCode')} />
              </div>
            )}

            {/* Parent (leader/seller) — user dropdown */}
            <div className={cn('space-y-2', role !== 'seller' && 'sm:col-span-2')}>
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
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      value={parentSearch}
                      onValueChange={setParentSearch}
                      placeholder={t('common.search')}
                    />
                    <CommandList>
                      <CommandEmpty>{t('common.noResults')}</CommandEmpty>
                      <CommandGroup>
                        {/* Allow clearing the selection */}
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
