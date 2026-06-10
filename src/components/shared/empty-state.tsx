import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

function DefaultIllustration() {
  return (
    <svg
      width="120"
      height="80"
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="evilia-empty-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect x="14" y="14" width="92" height="56" rx="14" fill="url(#evilia-empty-grad)" />
      <rect x="24" y="26" width="42" height="6" rx="3" fill="white" opacity="0.9" />
      <rect x="24" y="38" width="62" height="4" rx="2" fill="white" opacity="0.65" />
      <rect x="24" y="46" width="50" height="4" rx="2" fill="white" opacity="0.45" />
      <circle cx="92" cy="58" r="9" fill="white" opacity="0.95" />
      <path
        d="M88.5 58l2.5 2.5 4.5-4.5"
        stroke="#4f46e5"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EmptyState({
  title,
  description,
  action,
  illustration,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  illustration?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-surface/40 py-16 text-center',
        className,
      )}
    >
      <div className="opacity-90">{illustration ?? <DefaultIllustration />}</div>
      <div className="max-w-sm space-y-1">
        <p className="text-base font-semibold">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
