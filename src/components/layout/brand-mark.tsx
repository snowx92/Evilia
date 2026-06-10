import { cn } from '@/lib/utils';

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative grid place-items-center rounded-xl bg-brand-gradient text-white shadow-card',
        'h-9 w-9',
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M5 6.5C5 5.67 5.67 5 6.5 5h11a1.5 1.5 0 0 1 0 3H8v3h7.5a1.5 1.5 0 0 1 0 3H8v3h9.5a1.5 1.5 0 0 1 0 3h-11A1.5 1.5 0 0 1 5 18.5v-12Z"
          fill="white"
        />
      </svg>
    </div>
  );
}
