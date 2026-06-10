'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';

export function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  onChange,
  disabled,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onChange: (page: number) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  // In RTL, "previous" still means "go back to lower page number" — we just flip the icon.
  const isRTL = locale === 'ar';
  const Prev = isRTL ? ChevronRight : ChevronLeft;
  const Next = isRTL ? ChevronLeft : ChevronRight;

  return (
    <nav className="flex items-center justify-between gap-3 px-1 py-3 text-sm">
      <p className="text-xs text-muted-foreground">
        {t('common.page')} {currentPage} {t('common.of')} {Math.max(totalPages, 1)} •{' '}
        {totalItems.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || currentPage <= 1}
          onClick={() => onChange(currentPage - 1)}
        >
          <Prev className="h-4 w-4" />
          <span className="hidden sm:inline">{t('common.prev')}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || currentPage >= totalPages}
          onClick={() => onChange(currentPage + 1)}
        >
          <span className="hidden sm:inline">{t('common.next')}</span>
          <Next className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
