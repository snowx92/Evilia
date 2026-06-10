'use client';

import { useEffect, useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  usePermissionCatalogQuery,
  useUpdateAdminPermissionsMutation,
} from '@/hooks/queries/use-access';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { toast } from '@/components/ui/sonner';
import { ApiError } from '@/types/api';
import type { AdminUser } from '@/types/admin/access';

export function EditAdminPermissionsDialog({ admin }: { admin: AdminUser }) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [open, setOpen] = useState(false);
  const catalog = usePermissionCatalogQuery();
  const update = useUpdateAdminPermissionsMutation();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (open) setSelected(admin.permissions ?? []);
  }, [open, admin.permissions]);

  const toggle = (k: string) =>
    setSelected((prev) => (prev.includes(k) ? prev.filter((p) => p !== k) : [...prev, k]));

  const onSubmit = async () => {
    try {
      await update.mutateAsync({ adminId: admin.id, body: { permissions: selected } });
      toast.success(t('common.save'));
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Pencil className="h-4 w-4" />
          {t('access.editPermissions')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{admin.displayName}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pe-2">
          <div className="space-y-2">
            {catalog.data?.map((p) => (
              <label
                key={p.key}
                className="flex items-start gap-3 rounded-md border p-3 text-sm hover:bg-accent/40"
              >
                <Checkbox checked={selected.includes(p.key)} onCheckedChange={() => toggle(p.key)} />
                <div className="flex-1">
                  <p className="font-medium">{locale === 'ar' ? p.labelAr || p.label : p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                  <p className="mt-1 text-[10px] font-mono text-muted-foreground/70">
                    {p.group} · {p.key}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onSubmit} disabled={update.isPending}>
            {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
