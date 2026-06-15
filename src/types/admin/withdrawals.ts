import type { PaginationParams } from '@/types/api';
import type { TimestampLike } from '@/lib/utils';

export type WithdrawalStatus = 'pending' | 'approved' | 'paid' | 'rejected' | (string & {});

/** How the seller wants to receive their payout (mirrors seller payload). */
export type WithdrawalPaymentMethod = 'WALLET' | 'IPN' | (string & {});

export type Withdrawal = {
  id: string;
  userId: string;
  amount: number;
  status: WithdrawalStatus;
  requestedAt: TimestampLike;
  reviewedAt?: TimestampLike | null;
  reviewedBy?: string | null;
  paymentReference?: string | null;
  rejectionReason?: string | null;
  /** How the seller asked to be paid. */
  paymentMethod?: WithdrawalPaymentMethod;
  /** Phone number for IPN, wallet number for WALLET, etc. */
  paymentIdentifier?: string;
  itemIndex?: number;
};

export type WithdrawalsListParams = PaginationParams & {
  status?: WithdrawalStatus;
};

export type RejectWithdrawalRequest = { reason: string };
export type PayWithdrawalRequest = { paymentReference: string };
