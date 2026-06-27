'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, ChevronsUpDown, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  useCreateTargetMutation,
  useDeleteTargetMutation,
  useUpdateTargetMutation,
} from '@/hooks/queries/use-targets';
import { useUsersQuery } from '@/hooks/queries/use-users';
import { useTranslation } from '@/hooks/use-translation';
import { toast } from '@/components/ui/sonner';
import { TARGET_TYPES } from '@/constants/admin';
import { ApiError } from '@/types/api';
import { cn } from '@/lib/utils';
import type { Target } from '@/types/admin/targets';

const createSchema = z.object({
  type: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().min(1),
  targetAmount: z.coerce.number().positive(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});
type CreateValues = z.infer<typeof createSchema>;

export function CreateTargetDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const create = useCreateTargetMutation();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(userSearch), 300);
    return () => clearTimeout(t);
  }, [userSearch]);

  const usersQuery = useUsersQuery({
    page: 1,
    limit: 50,
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
  });
  const users = usersQuery.data?.items ?? [];
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      type: 'personal',
      userId: '',
      title: '',
      targetAmount: 0,
      startDate: '',
      endDate: '',
    },
  });

  const selectedUserId = watch('userId');
  const selectedUser = users.find((u) => u.id === selectedUserId);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await create.mutateAsync(values);
      toast.success(t('common.save'));
      setOpen(false);
      reset();
      setUserSearch('');
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          {t('targets.create')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('targets.create')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3" noValidate>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('targets.fields.type')}</Label>
              <Select value={watch('type')} onValueChange={(v) => setValue('type', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_TYPES.map((tp) => (
                    <SelectItem key={tp} value={tp}>
                      {tp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('targets.fields.userId')}</Label>
              <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-invalid={Boolean(errors.userId)}
                    className={cn(
                      'w-full justify-between font-normal',
                      !selectedUser && 'text-muted-foreground',
                      errors.userId && 'border-destructive',
                    )}
                  >
                    <span className="truncate">
                      {selectedUser ? selectedUser.displayName : t('targets.fields.selectUser')}
                    </span>
                    <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  {/* Search input */}
                  <div className="flex items-center gap-2 border-b border-border/70 px-3">
                    <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder={t('common.search')}
                      className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                    />
                    {usersQuery.isFetching && (
                      <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {/* Scrollable list */}
                  <div className="max-h-52 overflow-y-auto p-1">
                    {!usersQuery.isFetching && users.length === 0 && (
                      <p className="py-6 text-center text-xs text-muted-foreground">
                        {t('common.noResults')}
                      </p>
                    )}
                    {users.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setValue('userId', u.id, { shouldValidate: true });
                          setUserPopoverOpen(false);
                          setUserSearch('');
                          setDebouncedSearch('');
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-start text-sm transition-colors hover:bg-primary-soft hover:text-accent-foreground"
                      >
                        <Check
                          className={cn(
                            'h-4 w-4 shrink-0',
                            selectedUserId === u.id ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate font-medium">{u.displayName}</span>
                          <span className="truncate text-[11px] text-muted-foreground">
                            {u.email}
                            {u.sellerCode && (
                              <span className="ms-1 font-mono text-primary/70">
                                #{u.sellerCode}
                              </span>
                            )}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t('targets.fields.title')}</Label>
              <Input {...register('title')} />
            </div>
            <div className="space-y-2">
              <Label>{t('targets.fields.targetAmount')}</Label>
              <Input type="number" step="0.01" dir="ltr" {...register('targetAmount')} />
            </div>
            <div className="space-y-2">
              <Label>{t('targets.fields.startDate')}</Label>
              <Input type="date" dir="ltr" {...register('startDate')} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t('targets.fields.endDate')}</Label>
              <Input type="date" dir="ltr" {...register('endDate')} />
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

const updateSchema = z.object({
  title: z.string().min(1),
  targetAmount: z.coerce.number().positive(),
});
type UpdateValues = z.infer<typeof updateSchema>;

export function EditTargetDialog({ target }: { target: Target }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const update = useUpdateTargetMutation();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<UpdateValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: { title: target.title, targetAmount: target.targetAmount },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await update.mutateAsync({ id: target.id, body: values });
      toast.success(t('common.save'));
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('common.edit')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3" noValidate>
          <div className="space-y-2">
            <Label>{t('targets.fields.title')}</Label>
            <Input {...register('title')} />
          </div>
          <div className="space-y-2">
            <Label>{t('targets.fields.targetAmount')}</Label>
            <Input type="number" step="0.01" dir="ltr" {...register('targetAmount')} />
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

export function DeleteTargetButton({ target }: { target: Target }) {
  const { t } = useTranslation();
  const remove = useDeleteTargetMutation();
  const onClick = async () => {
    if (!window.confirm(t('targets.confirmDelete'))) return;
    try {
      await remove.mutateAsync(target.id);
      toast.success(t('common.save'));
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={remove.isPending}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      aria-label={t('common.delete')}
    >
      {remove.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
