'use client';

import { useState } from 'react';
import { ChevronsUpDown, X } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSalesQuery } from '@/hooks/queries/use-sales';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { cn, formatCurrency } from '@/lib/utils';
import type { Sale } from '@/types/admin/sales';

type Props = {
  value: Sale | null;
  onChange: (sale: Sale | null) => void;
  className?: string;
  placeholder?: string;
};

export function SalePicker({ value, onChange, className, placeholder }: Props) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const query = useSalesQuery({ page, limit: 50 });
  const items = query.data?.items ?? [];
  const canLoadMore = query.data ? !query.data.isLastPage : false;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          className={cn(
            'group flex h-10 w-full items-center gap-3 rounded-xl border border-input bg-surface px-3 text-sm shadow-sm transition-all',
            'hover:border-border-strong focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15',
            className,
          )}
        >
          {value ? (
            <>
              <span className="flex flex-1 flex-col items-start truncate text-start leading-tight">
                <span className="truncate font-mono text-xs">{value.externalId}</span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {formatCurrency(value.amount, locale, value.currency)} · {value.sellerCode}
                </span>
              </span>
              <span
                role="button"
                tabIndex={-1}
                aria-label={t('common.cancel')}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            </>
          ) : (
            <span className="flex-1 text-start text-muted-foreground">
              {placeholder ?? t('common.search')}
            </span>
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter>
          <CommandInput placeholder={t('common.search')} />
          <CommandList>
            {query.isLoading ? (
              <div className="space-y-2 p-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <>
                <CommandEmpty>{t('common.noResults')}</CommandEmpty>
                <CommandGroup>
                  {items.map((s) => (
                    <CommandItem
                      key={s.id}
                      value={`${s.externalId} ${s.sellerCode} ${s.sellerId} ${s.status}`}
                      onSelect={() => {
                        onChange(s);
                        setOpen(false);
                      }}
                    >
                      <span className="flex flex-1 flex-col leading-tight">
                        <span className="truncate font-mono text-xs">{s.externalId}</span>
                        <span className="truncate text-[11px] text-muted-foreground">
                          {formatCurrency(s.amount, locale, s.currency)} · {s.sellerCode} · {s.status}
                        </span>
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                {canLoadMore && (
                  <div className="p-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={query.isFetching}
                    >
                      {t('common.loadMore')}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
