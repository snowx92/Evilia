import type { PaginationParams } from '@/types/api';
import type { TimestampLike } from '@/lib/utils';

export type WithdrawalStatus = 'pending' | 'approved' | 'paid' | 'rejected' | (string & {});

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
  itemIndex?: number;
};

export type WithdrawalsListParams = PaginationParams & {
  status?: WithdrawalStatus;
};

export type RejectWithdrawalRequest = { reason: string };
export type PayWithdrawalRequest = { paymentReference: string };
