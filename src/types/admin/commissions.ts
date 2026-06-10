import type { PaginationParams } from '@/types/api';
import type { TimestampLike } from '@/lib/utils';

export type CommissionStatus =
  | 'pending'
  | 'credited'
  | 'paid'
  | 'cancelled'
  | (string & {});

export type Commission = {
  id: string;
  saleId: string;
  recipientId: string;
  recipientRole: string;
  amount: number;
  percentage: number;
  saleAmount: number;
  status: CommissionStatus;
  createdAt: TimestampLike;
  itemIndex?: number;
};

export type CommissionsListParams = PaginationParams;
