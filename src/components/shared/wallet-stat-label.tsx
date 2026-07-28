'use client';

import { ExplainLabel } from '@/components/shared/explain-label';

export type WalletStatKey =
  | 'balance'
  | 'available'
  | 'pendingWithdrawal'
  | 'onGoingOrders'
  | 'totalEarned'
  | 'totalWithdrawn';

/**
 * Wallet-stat label with the shared explain tooltip.
 * `nameKey` lets callers map a non-standard label key onto the canonical
 * explanation (e.g. `onGoingOrdersBalance` → `onGoingOrders`).
 */
export function WalletStatLabel({
  stat,
  nameKey,
  className,
}: {
  stat: WalletStatKey;
  nameKey?: string;
  className?: string;
}) {
  return (
    <ExplainLabel
      labelKey={`wallets.${nameKey ?? stat}`}
      explainKey={`wallets.explain.${stat}`}
      className={className}
    />
  );
}
