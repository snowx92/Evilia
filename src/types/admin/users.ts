import type { User, UserRole, UserStatus } from '@/types/auth';
import type { PaginationParams } from '@/types/api';

export type UsersListParams = PaginationParams & {
  role?: UserRole;
  status?: UserStatus;
};

export type CreateSubAdminRequest = {
  displayName: string;
  email: string;
  password: string;
  role: UserRole;
  isSuperAdmin: boolean;
  permissions: string[];
};

export type CreateMemberRequest = {
  displayName: string;
  email: string;
  password: string;
  phone: string;
  role: 'leader' | 'seller';
  sellerCode?: string;
  parentId?: string | null;
  commissionPercentage: number;
};

export type UpdateUserRequest = {
  displayName?: string;
  commissionPercentage?: number;
  language?: User['language'];
};

export type CreateUserResponse = {
  user: User;
  customAuthToken: string;
};
