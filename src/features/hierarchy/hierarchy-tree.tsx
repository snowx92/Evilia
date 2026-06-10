'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Crown, Users2 } from 'lucide-react';
import { Avatar, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ReassignParentDialog } from './reassign-parent-dialog';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { cn, formatPercent } from '@/lib/utils';
import { flattenIds, type TreeNode } from './build-tree';

const ROLE_BADGE: Record<string, 'brand' | 'success' | 'warning' | 'muted'> = {
  admin: 'warning',
  'sub-admin': 'warning',
  leader: 'success',
  seller: 'brand',
};

function NodeCard({
  node,
  expanded,
  onToggle,
  isRoot,
}: {
  node: TreeNode;
  expanded: boolean;
  onToggle: () => void;
  isRoot: boolean;
}) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const hasChildren = node.children.length > 0;

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover',
        isRoot ? 'border-primary/30 bg-gradient-to-br from-primary-soft/40 to-card' : 'border-border/70',
      )}
    >
      {/* Expand toggle */}
      <button
        type="button"
        onClick={onToggle}
        disabled={!hasChildren}
        aria-label={expanded ? t('hierarchy_ext.collapseAll') : t('hierarchy_ext.expandAll')}
        className={cn(
          'grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors',
          hasChildren
            ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
            : 'text-transparent',
        )}
      >
        <motion.span animate={{ rotate: expanded ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>

      {/* Avatar */}
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{getInitials(node.displayName)}</AvatarFallback>
        </Avatar>
        {node.isSuperAdmin && (
          <span className="absolute -end-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-warning text-warning-foreground shadow-sm">
            <Crown className="h-2.5 w-2.5" />
          </span>
        )}
      </div>

      {/* Identity */}
      <div className="min-w-0 flex-1 leading-tight">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{node.displayName}</p>
          <Badge variant={ROLE_BADGE[node.role] ?? 'outline'} className="text-[10px]">
            {t(`role.${node.role}`)}
          </Badge>
          {node.sellerCode && (
            <span className="font-mono text-[10px] text-muted-foreground">{node.sellerCode}</span>
          )}
        </div>
        <p className="truncate text-[11px] text-muted-foreground">{node.email}</p>
      </div>

      {/* Metrics */}
      <div className="hidden items-center gap-4 px-1 sm:flex">
        {hasChildren && (
          <div className="flex flex-col items-end leading-tight">
            <span className="inline-flex items-center gap-1 text-sm font-semibold">
              <Users2 className="h-3.5 w-3.5 text-muted-foreground" />
              {node.descendantCount}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {node.children.length} {t('hierarchy_ext.directReports')}
            </span>
          </div>
        )}
        <div className="flex flex-col items-end leading-tight">
          <span className="text-sm font-semibold tabular-nums">
            {formatPercent(node.commissionPercentage, locale)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {t('users.fields.commissionPercentage')}
          </span>
        </div>
      </div>

      <ReassignParentDialog userId={node.id} />
    </div>
  );
}

function Branch({
  node,
  open,
  setOpen,
  isLast,
}: {
  node: TreeNode;
  open: Set<string>;
  setOpen: (next: Set<string>) => void;
  isLast: boolean;
}) {
  const expanded = open.has(node.id);
  const toggle = () => {
    const next = new Set(open);
    if (expanded) next.delete(node.id);
    else next.add(node.id);
    setOpen(next);
  };

  const hasChildren = node.children.length > 0;
  const isRoot = node.depth === 0;

  return (
    <li className="relative">
      {/* Connectors */}
      {node.depth > 0 && (
        <>
          {/* Vertical line up to parent */}
          <span
            className={cn(
              'pointer-events-none absolute top-0 w-px bg-border',
              'start-5',
              isLast ? 'h-6' : 'h-full',
            )}
            aria-hidden="true"
          />
          {/* Horizontal stub to node */}
          <span
            className="pointer-events-none absolute start-5 top-6 h-px w-5 bg-border"
            aria-hidden="true"
          />
        </>
      )}

      <div className={cn(node.depth > 0 && 'ps-12')}>
        <NodeCard node={node} expanded={expanded} onToggle={toggle} isRoot={isRoot} />
      </div>

      <AnimatePresence initial={false}>
        {expanded && hasChildren && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="ms-3 mt-2 space-y-2 overflow-hidden ps-3"
          >
            {node.children.map((c, i) => (
              <Branch
                key={c.id}
                node={c}
                open={open}
                setOpen={setOpen}
                isLast={i === node.children.length - 1}
              />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}

export function HierarchyTree({ roots }: { roots: TreeNode[] }) {
  const { t } = useTranslation();
  const allIds = useMemo(() => flattenIds(roots), [roots]);
  const [open, setOpen] = useState<Set<string>>(() => new Set(allIds));

  // If the data refreshes with different ids, default to "expand all".
  useEffect(() => {
    setOpen(new Set(allIds));
  }, [allIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-1.5">
        <Button variant="ghost" size="sm" onClick={() => setOpen(new Set(allIds))}>
          {t('hierarchy_ext.expandAll')}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen(new Set())}>
          {t('hierarchy_ext.collapseAll')}
        </Button>
      </div>
      <ul className="space-y-3">
        {roots.map((r, i) => (
          <Branch key={r.id} node={r} open={open} setOpen={setOpen} isLast={i === roots.length - 1} />
        ))}
      </ul>
    </div>
  );
}
