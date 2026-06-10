'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { USER_ROLES, USER_STATUSES } from '@/constants/admin';
import { useTranslation } from '@/hooks/use-translation';
import type { UserRole, UserStatus } from '@/types/auth';

const ALL = '__all__';

export function UsersFilterBar({
  role,
  status,
  onChange,
}: {
  role?: UserRole;
  status?: UserStatus;
  onChange: (next: { role?: UserRole; status?: UserStatus }) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={role ?? ALL}
        onValueChange={(v) => onChange({ role: v === ALL ? undefined : (v as UserRole), status })}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder={t('users.filterByRole')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t('common.all')}</SelectItem>
          {USER_ROLES.map((r) => (
            <SelectItem key={r} value={r}>
              {t(`role.${r}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={status ?? ALL}
        onValueChange={(v) =>
          onChange({ status: v === ALL ? undefined : (v as UserStatus), role })
        }
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder={t('users.filterByStatus')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t('common.all')}</SelectItem>
          {USER_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {t(`status.${s}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(role || status) && (
        <Button variant="ghost" size="sm" onClick={() => onChange({})}>
          {t('common.cancel')}
        </Button>
      )}
    </div>
  );
}
