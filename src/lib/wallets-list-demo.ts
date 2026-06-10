/**
 * Preview wallet snapshots used while the backend implements
 * GET /v1/admin/wallets (see docs/proposed-endpoints.md).
 */
import type { PaginatedResponse } from '@/types/api';
import type { WalletSnapshot, WalletsListParams } from '@/types/admin/wallets';

const SEED_USERS: Array<{
  userId: string;
  displayName: string;
  email: string;
  sellerCode?: string | null;
  role: string;
  earned: number;
  withdrawn: number;
}> = [
  {
    userId: 'test-seller-001',
    displayName: 'Seller One',
    email: 'seller1@evilla-test.local',
    sellerCode: 'SELLER001',
    role: 'seller',
    earned: 6800,
    withdrawn: 2100,
  },
  {
    userId: 'test-seller-002',
    displayName: 'Seller Two',
    email: 'seller2@evilla-test.local',
    sellerCode: 'SELLER002',
    role: 'seller',
    earned: 3400,
    withdrawn: 800,
  },
  {
    userId: 'test-leader-c01',
    displayName: 'Leader C',
    email: 'leaderC@evilla-test.local',
    sellerCode: null,
    role: 'leader',
    earned: 1700,
    withdrawn: 400,
  },
  {
    userId: 'test-leader-b01',
    displayName: 'Leader B',
    email: 'leaderB@evilla-test.local',
    sellerCode: null,
    role: 'leader',
    earned: 2400,
    withdrawn: 1000,
  },
  {
    userId: 'test-leader-a01',
    displayName: 'Leader A',
    email: 'leaderA@evilla-test.local',
    sellerCode: null,
    role: 'leader',
    earned: 4000,
    withdrawn: 1800,
  },
  {
    userId: 'test-admin-001',
    displayName: 'Test Admin',
    email: 'admin@evilla-test.local',
    sellerCode: null,
    role: 'admin',
    earned: 0,
    withdrawn: 0,
  },
];

export function demoWalletsList(
  params: WalletsListParams,
): PaginatedResponse<WalletSnapshot> {
  const term = (params.search ?? '').trim().toLowerCase();
  const filtered = SEED_USERS.filter((u) => {
    if (params.role && u.role !== params.role) return false;
    if (!term) return true;
    return (
      u.displayName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.sellerCode ?? '').toLowerCase().includes(term) ||
      u.userId.toLowerCase().includes(term)
    );
  });

  const items: WalletSnapshot[] = filtered.map((u) => {
    const pending = Math.round((u.earned - u.withdrawn) * 0.18);
    const available = u.earned - u.withdrawn - pending;
    return {
      userId: u.userId,
      displayName: u.displayName,
      email: u.email,
      sellerCode: u.sellerCode,
      role: u.role,
      balance: u.earned - u.withdrawn,
      available,
      pendingWithdrawal: pending,
      totalEarned: u.earned,
      totalWithdrawn: u.withdrawn,
      updatedAt: { _seconds: 1780_882_795, _nanoseconds: 0 },
    };
  });

  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const total = items.length;
  const start = (page - 1) * limit;
  const slice = items.slice(start, start + limit);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    items: slice,
    pageItems: slice.length,
    totalItems: total,
    isLastPage: page >= totalPages,
    nextPageNumber: Math.min(page + 1, totalPages),
    currentPage: page,
    totalPages,
  };
}
