'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { useMeQuery, useRegisterFcmToken } from '@/hooks/queries/use-auth';
import { Loader2 } from 'lucide-react';
import { BrandMark } from '@/components/layout/brand-mark';
import { onForegroundMessage, requestFcmToken } from '@/lib/fcm';
import { isFcmConfigured } from '@/lib/env';
import { toast } from '@/components/ui/sonner';

type AuthGuardProps = {
  children: ReactNode;
  /** When set, redirect away if the authed user's role doesn't match. */
  requiredRole?: 'admin' | 'seller';
  /** Sign-in page path for this section. Default: `/login`. */
  loginPath?: string;
};

export function AuthGuard({
  children,
  requiredRole,
  loginPath = '/login',
}: AuthGuardProps) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const firebaseReady = useAuthStore((s) => s.firebaseReady);
  const registerFcm = useRegisterFcmToken();

  // Wait until BOTH the persisted store has rehydrated AND Firebase has had a
  // chance to restore its session (the Bearer token re-derives from Firebase,
  // see store/auth.ts). Without `firebaseReady`, the redirect fires before the
  // token has a chance to land — kicking the user back to /login on every reload.
  useEffect(() => {
    if (hydrated && firebaseReady && !token) router.replace(loginPath);
  }, [hydrated, firebaseReady, token, loginPath, router]);

  const me = useMeQuery(Boolean(token));

  // Role gate — once we know who's logged in, bounce them into their own area
  // if they landed on the wrong dashboard. Admins land on /admin, sellers /seller.
  useEffect(() => {
    if (!requiredRole || !user) return;
    if (user.role === requiredRole) return;
    if (user.role === 'seller') router.replace('/seller');
    else router.replace('/admin');
  }, [requiredRole, user, router]);
  const qc = useQueryClient();

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

  // Foreground push: while the tab is open, FCM doesn't fire the SW path.
  // Hook into onMessage so we can surface the alert and refresh the inbox.
  useEffect(() => {
    if (!token || !isFcmConfigured) return;
    let unsubscribe: (() => void) | undefined;
    void onForegroundMessage((payload) => {
      const title = payload.notification?.title ?? 'Evilia';
      const body = payload.notification?.body;
      toast(title, { description: body });
      qc.invalidateQueries({ queryKey: ['auth', 'notifications'] });
    }).then((u) => {
      unsubscribe = u;
    });
    return () => {
      unsubscribe?.();
    };
  }, [token, qc]);

  const roleMismatch = requiredRole && user && user.role !== requiredRole;

  if (!hydrated || !firebaseReady || !token || me.isLoading || roleMismatch) {
    return (
      <div className="grid min-h-dvh place-items-center bg-gradient-to-br from-primary-soft/30 via-background to-background p-6">
        <div className="flex flex-col items-center gap-4">
          <BrandMark size={56} />
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Evilia</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
