import type { UserRole, UserStatus } from '@/types/auth';
import type { WithdrawalStatus } from '@/types/admin/withdrawals';
import type { SaleStatus } from '@/types/admin/sales';
import type { TargetType } from '@/types/admin/targets';

export const USER_ROLES: UserRole[] = ['admin', 'seller'];
export const USER_STATUSES: UserStatus[] = ['active', 'inactive', 'suspended'];
export const WITHDRAWAL_STATUSES: WithdrawalStatus[] = ['pending', 'approved', 'paid', 'rejected'];
/** Visible sale-list filters/chips (excludes hidden `cancelled`). */
export const SALE_STATUSES: SaleStatus[] = [
  'pending',
  'processing',
  'delivered',
  'failed',
  'deleted',
];
export const TARGET_TYPES: TargetType[] = ['personal', 'network'];

export const DEFAULT_PAGE_SIZE = 20;

/**
 * Admin catalog is a small CMS list filtered client-side (search/status), so it
 * loads one page at the backend max page size (100).
 */
export const ADMIN_CATALOG_LIST_LIMIT = 100;
