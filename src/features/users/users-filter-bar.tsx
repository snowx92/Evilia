'use client';

import { ArrowDownAZ, ArrowUpAZ, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { USER_ROLES, USER_STATUSES } from '@/constants/admin';
import { useTranslation } from '@/hooks/use-translation';
import type { UserRole, UserStatus } from '@/types/auth';
import type { UserSortBy } from '@/types/admin/users';

const ALL = '__all__';

const SORT_OPTIONS: UserSortBy[] = [
  'createdAt',
  'updatedAt',
  'displayName',
  'email',
  'sellerCode',
  'lastActive',
  'status',
];

export type UsersFilters = {
  role?: UserRole;
  status?: UserStatus;
  sellerCode?: string;
  sortBy?: UserSortBy;
  sortDir?: 'asc' | 'desc';
};

export function UsersFilterBar({
  filters,
  onChange,
}: {
  filters: UsersFilters;
  onChange: (next: UsersFilters) => void;
}) {
  const { t } = useTranslation();
  const { role, status, sellerCode, sortBy, sortDir } = filters;

  const set = (patch: Partial<UsersFilters>) => onChange({ ...filters, ...patch });

  const hasActiveFilters = role || status || sellerCode || sortBy || sortDir;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Role */}
      <Select
        value={role ?? ALL}
        onValueChange={(v) => set({ role: v === ALL ? undefined : (v as UserRole) })}
      >
        <SelectTrigger className="w-36">
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

      {/* Status */}
      <Select
        value={status ?? ALL}
        onValueChange={(v) => set({ status: v === ALL ? undefined : (v as UserStatus) })}
      >
        <SelectTrigger className="w-36">
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

      {/* Seller code exact match */}
      <Input
        value={sellerCode ?? ''}
        onChange={(e) => set({ sellerCode: e.target.value || undefined })}
        placeholder={t('users.filterBySellerCode')}
        className="w-36"
      />

      {/* Sort field */}
      <Select
        value={sortBy ?? ALL}
        onValueChange={(v) => set({ sortBy: v === ALL ? undefined : (v as UserSortBy) })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder={t('users.sortBy')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t('users.sortBy')}</SelectItem>
          {SORT_OPTIONS.map((s) => (
            <SelectItem key={s} value={s}>
              {t(`users.sortByOptions.${s}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort direction — only shown when sortBy is active */}
      {sortBy && (
        <Button
          variant="outline"
          size="icon"
          aria-label={sortDir === 'asc' ? t('users.sortDir.asc') : t('users.sortDir.desc')}
          onClick={() => set({ sortDir: sortDir === 'asc' ? 'desc' : 'asc' })}
          title={sortDir === 'asc' ? t('users.sortDir.asc') : t('users.sortDir.desc')}
        >
          {sortDir === 'asc' ? (
            <ArrowUpAZ className="h-4 w-4" />
          ) : (
            <ArrowDownAZ className="h-4 w-4" />
          )}
        </Button>
      )}

      {/* Clear all */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={() => onChange({})}>
          <X className="h-3.5 w-3.5" />
          {t('common.cancel')}
        </Button>
      )}
    </div>
  );
}
