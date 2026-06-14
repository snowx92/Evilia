'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

type Props = {
  value: string;
  size?: number;
  className?: string;
};

/**
 * Minimal QR code renderer. Uses the free, long-standing qrserver.com endpoint
 * so we don't pull a 20 KB encoder client-side. Swap the URL for a local
 * encoder later if external calls become a concern.
 */
export function QrCode({ value, size = 160, className }: Props) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(value)}`;
  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-card',
        className,
      )}
      style={{ width: size + 16, height: size + 16 }}
    >
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        unoptimized
        className="h-full w-full object-contain"
      />
    </div>
  );
}
