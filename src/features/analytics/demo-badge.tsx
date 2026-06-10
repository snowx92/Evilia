import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DemoBadge({
  show,
  className,
  label = 'بيانات معاينة',
}: {
  show: boolean;
  className?: string;
  label?: string;
}) {
  if (!show) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-warning-foreground ring-1 ring-inset ring-warning/30',
        className,
      )}
    >
      <Sparkles className="h-3 w-3" />
      {label}
    </span>
  );
}
