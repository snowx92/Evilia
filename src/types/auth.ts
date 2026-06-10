// Source of truth: docs/auth-endpoint-inventory.md (and matches User shape in admin module).

import type { TimestampLike } from '@/lib/utils';

export type UserRole = 'admin' | 'sub-admin' | 'seller' | 'leader' | (string & {});
export type UserStatus = 'active' | 'suspended' | (string & {});
export type Locale = 'ar' | 'en';

export type User = {
  id: string;
  displayName: string;
  email: string;
  phone?: string | null;
  sellerCode?: string | null;
  role: UserRole;
  parentId: string | null;
  commissionPercentage: number;
  status: UserStatus;
  language: Locale;
  createdAt: TimestampLike;
  // Not every user document carries these (e.g. leaf seller accounts) — keep them optional.
  isSuperAdmin?: boolean;
  permissions?: string[] | null;
};

export type Wallet = {
  userId: string;
  balance: number;
  pendingWithdrawal: number;
  totalEarned: number;
  totalWithdrawn: number;
  available: number;
  updatedAt: TimestampLike;
};

export type PermissionCatalogEntry = {
  key: string;
  label: string;
  labelAr: string;
  description: string;
  group: string;
  granted: boolean;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  createdAt: TimestampLike;
  isRead: boolean;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: User;
  customAuthToken: string;
};

export type MeResponse = {
  user: User;
  wallet: Wallet;
  permissionCatalog: PermissionCatalogEntry[];
  effectivePermissions: string[];
};
