'use client';

import { useState } from 'react';
import { Loader2, ArrowLeftRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UserPicker } from '@/components/shared/user-picker';
import { useReassignParentMutation } from '@/hooks/queries/use-hierarchy';
import { useTranslation } from '@/hooks/use-translation';
import { toast } from '@/components/ui/sonner';
import { ApiError } from '@/types/api';
import type { User } from '@/types/auth';

export function ReassignParentDialog({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [parent, setParent] = useState<User | null>(null);
  const reassign = useReassignParentMutation();

  const onSubmit = async () => {
    if (!parent) return;
    try {
      await reassign.mutateAsync({ userId, body: { parentId: parent.id } });
      toast.success(t('common.save'));
      setOpen(false);
      setParent(null);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7" title={t('hierarchy.reassign')}>
          <ArrowLeftRight className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('hierarchy.reassign')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label>{t('hierarchy.newParent')}</Label>
          <UserPicker value={parent} onChange={setParent} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onSubmit} disabled={reassign.isPending || !parent}>
            {reassign.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
