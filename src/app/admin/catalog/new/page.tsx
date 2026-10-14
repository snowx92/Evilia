'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { CatalogForm } from '@/features/catalog/catalog-form';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useTranslation } from '@/hooks/use-translation';
import { PERMISSIONS } from '@/lib/permissions';
import { hasPermission, useAuthStore } from '@/store/auth';

export default function NewCatalogProductPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('catalog.newTitle'));
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const canWrite = useAuthStore((s) => hasPermission(s, PERMISSIONS.CATALOG_WRITE));

  useEffect(() => {
    if (hydrated && !canWrite) router.replace('/admin/catalog');
  }, [hydrated, canWrite, router]);

  if (!hydrated || !canWrite) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t('nav.catalog')}
        title={t('catalog.newTitle')}
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
      <CatalogForm />
    </div>
  );
}
