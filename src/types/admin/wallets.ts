// Source of truth: Postman collection (Admins / Admin — Wallets).

import type { PaginationParams } from '@/types/api';
import type { TimestampLike } from '@/lib/utils';
import type { Wallet } from '@/types/auth';

// ─── /v1/admin/wallets/summary ───────────────────────────────────────────────

export type WalletsSummary = {
  totalBalance: number;
  totalPendingWithdrawal: number;
  /** Aggregate of all wallets' ongoing-orders balance. API-optional for back-compat. */
  totalOnGoingOrdersBalance?: number;
  totalEarned: number;
  totalWithdrawn: number;
  walletCount: number;
};

// ─── /v1/admin/wallets (list) ────────────────────────────────────────────────

/** User identity returned alongside each wallet in the list. */
export type WalletListUser = {
  id: string;
  displayName: string;
  email: string;
  sellerCode?: string | null;
  role?: string;
  status?: string;
  profileImageUrl?: string | null;
};

/** One row in the paginated wallets list. */
export type WalletListRow = {
  user: WalletListUser;
  wallet: Wallet;
};

export type WalletsListParams = PaginationParams & {
  role?: string;
  status?: string;
  search?: string;
};

// ─── /v1/admin/wallets/{userId}/transactions ─────────────────────────────────

export type WalletTransactionType =
  | 'commission'
  | 'bonus'
  | 'withdrawal'
  | 'adjustment'
  | (string & {});

export type WalletTransactionReferenceType =
  | 'sale'
  | 'commission'
  | 'bonus'
  | 'withdrawal'
  | 'adjustment'
  | (string & {});

export type WalletTransaction = {
  id: string;
  /** Server omits userId on the per-user transactions endpoint. */
  userId?: string;
  type: WalletTransactionType;
  amount: number;
  balanceBefore?: number;
  balanceAfter?: number;
  referenceId?: string;
  referenceType?: WalletTransactionReferenceType;
  description?: string;
  createdAt: TimestampLike;
};

export type WalletTransactionsParams = PaginationParams;

// ─── POST /v1/admin/wallets/reset ────────────────────────────────────────────

export type ResetWalletRequest = {
  password: string;
  /** Omit to reset ALL wallets. */
  userId?: string;
};

// ─── POST /v1/admin/wallets/{userId}/adjust ──────────────────────────────────

export type AdjustWalletType = 'bonus' | 'adjustment';

export type AdjustWalletRequest = {
  /** Positive credits the wallet, negative debits it. */
  amount: number;
  type: AdjustWalletType;
  description: string;
};
