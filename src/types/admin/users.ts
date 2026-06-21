// Source of truth: Postman collection (Admins / Admin — Users).

import type { Locale, User, UserRole, UserStatus } from '@/types/auth';
import type { PaginationParams } from '@/types/api';

export type UsersListParams = PaginationParams & {
  /** API enum: admin | seller */
  role?: UserRole;
  /** API enum: active | inactive | suspended */
  status?: UserStatus;
  /** Server-side full-text search on displayName / email / sellerCode. */
  search?: string;
};

/** Create Admin / Sub-Admin (super admin only). */
export type CreateSubAdminRequest = {
  displayName: string;
  email: string;
  password: string;
  role: 'admin';
  isSuperAdmin: boolean;
  permissions: string[];
  /** Optional, e.g. https://instagram.com/user. */
  socialMediaLink?: string;
};

/** Create Seller. */
export type CreateSellerRequest = {
  displayName: string;
  email: string;
  password: string;
  phone: string;
  role: 'seller';
  sellerCode?: string;
  parentId?: string | null;
  /** % earned on the seller's own direct sales. */
  directCommissionPercentage: number;
  /** % earned on the downline network's sales. */
  networkCommissionPercentage: number;
  socialMediaLink?: string;
  /** Optional list of affiliate URLs the seller can share. */
  affiliateLinks?: string[];
};

/** Update User (PUT /v1/admin/users/{userId}). */
export type UpdateUserRequest = {
  displayName?: string;
  phone?: string;
  directCommissionPercentage?: number;
  networkCommissionPercentage?: number;
  sellerCode?: string | null;
  socialMediaLink?: string | null;
  affiliateLinks?: string[];
  language?: Locale;
};

export type CreateUserResponse = {
  user: User;
  customAuthToken: string;
};
