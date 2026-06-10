/**
 * Preview wallet-transactions used while the backend implements
 * GET /v1/admin/wallets/transactions (see docs/proposed-endpoints.md).
 *
 * Seeded from the requested filters so renders are stable.
 */
import type { PaginatedResponse } from '@/types/api';
import type {
  AllWalletTransactionsParams,
  WalletTransaction,
} from '@/types/admin/wallets';

const USERS = ['test-seller-001', 'test-seller-002', 'test-leader-c01', 'test-leader-b01'];
const TYPES = ['commission', 'bonus', 'withdrawal', 'adjustment'] as const;
const REFS = ['sale', 'bonus', 'withdrawal', 'adjustment'] as const;

function seed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}
function rand(s: string) {
  let t = seed(s) || 1;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function demoAllWalletTransactions(
  params: AllWalletTransactionsParams,
): PaginatedResponse<WalletTransaction> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const r = rand(`wallet|${params.userId ?? ''}|${params.type ?? ''}|${page}`);

  const TOTAL = 64;
  const items: WalletTransaction[] = [];
  const baseTs = 1780_900_000 - (page - 1) * limit * 3_600;

  for (let i = 0; i < limit; i++) {
    const userId = params.userId ?? USERS[Math.floor(r() * USERS.length)];
    const type = params.type ?? TYPES[Math.floor(r() * TYPES.length)];
    const refType = type === 'commission' ? 'sale' : type === 'bonus' ? 'bonus' : REFS[Math.floor(r() * REFS.length)];
    const amount = Math.round(50 + r() * 1450);
    const balanceBefore = Math.round(r() * 5000);
    const isOutflow = type === 'withdrawal';
    const balanceAfter = isOutflow ? balanceBefore - amount : balanceBefore + amount;

    items.push({
      id: `demo-tx-${page}-${i}-${Math.floor(r() * 1e9)}`,
      userId,
      type,
      amount,
      balanceBefore,
      balanceAfter,
      referenceId: `ref-${Math.floor(r() * 1e8).toString(36)}`,
      referenceType: refType,
      description:
        type === 'commission'
          ? `Commission from sale E2E-${Math.floor(r() * 1e10)}`
          : type === 'bonus'
            ? 'Performance bonus'
            : type === 'withdrawal'
              ? 'Withdrawal payout'
              : 'Manual adjustment',
      createdAt: { _seconds: baseTs - i * 1800, _nanoseconds: 0 },
      itemIndex: (page - 1) * limit + i + 1,
    });
  }
  const totalPages = Math.ceil(TOTAL / limit);
  return {
    items,
    pageItems: items.length,
    totalItems: TOTAL,
    isLastPage: page >= totalPages,
    nextPageNumber: Math.min(page + 1, totalPages),
    currentPage: page,
    totalPages,
  };
}
