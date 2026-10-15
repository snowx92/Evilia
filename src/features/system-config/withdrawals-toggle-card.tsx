'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/sonner';
import {
  useSystemConfigQuery,
  useUpdateSystemConfigMutation,
} from '@/hooks/queries/use-system-config';
import { useTranslation } from '@/hooks/use-translation';
import { ApiError } from '@/types/api';

export function WithdrawalsToggleCard() {
  const { t } = useTranslation();
  const query = useSystemConfigQuery();
  const update = useUpdateSystemConfigMutation();
  // `null` = no local edit yet; fall back to the server value.
  const [draft, setDraft] = useState<boolean | null>(null);

  const serverValue = query.data?.withdrawalsEnabled ?? true;
  const enabled = draft ?? serverValue;
  const dirty = draft !== null && draft !== serverValue;

  const onSave = async () => {
    try {
      await update.mutateAsync({ withdrawalsEnabled: enabled });
      setDraft(null);
      toast.success(t('systemConfig.saved'));
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('systemConfig.withdrawals.title')}</CardTitle>
        <CardDescription>{t('systemConfig.withdrawals.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {query.isError ? (
          <div className="flex items-center gap-3 text-sm text-destructive">
            {t('common.error')}
            <Button variant="outline" size="sm" onClick={() => query.refetch()}>
              {t('common.tryAgain')}
            </Button>
          </div>
        ) : (
          <>
            <label className="flex items-start gap-3 rounded-md border p-3 text-sm hover:bg-accent/40">
              <Checkbox
                checked={enabled}
                disabled={query.isLoading || update.isPending}
                onCheckedChange={(v) => setDraft(Boolean(v))}
              />
              <div className="space-y-0.5">
                <p className="font-medium">{t('systemConfig.withdrawals.enabledLabel')}</p>
                <p className="text-xs text-muted-foreground">
                  {enabled
                    ? t('systemConfig.withdrawals.enabledHint')
                    : t('systemConfig.withdrawals.disabledHint')}
                </p>
              </div>
            </label>
            <div className="flex justify-end">
              <Button onClick={onSave} disabled={!dirty || update.isPending}>
                {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t('common.save')}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
