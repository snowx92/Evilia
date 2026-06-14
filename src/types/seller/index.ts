// Source of truth: seller OpenAPI spec (Evilla Commission Platform).
// Matches request/response shapes byte-for-byte with the `/v1/sellers/*` routes.

import type { User, Wallet } from '@/types/auth';
import type { PaginationParams } from '@/types/api';
import type { TimestampLike } from '@/lib/utils';
import type { WithdrawalStatus } from '@/types/admin/withdrawals';

// ─── /v1/sellers/network ─────────────────────────────────────────────────────

/** Flat list of every user in this seller's downline. Same shape as the User. */
export type SellerNetworkMember = User;

// ─── /v1/sellers/network/tree ────────────────────────────────────────────────

/** Recursive minimal-shape tree rooted at this seller. */
export type SellerNetworkTreeNode = {
  id: string;
  displayName: string;
  /** API omits `children` for leaf nodes — treat absence as empty. */
  children?: SellerNetworkTreeNode[];
};

// ─── /v1/sellers/network/revenue ─────────────────────────────────────────────

export type SellerNetworkRevenue = {
  /** YYYY-MM */
  month: string;
  salesTotal: number;
  commissionTotal: number;
};

// ─── /v1/sellers/network/commissions ─────────────────────────────────────────

export type SellerNetworkCommission = {
  id: string;
  amount: number;
  saleId: string;
  createdAt: TimestampLike;
};

// ─── /v1/sellers/sales ───────────────────────────────────────────────────────

export type SellerSale = {
  id: string;
  externalId: string;
  amount: number;
  /** ISO-4217 (e.g. "OMR", "EGP", "USD"). */
  currency: string;
};

// ─── /v1/sellers/commissions ─────────────────────────────────────────────────

export type SellerCommission = {
  id: string;
  /** Commission amount earned. */
  amount: number;
  /** 0-100 percentage that produced the amount. */
  percentage: number;
  /** The originating sale's gross amount. */
  saleAmount: number;
};

// ─── /v1/sellers/wallet ──────────────────────────────────────────────────────

export type SellerWallet = Wallet;

// ─── /v1/sellers/wallet/transactions ─────────────────────────────────────────

export type SellerWalletTransaction = {
  id: string;
  /** commission | bonus | adjustment | withdrawal — see API enum. */
  type: string;
  amount: number;
};

// ─── /v1/sellers/withdrawals ─────────────────────────────────────────────────

export type SellerWithdrawal = {
  id: string;
  amount: number;
  status: WithdrawalStatus;
};

export type RequestWithdrawalRequest = {
  amount: number;
};

// ─── Shared pagination param type ────────────────────────────────────────────

export type SellerPaginationParams = PaginationParams;
