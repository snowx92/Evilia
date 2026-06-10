'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from './empty-state';
import { ErrorState } from './error-state';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { fadeUp, stagger } from '@/lib/motion';

export type Column<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headClassName?: string;
};

type Props<T> = {
  data: T[] | undefined;
  columns: Column<T>[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  getRowKey: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  className?: string;
};

export function DataTable<T>({
  data,
  columns,
  isLoading,
  isError,
  onRetry,
  emptyTitle,
  emptyDescription,
  getRowKey,
  onRowClick,
  className,
}: Props<T>) {
  const { t } = useTranslation();

  if (isError) return <ErrorState onRetry={onRetry} />;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card',
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((c) => (
              <TableHead key={c.key} className={c.headClassName}>
                {c.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <motion.tbody
          variants={stagger}
          initial="hidden"
          animate={isLoading ? 'hidden' : 'show'}
          className="[&_tr:last-child]:border-0"
        >
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                {columns.map((c) => (
                  <TableCell key={c.key}>
                    <Skeleton className="h-4 w-full max-w-[160px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data && data.length > 0 ? (
            data.map((row, idx) => (
              <motion.tr
                key={getRowKey(row, idx)}
                variants={fadeUp}
                className={cn(
                  'border-b transition-colors hover:bg-primary-soft/30',
                  onRowClick && 'cursor-pointer',
                )}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((c) => (
                  <TableCell key={c.key} className={c.className}>
                    {c.cell(row)}
                  </TableCell>
                ))}
              </motion.tr>
            ))
          ) : null}
        </motion.tbody>
      </Table>
      {!isLoading && (!data || data.length === 0) && (
        <div className="p-6">
          <EmptyState title={emptyTitle ?? t('common.noResults')} description={emptyDescription} />
        </div>
      )}
    </div>
  );
}
