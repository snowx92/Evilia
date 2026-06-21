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

  // Wrap onChange so every navigation also scrolls back to the top of the
  // page — otherwise the new page renders with the viewport stuck at the
  // bottom (where the previous footer was), making the user think nothing
  // happened.
  const go = (page: number) => {
    onChange(page);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="flex flex-col items-stretch gap-2 rounded-xl border border-border/60 bg-card/50 px-3 py-2.5 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between">
      {/* Range + total. Two distinct chunks so the eye can grab each at a glance. */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs">
        <span className="font-medium text-foreground">
          {formatNumber(from, locale)}–{formatNumber(to, locale)}
        </span>
        <span className="text-muted-foreground">
          {t('common.of') || 'of'} {formatNumber(totalItems, locale)}
        </span>
      </div>
      <div className="flex items-center justify-end gap-2">
        <span className="hidden text-[11px] text-muted-foreground sm:inline">
          {t('common.page') || 'Page'} {formatNumber(currentPage, locale)} /{' '}
          {formatNumber(totalPages || 1, locale)}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || currentPage <= 1}
            onClick={() => go(currentPage - 1)}
          >
            <Prev className="h-4 w-4" />
            <span className="hidden sm:inline">{t('common.prev')}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || currentPage >= totalPages}
            onClick={() => go(currentPage + 1)}
          >
            <span className="hidden sm:inline">{t('common.next')}</span>
            <Next className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
