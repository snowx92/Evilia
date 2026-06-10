'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useMeQuery, useRegisterFcmToken } from '@/hooks/queries/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { requestFcmToken } from '@/lib/fcm';
import { isFcmConfigured } from '@/lib/env';

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);
  const registerFcm = useRegisterFcmToken();

  useEffect(() => {
    if (hydrated && !token) router.replace('/login');
  }, [hydrated, token, router]);

  const me = useMeQuery(Boolean(token));

  // Best-effort FCM bootstrap — runs once after the session is good.
  useEffect(() => {
    if (!token || !me.data || !isFcmConfigured) return;
    let cancelled = false;
    (async () => {
      const fcmToken = await requestFcmToken();
      if (cancelled || !fcmToken) return;
      registerFcm.mutate(fcmToken);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, me.data]);

  if (!hydrated || !token || me.isLoading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-muted/30 p-6">
        <div className="w-full max-w-sm space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
