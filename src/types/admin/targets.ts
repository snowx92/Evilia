import type { PaginationParams } from '@/types/api';
import type { TimestampLike } from '@/lib/utils';

export type TargetType = 'personal' | 'network' | (string & {});
export type TargetStatus = 'active' | 'achieved' | 'expired' | (string & {});

export type Target = {
  id: string;
  type: TargetType;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  status: TargetStatus;
  startDate?: TimestampLike;
  endDate?: TimestampLike;
};

export type TargetsListParams = PaginationParams;

export type CreateTargetRequest = {
  type: TargetType;
  userId: string;
  title: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
};

export type UpdateTargetRequest = {
  title?: string;
  targetAmount?: number;
};
