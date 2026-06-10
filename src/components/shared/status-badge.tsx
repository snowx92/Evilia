import { Badge, type BadgeProps } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/use-translation';

const VARIANT_MAP: Record<string, BadgeProps['variant']> = {
  active: 'success',
  achieved: 'success',
  approved: 'success',
  paid: 'success',
  processed: 'success',
  pending: 'warning',
  suspended: 'destructive',
  rejected: 'destructive',
  cancelled: 'muted',
  expired: 'muted',
};

export function StatusBadge({ status }: { status: string | undefined }) {
  const { t } = useTranslation();
  if (!status) return <Badge variant="muted">—</Badge>;
  const variant = VARIANT_MAP[status] ?? 'outline';
  return <Badge variant={variant}>{t(`status.${status}`)}</Badge>;
}
