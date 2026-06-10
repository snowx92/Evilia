'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { SaleCommission, SaleCommissionRole } from '@/types/admin/sales';

const ROLE_COLOR: Record<string, string> = {
  seller: '#4f46e5',
  leader: '#10b981',
  admin: '#f59e0b',
};

const fallbackColors = ['#a78bfa', '#22d3ee', '#f43f5e', '#84cc16'];

function colorFor(role: SaleCommissionRole, idx: number) {
  return ROLE_COLOR[role] ?? fallbackColors[idx % fallbackColors.length];
}

/**
 * Compact stacked-bar visualisation of how a sale's commissions split across
 * roles. Designed to live inline inside a table cell.
 */
export function CommissionStrip({
  commissions,
  saleAmount,
  className,
}: {
  commissions: SaleCommission[];
  saleAmount: number;
  className?: string;
}) {
  const segments = useMemo(() => {
    // Group by role so a leader chain shows as one segment per role bucket if multiple
    const byRole = new Map<string, { role: SaleCommissionRole; amount: number; count: number }>();
    commissions.forEach((c) => {
      const cur = byRole.get(c.role);
      if (cur) {
        cur.amount += c.amount;
        cur.count += 1;
      } else {
        byRole.set(c.role, { role: c.role, amount: c.amount, count: 1 });
      }
    });
    return Array.from(byRole.values());
  }, [commissions]);

  if (saleAmount <= 0 || segments.length === 0) return null;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="relative flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
        {segments.map((s, i) => {
          const pct = Math.max(0.5, (s.amount / saleAmount) * 100);
          return (
            <div
              key={s.role}
              className="h-full transition-all"
              style={{ width: `${pct}%`, background: colorFor(s.role, i) }}
              aria-hidden="true"
            />
          );
        })}
      </div>
      <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        {segments.map((s, i) => (
          <li key={s.role} className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: colorFor(s.role, i) }}
              aria-hidden="true"
            />
            <span className="font-medium text-foreground">{s.role}</span>
            <span className="text-muted-foreground/80">
              · {((s.amount / saleAmount) * 100).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
