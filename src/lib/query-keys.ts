// Centralised query key factory keeps cache invalidation predictable.

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
    notifications: (page?: number, limit?: number) =>
      ['auth', 'notifications', page ?? 1, limit ?? 20] as const,
  },
  users: {
    list: (params: Record<string, unknown>) => ['users', 'list', params] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
  targets: {
    list: (params: Record<string, unknown>) => ['targets', 'list', params] as const,
  },
  expenses: {
    categories: ['expenses', 'categories'] as const,
    list: (params: Record<string, unknown>) => ['expenses', 'list', params] as const,
  },
  analytics: {
    daily: ['analytics', 'daily'] as const,
    userMonthly: (userId: string) => ['analytics', 'user-monthly', userId] as const,
  },
  wallets: {
    get: (userId: string) => ['wallets', userId] as const,
    transactions: (userId: string, params: Record<string, unknown>) =>
      ['wallets', userId, 'transactions', params] as const,
  },
  withdrawals: {
    list: (params: Record<string, unknown>) => ['withdrawals', 'list', params] as const,
  },
  commissions: {
    list: (params: Record<string, unknown>) => ['commissions', 'list', params] as const,
    bySale: (saleId: string) => ['commissions', 'by-sale', saleId] as const,
  },
  sales: {
    list: (params: Record<string, unknown>) => ['sales', 'list', params] as const,
  },
  hierarchy: {
    tree: (rootId: string) => ['hierarchy', 'tree', rootId] as const,
  },
  access: {
    permissionCatalog: ['access', 'permission-catalog'] as const,
    admins: (params: Record<string, unknown>) => ['access', 'admins', params] as const,
  },
} as const;
