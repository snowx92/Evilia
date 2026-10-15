'use client';

import { PageHeader } from '@/components/shared/page-header';
import { WithdrawalsToggleCard } from '@/features/system-config/withdrawals-toggle-card';
import { useTranslation } from '@/hooks/use-translation';
import { useAuthStore } from '@/store/auth';

export default function SystemConfigPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = Boolean(user?.isSuperAdmin);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader title={t('systemConfig.title')} description={t('systemConfig.pageDesc')} />
      {isSuperAdmin ? (
        <WithdrawalsToggleCard />
      ) : (
        <p className="text-sm text-muted-foreground">{t('systemConfig.superAdminOnly')}</p>
      )}
    </div>
  );
}
