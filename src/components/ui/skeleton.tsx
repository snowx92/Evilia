import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative isolate overflow-hidden rounded-md bg-muted/70',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent rtl:before:translate-x-full rtl:before:animate-[shimmer-rtl_1.6s_infinite]',
        className,
      )}
      {...props}
    />
  );
}

/* keyframes are defined inline via @keyframes for portability */
const styleId = 'Luna Care-skeleton-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes shimmer { 100% { transform: translateX(100%); } }
    @keyframes shimmer-rtl { 100% { transform: translateX(-100%); } }
  `;
  document.head.appendChild(style);
}

export { Skeleton };
