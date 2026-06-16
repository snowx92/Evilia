'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Crown,
  Eye,
  Loader2,
  Maximize2,
  Plus,
  RotateCcw,
  UserPlus,
  Users2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage, getInitials } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { LinksListEditor } from '@/components/shared/links-list-editor';
import { ReassignParentDialog } from './reassign-parent-dialog';
import { useCreateSellerMutation } from '@/hooks/queries/use-users';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { toast } from '@/components/ui/sonner';
import { cn, formatPercent } from '@/lib/utils';
import { ApiError } from '@/types/api';
import { type TreeNode } from './build-tree';

// ─── Role colours ─────────────────────────────────────────────────────────────

const ROLE_BADGE: Record<string, 'brand' | 'success' | 'warning' | 'muted'> = {
  admin: 'warning',
  seller: 'brand',
};

const ROLE_RING: Record<string, string> = {
  admin: 'ring-warning/40',
  seller: 'ring-primary/40',
};

// ─── Add child dialog ─────────────────────────────────────────────────────────

const addChildSchema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(1),
  sellerCode: z.string().optional(),
  directCommissionPercentage: z.coerce.number().min(0).max(100),
  networkCommissionPercentage: z.coerce.number().min(0).max(100),
  socialMediaLink: z
    .string()
    .url()
    .optional()
    .or(z.literal('').transform(() => undefined)),
});
type AddChildValues = z.infer<typeof addChildSchema>;

