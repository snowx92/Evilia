import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/use-translation';

export function RoleBadge({ role }: { role: string | undefined }) {
  const { t } = useTranslation();
  if (!role) return <Badge variant="muted">—</Badge>;
  const label = t(`role.${role}`);
  return <Badge variant={role === 'admin' || role === 'sub-admin' ? 'default' : 'secondary'}>{label}</Badge>;
}
