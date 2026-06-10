import {
  LayoutDashboard,
  Users,
  Receipt,
  Wallet,
  Banknote,
  ScrollText,
  TrendingUp,
  Target,
  BarChart3,
  GitBranch,
  ShieldCheck,
} from 'lucide-react';
import { PERMISSIONS } from '@/lib/permissions';
import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  permission?: string;
  /** Page depends on a proposed endpoint that the backend hasn't shipped yet. */
  needsBackend?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: '/admin', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/admin/users', labelKey: 'nav.users', icon: Users, permission: PERMISSIONS.USERS_READ },
  { href: '/admin/sales', labelKey: 'nav.sales', icon: TrendingUp, permission: PERMISSIONS.SALES_READ },
  {
    href: '/admin/commissions',
    labelKey: 'nav.commissions',
    icon: ScrollText,
    permission: PERMISSIONS.COMMISSIONS_READ,
  },
  {
    href: '/admin/wallets',
    labelKey: 'nav.wallets',
    icon: Wallet,
    permission: PERMISSIONS.WALLETS_READ,
    needsBackend: true,
  },
  {
    href: '/admin/withdrawals',
    labelKey: 'nav.withdrawals',
    icon: Banknote,
    permission: PERMISSIONS.WITHDRAWALS_READ,
  },
  {
    href: '/admin/targets',
    labelKey: 'nav.targets',
    icon: Target,
    permission: PERMISSIONS.TARGETS_READ,
  },
  {
    href: '/admin/expenses',
    labelKey: 'nav.expenses',
    icon: Receipt,
    permission: PERMISSIONS.EXPENSES_READ,
  },
  {
    href: '/admin/analytics',
    labelKey: 'nav.analytics',
    icon: BarChart3,
    permission: PERMISSIONS.ANALYTICS_READ,
    needsBackend: true,
  },
  {
    href: '/admin/hierarchy',
    labelKey: 'nav.hierarchy',
    icon: GitBranch,
    permission: PERMISSIONS.HIERARCHY_READ,
  },
  {
    href: '/admin/access',
    labelKey: 'nav.access',
    icon: ShieldCheck,
    permission: PERMISSIONS.ACCESS_READ,
  },
];
