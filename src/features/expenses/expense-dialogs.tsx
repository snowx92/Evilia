'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Pencil } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCreateExpenseCategoryMutation,
  useCreateExpenseMutation,
  useExpenseCategoriesQuery,
  useUpdateExpenseMutation,
} from '@/hooks/queries/use-expenses';
import { useTranslation } from '@/hooks/use-translation';
import { toast } from '@/components/ui/sonner';
import { ApiError } from '@/types/api';
import type { Expense } from '@/types/admin/expenses';

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});
type CategoryValues = z.infer<typeof categorySchema>;

export function CreateCategoryDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const create = useCreateExpenseCategoryMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await create.mutateAsync(values);
      toast.success(t('common.save'));
      setOpen(false);
      reset();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4" />
          {t('expenses.createCategory')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('expenses.createCategory')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3" noValidate>
          <div className="space-y-2">
            <Label>{t('common.name')}</Label>
            <Input {...register('name')} />
          </div>
          <div className="space-y-2">
            <Label>{t('common.description')}</Label>
            <Textarea {...register('description')} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
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

const createSchema = z.object({
  title: z.string().min(1),
  amount: z.coerce.number().positive(),
  categoryId: z.string().min(1),
  date: z.string().min(1),
  notes: z.string().default(''),
});
type CreateValues = z.infer<typeof createSchema>;

export function CreateExpenseDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const categories = useExpenseCategoriesQuery();
  const create = useCreateExpenseMutation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { title: '', amount: 0, categoryId: '', date: '', notes: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await create.mutateAsync({ ...values, attachments: [] });
      toast.success(t('common.save'));
      setOpen(false);
      reset();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          {t('expenses.create')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('expenses.create')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3" noValidate>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>{t('expenses.fields.title')}</Label>
              <Input {...register('title')} />
            </div>
            <div className="space-y-2">
              <Label>{t('expenses.fields.amount')}</Label>
              <Input type="number" step="0.01" dir="ltr" {...register('amount')} />
            </div>
            <div className="space-y-2">
              <Label>{t('expenses.fields.category')}</Label>
              <Select
                value={watch('categoryId')}
                onValueChange={(v) => setValue('categoryId', v, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  {categories.data?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('expenses.fields.date')}</Label>
              <Input type="date" dir="ltr" {...register('date')} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t('expenses.fields.notes')}</Label>
              <Textarea {...register('notes')} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
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
  amount: z.coerce.number().positive(),
});
type UpdateValues = z.infer<typeof updateSchema>;

export function EditExpenseDialog({ expense }: { expense: Expense }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const update = useUpdateExpenseMutation();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<UpdateValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: { title: expense.title, amount: expense.amount },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await update.mutateAsync({ id: expense.id, body: values });
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
            <Label>{t('expenses.fields.title')}</Label>
            <Input {...register('title')} />
          </div>
          <div className="space-y-2">
            <Label>{t('expenses.fields.amount')}</Label>
            <Input type="number" step="0.01" dir="ltr" {...register('amount')} />
          </div>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
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
