'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && token) router.replace('/admin');
  }, [hydrated, token, router]);

  return (
    <div className="grid min-h-dvh place-items-center bg-gradient-to-br from-muted/40 via-background to-background p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
