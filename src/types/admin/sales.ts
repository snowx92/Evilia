import type { PaginationParams } from '@/types/api';
import type { TimestampLike } from '@/lib/utils';

export type SaleStatus =
  | 'pending'
  | 'processing'
  | 'delivered'
  | 'failed'
  | 'deleted'
  | (string & {});
export type SaleCommissionRole = 'seller' | 'admin' | (string & {});

export type SaleCommission = {
  userId: string;
  role: SaleCommissionRole;
  /** 0–100 */
  percentage: number;
  /** in the sale's `currency` */
  amount: number;
};

/**
 * Real shape returned by `GET /v1/admin/sales`. Anything not listed in the
 * docs is left optional so the UI degrades gracefully across environments.
 *
 * NOTE: the API stopped emitting `metadata` for new sales — the rich
 * customer/products/UTM block is gone. Newer fields (`paymentType`,
 * `deliveredAt`, `commissionsCreditedAt`) replace what used to live there.
 * `sellerId` is also sometimes omitted for unmatched seller codes.
 */
export type Sale = {
  id: string;
  externalId: string;
  source: string;
  /** May be absent when the upstream couldn't match the sellerCode to a user. */
  sellerId?: string;
  sellerCode: string;
  amount: number;
  /** ISO-4217 code (e.g. "SAR", "EGP", "USD"). Drives currency formatting on the row. */
  currency: string;
  /** Top-level payment method — present even when `metadata.payment` isn't. */
  paymentType?: string | null;
  /** Defaults to `[]` so UI consumers can safely call array methods. */
  commissions: SaleCommission[];
  status: SaleStatus;
  importedAt: TimestampLike;
  processedAt?: TimestampLike | null;
  /** Set once the order reaches delivered status. */
  deliveredAt?: TimestampLike | null;
  /** Set when the commission line crediting actually ran on the wallet. */
  commissionsCreditedAt?: TimestampLike | null;
  metadata?: Record<string, unknown>;
  itemIndex?: number;
};

export type SalesListParams = PaginationParams & {
  status?: SaleStatus;
  /** Filter by seller user ID — maps to `sellerId` query param. */
  sellerId?: string;
};
