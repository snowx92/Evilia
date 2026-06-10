import type { PaginationParams } from '@/types/api';
import type { TimestampLike } from '@/lib/utils';

export type WalletTransactionType =
  | 'commission'
  | 'bonus'
  | 'withdrawal'
  | 'adjustment'
  | (string & {});

export type WalletTransactionReferenceType =
  | 'sale'
  | 'bonus'
  | 'withdrawal'
  | 'adjustment'
  | (string & {});

export type WalletTransaction = {
  id: string;
  userId: string;
  type: WalletTransactionType;
  amount: number;
  balanceBefore?: number;
  balanceAfter?: number;
  referenceId?: string;
  referenceType?: WalletTransactionReferenceType;
  description?: string;
  createdAt: TimestampLike;
  itemIndex?: number;
};

export type WalletTransactionsParams = PaginationParams;

export type AdjustWalletRequest = {
  amount: number;
  type: string;
  description: string;
};

/* ── Proposed endpoint shapes — see docs/proposed-endpoints.md ────────── */

/** One row in the wallets list — wallet snapshot enriched with user identity. */
export type WalletSnapshot = {
  userId: string;
  displayName: string;
  email: string;
  sellerCode?: string | null;
  role?: string;
  balance: number;
  available: number;
  pendingWithdrawal: number;
  totalEarned: number;
  totalWithdrawn: number;
  updatedAt: TimestampLike;
};

export type WalletsListParams = PaginationParams & {
  search?: string;
  role?: string;
};

export type AllWalletTransactionsParams = PaginationParams & {
  userId?: string;
  type?: WalletTransactionType;
  from?: string;
  to?: string;
};
