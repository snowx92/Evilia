import {
  BarChart3,
  LayoutDashboard,
  Users2,
  TrendingUp,
  ScrollText,
  Wallet,
  Banknote,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type SellerNavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
};

export const SELLER_NAV_ITEMS: SellerNavItem[] = [
  { href: '/seller', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/seller/analytics', labelKey: 'seller.nav.analytics', icon: BarChart3 },
  { href: '/seller/network', labelKey: 'seller.nav.network', icon: Users2 },
  { href: '/seller/sales', labelKey: 'seller.nav.sales', icon: TrendingUp },
  { href: '/seller/commissions', labelKey: 'seller.nav.commissions', icon: ScrollText },
  { href: '/seller/wallet', labelKey: 'seller.nav.wallet', icon: Wallet },
  { href: '/seller/withdrawals', labelKey: 'seller.nav.withdrawals', icon: Banknote },
];
