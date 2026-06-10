/**
 * Permission keys are returned by the API at runtime (`effectivePermissions`).
 * The constants here are conventional names used by the nav and gates;
 * they're best-guess matches against the patterns visible in the inventory
 * (e.g. "users.read", "withdrawals.write"). They're only enforced when the
 * server returns them — so if a permission isn't granted yet, the UI gracefully
 * hides the entry without breaking.
 */
export const PERMISSIONS = {
  USERS_READ: 'users.read',
  USERS_WRITE: 'users.write',
  USERS_SUSPEND: 'users.suspend',
  TARGETS_READ: 'targets.read',
  TARGETS_WRITE: 'targets.write',
  EXPENSES_READ: 'expenses.read',
  EXPENSES_WRITE: 'expenses.write',
  ANALYTICS_READ: 'analytics.read',
  WALLETS_READ: 'wallets.read',
  WALLETS_WRITE: 'wallets.write',
  WITHDRAWALS_READ: 'withdrawals.read',
  WITHDRAWALS_WRITE: 'withdrawals.write',
  COMMISSIONS_READ: 'commissions.read',
  SALES_READ: 'sales.read',
  HIERARCHY_READ: 'hierarchy.read',
  HIERARCHY_WRITE: 'hierarchy.write',
  ACCESS_READ: 'access.read',
  ACCESS_WRITE: 'access.write',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
