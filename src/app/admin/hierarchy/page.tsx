'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Users2, GitBranch, Crown, Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { MetricCard } from '@/components/shared/metric-card';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { HierarchyTree } from '@/features/hierarchy/hierarchy-tree';
import { buildTree, countAll } from '@/features/hierarchy/build-tree';
import { useUsersQuery } from '@/hooks/queries/use-users';
import { useTranslation } from '@/hooks/use-translation';
import { stagger } from '@/lib/motion';

export default function HierarchyPage() {
  const { t } = useTranslation();
  // Pull a generous slab — for orgs > 100 users we'll add an explicit fetch-all later.
  const usersQuery = useUsersQuery({ page: 1, limit: 100 });
  const [search, setSearch] = useState('');

  const allUsers = usersQuery.data?.items ?? [];

  // Filter by search term across name / email / sellerCode, but keep ancestors
  // so the tree still renders sensibly.
  const filtered = useMemo(() => {
    if (!search.trim()) return allUsers;
    const term = search.trim().toLowerCase();
    const match = (uid: string) => {
      const u = allUsers.find((x) => x.id === uid);
      if (!u) return false;
      return (
        u.displayName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.sellerCode ?? '').toLowerCase().includes(term) ||
        u.id.toLowerCase().includes(term)
      );
    };
    const keep = new Set<string>();
    allUsers.forEach((u) => {
      if (match(u.id)) {
        // walk ancestors
        let cur: string | null = u.id;
        while (cur) {
          keep.add(cur);
          const node = allUsers.find((x) => x.id === cur);
          cur = node?.parentId ?? null;
        }
      }
    });
    return allUsers.filter((u) => keep.has(u.id));
  }, [allUsers, search]);

  const tree = useMemo(() => buildTree(filtered), [filtered]);
  const { total, levels } = useMemo(() => countAll(tree), [tree]);
  const adminCount = allUsers.filter((u) => u.role === 'admin').length;
  const sellerCount = allUsers.filter((u) => u.role === 'seller').length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t('nav.hierarchy')}
        title={t('hierarchy.title')}
        description={t('hierarchy_ext.team')}
      />

      {/* KPIs */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <MetricCard
          label={t('hierarchy_ext.totalMembers')}
          value={String(allUsers.length)}
          icon={Users2}
          accent="indigo"
          isLoading={usersQuery.isLoading}
        />
        <MetricCard
          label={t('hierarchy_ext.levels')}
          value={String(levels)}
          icon={GitBranch}
          accent="emerald"
          isLoading={usersQuery.isLoading}
        />
        <MetricCard
          label={t('role.admin')}
          value={String(adminCount)}
          icon={Crown}
          accent="amber"
          isLoading={usersQuery.isLoading}
        />
        <MetricCard
          label={t('role.seller')}
          value={String(sellerCount)}
          icon={Users2}
          accent="rose"
          isLoading={usersQuery.isLoading}
        />
      </motion.div>

      {/* Search */}
      <Card>
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('common.search')}
              className="ps-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tree — the inner HierarchyTree handles its own scroll/zoom viewport. */}
      <Card>
        <CardContent className="overflow-hidden py-5">
          {usersQuery.isError ? (
            <ErrorState onRetry={() => usersQuery.refetch()} />
          ) : usersQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : tree.length === 0 ? (
            <EmptyState title={t('common.noResults')} description={t('hierarchy.title')} />
          ) : (
            <>
              <p className="mb-4 text-xs text-muted-foreground">
                {t('hierarchy_ext.totalMembers')}:{' '}
                <span className="font-medium text-foreground">{total}</span> · {t('hierarchy_ext.levels')}:{' '}
                <span className="font-medium text-foreground">{levels}</span>
              </p>
              <HierarchyTree roots={tree} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
