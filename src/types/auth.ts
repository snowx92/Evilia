// Source of truth: docs/auth-endpoint-inventory.md (and matches User shape in admin module).

import type { TimestampLike } from '@/lib/utils';

export type UserRole = 'admin' | 'seller' | (string & {});
export type UserStatus = 'active' | 'inactive' | 'suspended' | (string & {});
export type Locale = 'ar' | 'en';

export type User = {
  id: string;
  displayName: string;
  email: string;
  phone?: string | null;
  sellerCode?: string | null;
  role: UserRole;
  parentId: string | null;
  /** Commission % earned on the seller's own direct sales. */
  directCommissionPercentage?: number;
  /** Commission % earned on the downline network's sales. */
  networkCommissionPercentage?: number;
  /**
   * Legacy single-percentage field. Kept optional so older API payloads still
   * type-check; new code should use the two specific fields above.
   */
  commissionPercentage?: number;
  status: UserStatus;
  language: Locale;
  profileImageUrl?: string | null;
  socialMediaLink?: string | null;
  /** Public affiliate URLs the seller shares with their network. */
  affiliateLinks?: string[];
  createdAt: TimestampLike;
  // Not every user document carries these (e.g. leaf seller accounts) — keep them optional.
  isSuperAdmin?: boolean;
  permissions?: string[] | null;
};

export type Wallet = {
  userId: string;
  balance: number;
  pendingWithdrawal: number;
  onGoingOrdersBalance: number;
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

/** PUT /v1/me/profile */
export type UpdateProfileRequest = {
  displayName?: string;
  phone?: string;
  language?: Locale;
  /** Public https URL or base64 data URL. */
  profileImageUrl?: string | null;
  /** Seller-only. */
  socialMediaLink?: string | null;
  /** Seller-only. List of affiliate URLs the seller shares. */
  affiliateLinks?: string[];
};

/** PUT /v1/auth/change-password */
export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};
