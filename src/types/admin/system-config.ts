import type { TimestampLike } from '@/lib/utils';

/** GET/PUT /v1/admin/system-config (super admin only). */
export type SystemConfig = {
  /** When false, sellers cannot submit new withdrawal requests. Defaults to true. */
  withdrawalsEnabled: boolean;
  updatedAt: TimestampLike | null;
  updatedBy: string | null;
};

export type UpdateSystemConfigRequest = {
  withdrawalsEnabled?: boolean;
};
