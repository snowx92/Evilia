'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatNumber } from '@/lib/utils';

export function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onChange,
  disabled,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  /** Page size used to derive the "Showing X-Y" hint. Defaults to 20. */
  pageSize?: number;
  onChange: (page: number) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  // In RTL, "previous" still means "go back to lower page number" — we just flip the icon.
  const isRTL = locale === 'ar';
  const Prev = isRTL ? ChevronRight : ChevronLeft;
  const Next = isRTL ? ChevronLeft : ChevronRight;

  const limit = pageSize ?? 20;
  const from = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const to = Math.min(currentPage * limit, totalItems);

  return (
    <nav className="flex items-center justify-between gap-3 px-1 py-3 text-sm">
      <p className="text-xs text-muted-foreground">
        {t('common.showing', {
          from: formatNumber(from, locale),
          to: formatNumber(to, locale),
          total: formatNumber(totalItems, locale),
        })}
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