function AddChildDialog({ parentNode }: { parentNode: TreeNode }) {
  const [open, setOpen] = useState(false);
  const [affiliateLinks, setAffiliateLinks] = useState<string[]>([]);
  const { t } = useTranslation();
  const create = useCreateSellerMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddChildValues>({
    resolver: zodResolver(addChildSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      phone: '',
      sellerCode: '',
      directCommissionPercentage: 0,
      networkCommissionPercentage: 0,
      socialMediaLink: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const cleanedLinks = affiliateLinks.map((l) => l.trim()).filter(Boolean);
      await create.mutateAsync({
        displayName: values.displayName,
        email: values.email,
        password: values.password,
        phone: values.phone,
        role: 'seller',
        directCommissionPercentage: values.directCommissionPercentage,
        networkCommissionPercentage: values.networkCommissionPercentage,
        parentId: parentNode.id,
        ...(values.sellerCode ? { sellerCode: values.sellerCode } : {}),
        ...(values.socialMediaLink ? { socialMediaLink: values.socialMediaLink } : {}),
        ...(cleanedLinks.length ? { affiliateLinks: cleanedLinks } : {}),
      });
      toast.success(t('common.save'));
      setOpen(false);
      reset();
      setAffiliateLinks([]);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { reset(); setAffiliateLinks([]); } }}>
      <DialogTrigger asChild>
        <button
          type="button"
          title={t('users.create')}
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-dashed border-border/70 bg-background text-muted-foreground opacity-0 transition-all group-hover/node:opacity-100 hover:border-primary hover:bg-primary-soft hover:text-primary"
        >
          <Plus className="h-3 w-3" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            {t('users.create')}
          </DialogTitle>
          {/* Parent context */}
          <p className="text-[13px] text-muted-foreground">
            {t('users.fields.parentId')}:{' '}
            <span className="font-medium text-foreground">{parentNode.displayName}</span>
          </p>
        </DialogHeader>

        <form onSubmit={onSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto px-0.5" noValidate>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('users.fields.displayName')}</Label>
              <Input {...register('displayName')} aria-invalid={Boolean(errors.displayName)} />
            </div>

            <div className="space-y-2">
              <Label>{t('common.email')}</Label>
              <Input
                type="email"
                dir="ltr"
                {...register('email')}
                aria-invalid={Boolean(errors.email)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('common.phone')}</Label>
              <Input
                type="tel"
                dir="ltr"
                {...register('phone')}
                aria-invalid={Boolean(errors.phone)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('auth.passwordLabel')}</Label>
              <PasswordInput
                dir="ltr"
                showLabel={t('auth.showPassword')}
                hideLabel={t('auth.hidePassword')}
                {...register('password')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('users.fields.sellerCode')}</Label>
              <Input dir="ltr" {...register('sellerCode')} />
            </div>

            <div className="space-y-2">
              <Label>{t('users.fields.directCommissionPercentage')}</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                dir="ltr"
                {...register('directCommissionPercentage')}
                aria-invalid={Boolean(errors.directCommissionPercentage)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('users.fields.networkCommissionPercentage')}</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                dir="ltr"
                {...register('networkCommissionPercentage')}
                aria-invalid={Boolean(errors.networkCommissionPercentage)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>{t('users.fields.socialMediaLink')}</Label>
              <Input
                type="url"
                dir="ltr"
                placeholder="https://"
                {...register('socialMediaLink')}
                aria-invalid={Boolean(errors.socialMediaLink)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>{t('users.fields.affiliateLinks')}</Label>
              <LinksListEditor
                value={affiliateLinks}
                onChange={setAffiliateLinks}
                placeholder="https://"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || create.isPending}>
              {(isSubmitting || create.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Node card ────────────────────────────────────────────────────────────────

function NodeCard({ node, isRoot }: { node: TreeNode; isRoot: boolean }) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);

  return (
    <div
      className={cn(
        'group/node relative flex w-[200px] flex-col gap-2 rounded-2xl border bg-card p-3 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover',
        isRoot
          ? 'border-primary/30 bg-gradient-to-br from-primary-soft/40 to-card'
          : 'border-border/70',
      )}
    >
      {/* Top row: avatar + add button */}
      <div className="flex items-start justify-between gap-1">
        <div className="relative">
          <Avatar
            className={cn(
              'h-9 w-9 ring-2',
              ROLE_RING[node.role] ?? 'ring-border/40',
            )}
          >
            {node.profileImageUrl && (
              <AvatarImage src={node.profileImageUrl} alt={node.displayName} />
            )}
            <AvatarFallback className="text-xs">{getInitials(node.displayName)}</AvatarFallback>
          </Avatar>
          {node.isSuperAdmin && (
            <span className="absolute -end-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-warning text-warning-foreground shadow-sm">
              <Crown className="h-2.5 w-2.5" />
            </span>
          )}
        </div>
        <AddChildDialog parentNode={node} />
      </div>

      {/* Identity — links to the user's profile */}
      <Link
        href={`/admin/users/${encodeURIComponent(node.id)}`}
        className="block min-w-0 leading-tight outline-none transition-colors hover:text-primary focus-visible:text-primary"
        title={t('users.actions.viewProfile')}
      >
        <p className="truncate text-[13px] font-semibold">{node.displayName}</p>
        <p className="truncate text-[11px] text-muted-foreground">{node.email}</p>
      </Link>

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-1">
        <Badge variant={ROLE_BADGE[node.role] ?? 'outline'} className="text-[10px]">
          {t(`role.${node.role}`)}
        </Badge>
        {node.sellerCode && (
          <span className="font-mono text-[10px] text-muted-foreground">{node.sellerCode}</span>
        )}
      </div>

      {/* Metrics row */}
      <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
        {node.descendantCount > 0 ? (
          <span className="inline-flex items-center gap-1">
            <Users2 className="h-3 w-3" />
            {node.descendantCount}
          </span>
        ) : (
          <span />
        )}
        <span className="flex flex-col items-end leading-tight tabular-nums">
          <span>
            <span className="text-muted-foreground/70">
              {t('users.fields.directCommissionShort')}:
            </span>{' '}
            <span className="font-medium text-foreground">
              {formatPercent(
                node.directCommissionPercentage ?? node.commissionPercentage ?? 0,
                locale,
              )}
            </span>
          </span>
          <span>
            <span className="text-muted-foreground/70">
              {t('users.fields.networkCommissionShort')}:
            </span>{' '}
            <span className="font-medium text-foreground">
              {formatPercent(node.networkCommissionPercentage ?? 0, locale)}
            </span>
          </span>
        </span>
      </div>

      {/* Hover-revealed actions: view profile + reassign parent */}
      <div className="absolute bottom-2 end-2 flex items-center gap-1 opacity-0 transition-opacity group-hover/node:opacity-100">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          title={t('users.actions.viewProfile')}
        >
          <Link href={`/admin/users/${encodeURIComponent(node.id)}`}>
            <Eye className="h-3.5 w-3.5" />
          </Link>
        </Button>
        <ReassignParentDialog userId={node.id} />
      </div>
    </div>
  );
}

// ─── Recursive org-tree branch ────────────────────────────────────────────────

function Branch({
  node,
  open,
  onToggle,
}: {
  node: TreeNode;
  open: Set<string>;
  onToggle: (id: string) => void;
}) {
  const expanded = open.has(node.id);
  const hasChildren = node.children.length > 0;
  const isRoot = node.depth === 0;

  return (
    <li>
      {/* Node card + collapse toggle */}
      <div className="relative inline-block">
        <NodeCard node={node} isRoot={isRoot} />
        {hasChildren && (
          <button
            type="button"
            onClick={() => onToggle(node.id)}
            className="absolute -bottom-3 left-1/2 z-10 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-border/70 bg-card text-muted-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            <motion.span animate={{ rotate: expanded ? 0 : 180 }} transition={{ duration: 0.2 }}>
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 4L5 7L8 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.span>
          </button>
        )}
      </div>

      {/* Children */}
      <AnimatePresence initial={false}>
        {expanded && hasChildren && (
          <motion.ul
            initial={{ opacity: 0, scaleY: 0.8 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.8 }}
            style={{ originY: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {node.children.map((child) => (
              <Branch key={child.id} node={child} open={open} onToggle={onToggle} />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

const ZOOM_MIN = 0.4;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;

export function HierarchyTree({ roots }: { roots: TreeNode[] }) {
  const { t } = useTranslation();

  // Start with all nodes expanded
  const allIds = (): Set<string> => {
    const ids = new Set<string>();
    const walk = (n: TreeNode) => {
      ids.add(n.id);
      n.children.forEach(walk);
    };
    roots.forEach(walk);
    return ids;
  };

  const [open, setOpen] = useState<Set<string>>(() => allIds());
  const [zoom, setZoom] = useState(1);

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const zoomPct = Math.round(zoom * 100);

  return (
    <div className="space-y-4">
      {/* Controls — expand/collapse on the left, zoom on the right */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => setOpen(allIds())}>
            {t('hierarchy_ext.expandAll')}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setOpen(new Set())}>
            {t('hierarchy_ext.collapseAll')}
          </Button>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-card p-1 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))}
            disabled={zoom <= ZOOM_MIN}
            title={t('hierarchy_ext.zoomOut')}
            aria-label={t('hierarchy_ext.zoomOut')}
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="min-w-[3rem] text-center text-[11px] font-medium tabular-nums text-muted-foreground">
            {zoomPct}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))}
            disabled={zoom >= ZOOM_MAX}
            title={t('hierarchy_ext.zoomIn')}
            aria-label={t('hierarchy_ext.zoomIn')}
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom(1)}
            disabled={zoom === 1}
            title={t('hierarchy_ext.zoomReset')}
            aria-label={t('hierarchy_ext.zoomReset')}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom(ZOOM_MIN)}
            disabled={zoom === ZOOM_MIN}
            title={t('hierarchy_ext.zoomFit')}
            aria-label={t('hierarchy_ext.zoomFit')}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Scrollable viewport — both axes. Zoom is applied via CSS transform
          on the inner wrapper; origin top-left so scrolling stays predictable. */}
      <div className="overflow-auto rounded-xl border border-border/40 bg-muted/20 max-h-[75vh]">
        <div
          className="inline-block min-w-full p-6"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        >
          <ul className="org-tree">
            {roots.map((r) => (
              <Branch key={r.id} node={r} open={open} onToggle={toggle} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
