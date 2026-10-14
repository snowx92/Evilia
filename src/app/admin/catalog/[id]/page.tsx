'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { ErrorState } from '@/components/shared/error-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CatalogForm } from '@/features/catalog/catalog-form';
import { useCatalogProductQuery } from '@/hooks/queries/use-catalog';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { pickLocalized } from '@/lib/localized-text';

export default function EditCatalogProductPage() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const params = useParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const query = useCatalogProductQuery(id);
  const title = pickLocalized(query.data?.name, locale) || t('catalog.edit');
  useDocumentTitle(title);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t('nav.catalog')}
        title={title}
        description={t('catalog.hintsNote')}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/catalog">
              <ArrowLeft className="h-4 w-4" />
              {t('common.back')}
            </Link>
          </Button>
        }
      />
      {query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : query.isLoading || !query.data ? (
        <Skeleton className="h-[480px] w-full rounded-2xl" />
      ) : (
        <CatalogForm
          key={`${query.data.id}:${JSON.stringify(query.data.updatedAt ?? null)}`}
          product={query.data}
        />
      )}
    </div>
  );
}
