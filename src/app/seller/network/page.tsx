'use client';

import { useState } from 'react';
import { Users2, GitBranch } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage, getInitials } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import {
  useSellerNetworkQuery,
  useSellerNetworkTreeQuery,
} from '@/hooks/queries/use-seller';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatPercent } from '@/lib/utils';
import type { SellerNetworkTreeNode } from '@/types/seller';

function TreeNode({ node, depth = 0 }: { node: SellerNetworkTreeNode; depth?: number }) {
  const { t } = useTranslation();
  // API may omit `children` for leaf nodes — treat as empty.
  const children = node.children ?? [];
  const hasChildren = children.length > 0;
  return (
    <li>
      <div
        className="flex items-center gap-2 rounded-xl border border-border/70 bg-card p-2.5 shadow-card"
        style={{ marginInlineStart: depth * 16 }}
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-[10px]">{getInitials(node.displayName)}</AvatarFallback>
        </Avatar>
        <span className="flex-1 truncate text-sm font-medium">{node.displayName}</span>
        {hasChildren && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
            {children.length} {t('seller.directReports')}
          </span>
        )}
      </div>
      {hasChildren && (
        <ul className="mt-1.5 space-y-1.5">
          {children.map((c) => (
            <TreeNode key={c.id} node={c} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function SellerNetworkPage() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [tab, setTab] = useState<'list' | 'tree'>('list');

  const list = useSellerNetworkQuery(tab === 'list');
  const tree = useSellerNetworkTreeQuery(tab === 'tree');

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('seller.portal')}
        title={t('seller.nav.network')}
        description={t('seller.subtitle')}
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'list' | 'tree')}>
        <TabsList>
          <TabsTrigger value="list">
            <Users2 className="me-1.5 h-3.5 w-3.5" />
            {t('common.view')}
          </TabsTrigger>
          <TabsTrigger value="tree">
            <GitBranch className="me-1.5 h-3.5 w-3.5" />
            {t('hierarchy.title')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('seller.nav.network')}</CardTitle>
              <CardDescription>
                {list.data ? list.data.length : 0} {t('hierarchy_ext.totalMembers')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {list.isError ? (
                <ErrorState onRetry={() => list.refetch()} />
              ) : list.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                  ))}
                </div>
              ) : !list.data?.length ? (
                <EmptyState title={t('common.noResults')} className="py-8" />
              ) : (
                <ul className="space-y-2">
                  {list.data.map((u) => (
                    <li
                      key={u.id}
                      className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-card"
                    >
                      <Avatar className="h-10 w-10">
                        {u.profileImageUrl ? (
                          <AvatarImage src={u.profileImageUrl} alt={u.displayName} />
                        ) : null}
                        <AvatarFallback>{getInitials(u.displayName)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 leading-tight">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold">{u.displayName}</p>
                          <Badge variant="brand" className="text-[10px]">
                            {t(`role.${u.role}`)}
                          </Badge>
                          {u.sellerCode && (
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {u.sellerCode}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-[11px] text-muted-foreground">{u.email}</p>
                      </div>
                      <div className="flex flex-col items-end leading-tight text-[11px] tabular-nums">
                        <span>
                          <span className="text-muted-foreground">
                            {t('users.fields.directCommissionShort')}:
                          </span>{' '}
                          <span className="font-semibold text-foreground">
                            {formatPercent(
                              u.directCommissionPercentage ?? u.commissionPercentage ?? 0,
                              locale,
                            )}
                          </span>
                        </span>
                        <span>
                          <span className="text-muted-foreground">
                            {t('users.fields.networkCommissionShort')}:
                          </span>{' '}
                          <span className="font-semibold text-foreground">
                            {formatPercent(u.networkCommissionPercentage ?? 0, locale)}
                          </span>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tree" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('hierarchy.title')}</CardTitle>
              <CardDescription>{t('seller.nav.network')}</CardDescription>
            </CardHeader>
            <CardContent>
              {tree.isError ? (
                <ErrorState onRetry={() => tree.refetch()} />
              ) : tree.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                  ))}
                </div>
              ) : !tree.data ? (
                <EmptyState title={t('common.noResults')} className="py-8" />
              ) : (
                <ul className="space-y-1.5">
                  <TreeNode node={tree.data} />
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
