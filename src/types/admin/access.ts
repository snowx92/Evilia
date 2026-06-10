import type { PaginationParams } from '@/types/api';
import type { PermissionCatalogEntry, User } from '@/types/auth';

export type PermissionCatalog = Omit<PermissionCatalogEntry, 'granted'>[];

export type AdminsListParams = PaginationParams;

export type UpdateAdminPermissionsRequest = {
  permissions: string[];
};

export type AdminUser = User;
