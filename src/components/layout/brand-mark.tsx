import Image from 'next/image';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  /** Pixel size of the rendered mark (square). Defaults to 36 (h-9 w-9). */
  size?: number;
};

export function BrandMark({ className, size = 36 }: Props) {
  return (
    <div
      className={cn(
        'relative grid shrink-0 place-items-center overflow-hidden rounded-xl bg-white shadow-card ring-1 ring-border/60',
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Image
        src="/logo.png"
        alt=""
        width={size}
        height={size}
        priority
        className="h-full w-full object-contain"
      />
    </div>
  );
}
