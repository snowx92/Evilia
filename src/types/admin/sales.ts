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
 */
export type Sale = {
  id: string;
  externalId: string;
  source: string;
  sellerId: string;
  sellerCode: string;
  amount: number;
  /** ISO-4217 code (e.g. "SAR", "EGP", "USD"). Drives currency formatting on the row. */
  currency: string;
  commissions: SaleCommission[];
  status: SaleStatus;
  importedAt: TimestampLike;
  processedAt: TimestampLike;
  metadata?: Record<string, unknown>;
  itemIndex?: number;
};

export type SalesListParams = PaginationParams & {
  status?: SaleStatus;
};
