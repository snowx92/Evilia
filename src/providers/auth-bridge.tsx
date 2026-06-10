'use client';

import { useEffect, useLayoutEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { configureAuthBridge } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function AuthBridge({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useIsomorphicLayoutEffect(() => {
    configureAuthBridge({
      getToken: () => useAuthStore.getState().token,
      onUnauthorized: () => {
        useAuthStore.getState().reset();
        if (pathname !== '/login') router.replace('/login');
      },
    });
  }, [router, pathname]);

  return <>{children}</>;
}
