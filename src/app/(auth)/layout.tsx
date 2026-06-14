'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated || !token) return;
    router.replace(user?.role === 'seller' ? '/seller' : '/admin');
  }, [hydrated, token, user, router]);

  return <div className="min-h-dvh bg-background">{children}</div>;
}
