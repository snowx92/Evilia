'use client';

import { Avatar, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency, formatPercent } from '@/lib/utils';
import type { Sale } from '@/types/admin/sales';

const ROLE_BADGE: Record<string, 'brand' | 'success' | 'warning' | 'muted'> = {
  seller: 'brand',
  leader: 'success',
  admin: 'warning',
};

export function CommissionBreakdown({ sale }: { sale: Sale }) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const total = sale.commissions.reduce((acc, c) => acc + c.amount, 0);

  return (
    <div className="rounded-xl border border-border/70 bg-surface p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t('commissions.title')}
        </p>
        <p className="text-xs text-muted-foreground">
          {sale.commissions.length} {t('commissions.title')}
        </p>
      </div>
      <ul className="space-y-2.5">
        {sale.commissions.map((c, idx) => {
          const share = total > 0 ? (c.amount / total) * 100 : 0;
          return (
            <li key={`${c.userId}-${idx}`} className="space-y-1">
              <div className="flex items-center gap-3">
                <Avatar className="h-7 w-7">
                  <AvatarFallback>{getInitials(c.userId)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate font-mono text-xs">{c.userId}</span>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant={ROLE_BADGE[c.role] ?? 'outline'}
                      className="h-4 px-1.5 text-[9px]"
                    >
                      {c.role}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {formatPercent(c.percentage, locale)}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {formatCurrency(c.amount, locale, sale.currency)}
                </span>
              </div>
              <div className="ms-10 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand-gradient"
                  style={{ width: `${Math.max(4, share)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-sm">
        <span className="font-medium">{t('common.amount')}</span>
        <span className="font-semibold tabular-nums">
          {formatCurrency(total, locale, sale.currency)}
        </span>
      </div>
    </div>
  );
}
