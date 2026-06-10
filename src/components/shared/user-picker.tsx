'use client';

import { useState, useMemo } from 'react';
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
import { Avatar, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUsersQuery } from '@/hooks/queries/use-users';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import type { User, UserRole, UserStatus } from '@/types/auth';

type Props = {
  value: User | null;
  onChange: (user: User | null) => void;
  placeholder?: string;
  role?: UserRole;
  status?: UserStatus;
  className?: string;
  /** Number of users to pre-load. Above this, users filter what they typed and we add a load-more affordance. */
  pageSize?: number;
};

export function UserPicker({
  value,
  onChange,
  placeholder,
  role,
  status,
  className,
  pageSize = 50,
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);

  const query = useUsersQuery({
    page,
    limit: pageSize,
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
  });

  // Accumulate across paginations for "load more"
  const allUsers = useMemo<User[]>(() => {
    if (!query.data) return [];
    return query.data.items;
  }, [query.data]);

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
              <Avatar className="h-6 w-6">
                <AvatarFallback>{getInitials(value.displayName)}</AvatarFallback>
              </Avatar>
              <span className="flex flex-1 flex-col items-start truncate text-start leading-tight">
                <span className="truncate font-medium">{value.displayName}</span>
                <span className="truncate text-[11px] text-muted-foreground">{value.email}</span>
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
                  {allUsers.map((u) => {
                    // cmdk uses value for filtering — include searchable fields
                    const filterValue = `${u.displayName} ${u.email} ${u.sellerCode ?? ''}`;
                    return (
                      <CommandItem
                        key={u.id}
                        value={filterValue}
                        onSelect={() => {
                          onChange(u);
                          setOpen(false);
                        }}
                      >
                        <Avatar className="h-7 w-7">
                          <AvatarFallback>{getInitials(u.displayName)}</AvatarFallback>
                        </Avatar>
                        <span className="flex flex-1 flex-col leading-tight">
                          <span className="truncate text-sm font-medium">{u.displayName}</span>
                          <span className="truncate text-[11px] text-muted-foreground">
                            {u.email}
                            {u.sellerCode ? ` · ${u.sellerCode}` : ''}
                          </span>
                        </span>
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                          {u.role}
                        </span>
                      </CommandItem>
                    );
                  })}
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
