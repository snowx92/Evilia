'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { PermissionGate } from '@/components/shared/permission-gate';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useCatalogListQuery } from '@/hooks/queries/use-catalog';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { pickLocalized } from '@/lib/localized-text';
import { PERMISSIONS } from '@/lib/permissions';
import { fadeUp, stagger } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { ADMIN_CATALOG_LIST_LIMIT } from '@/constants/admin';
import type { CatalogProduct, CatalogProductStatus } from '@/types/admin/catalog';

const STATUS_TONE: Record<CatalogProductStatus, 'warning' | 'success' | 'muted'> = {
  draft: 'warning',
  published: 'success',
  archived: 'muted',
};

function ProductCard({ product }: { product: CatalogProduct }) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const name = pickLocalized(product.name, locale);
  const pitch = pickLocalized(product.pitch, locale);
  const priceHint = pickLocalized(product.priceHint, locale);
  const earnHint = pickLocalized(product.earnHint, locale);
  const priceLabel =
    priceHint ||
    (typeof product.price === 'number' && product.price > 0
      ? `${product.currency ?? 'EGP'} ${Math.round(product.price)}`
      : '');
  const cover = product.images[0];

  return (
    <motion.article variants={fadeUp}>
      <Link
        href={`/admin/catalog/${product.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
      >
        <div className="relative aspect-[4/3] bg-muted">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-xs text-muted-foreground">
              {t('catalog.gallery')}
            </div>
          )}
          <Badge
            variant={STATUS_TONE[product.status] ?? 'muted'}
            className="absolute start-3 top-3 text-[10px] uppercase"
          >
            {t(`status.${product.status}`)}
          </Badge>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          {product.category ? (
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {product.category}
            </p>
          ) : null}
          <h3 className="text-base font-semibold leading-tight">{name || product.slug}</h3>
          {pitch ? <p className="line-clamp-2 text-sm text-muted-foreground">{pitch}</p> : null}
          {(priceLabel || earnHint) && (
            <p className="mt-auto text-xs text-primary">
              {[priceLabel, earnHint].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </Link>
    </motion.article>
  );
}

export default function AdminCatalogPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('catalog.title'));
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CatalogProductStatus | 'all'>('all');
  const locale = useLocaleStore((s) => s.locale);
  const query = useCatalogListQuery({ page: 1, limit: ADMIN_CATALOG_LIST_LIMIT });
  const items = query.data?.items ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((product) => {
      if (status !== 'all' && product.status !== status) return false;
      if (!q) return true;
      const haystack = [
        pickLocalized(product.name, locale),
        pickLocalized(product.pitch, locale),
        product.category,
        product.buyUrl,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, locale, search, status]);

  const statuses: Array<CatalogProductStatus | 'all'> = ['all', 'draft', 'published', 'archived'];
  const hasActiveFilters = status !== 'all' || search.trim() !== '';
  const clearFilters = () => {
    setStatus('all');
    setSearch('');
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t('nav.catalog')}
        title={t('catalog.title')}
        description={t('catalog.pageDesc')}
        actions={
          <PermissionGate permission={PERMISSIONS.CATALOG_WRITE}>
            <Button asChild>
              <Link href="/admin/catalog/new">
                <Plus className="h-4 w-4" />
                {t('catalog.create')}
              </Link>
            </Button>
          </PermissionGate>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="ps-9"
            value={search}
            placeholder={t('catalog.searchPlaceholder')}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {statuses.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                status === value
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {value === 'all' ? t('common.all') : t(`status.${value}`)}
            </button>
          ))}
        </div>
      </div>

      {query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : query.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <EmptyState
              title={t('catalog.emptyTitle')}
              description={t('catalog.emptyDesc')}
              action={
                <PermissionGate permission={PERMISSIONS.CATALOG_WRITE}>
                  <Button asChild>
                    <Link href="/admin/catalog/new">{t('catalog.create')}</Link>
                  </Button>
                </PermissionGate>
              }
            />
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <EmptyState
              title={t('catalog.noMatchTitle')}
              description={t('catalog.noMatchDesc')}
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('');
                    setStatus('all');
                  }}
                >
                  {t('catalog.clearFilters')}
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
