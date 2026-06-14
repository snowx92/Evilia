import type { UserRole, UserStatus } from '@/types/auth';
import type { WithdrawalStatus } from '@/types/admin/withdrawals';
import type { SaleStatus } from '@/types/admin/sales';
import type { TargetType } from '@/types/admin/targets';

export const USER_ROLES: UserRole[] = ['admin', 'seller'];
export const USER_STATUSES: UserStatus[] = ['active', 'inactive', 'suspended'];
export const WITHDRAWAL_STATUSES: WithdrawalStatus[] = ['pending', 'approved', 'paid', 'rejected'];
export const SALE_STATUSES: SaleStatus[] = ['pending', 'processed', 'cancelled'];
export const TARGET_TYPES: TargetType[] = ['personal', 'network'];

export const DEFAULT_PAGE_SIZE = 20;
