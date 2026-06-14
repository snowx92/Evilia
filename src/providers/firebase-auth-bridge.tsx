'use client';

import { useEffect, type ReactNode } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { useAuthStore } from '@/store/auth';
import { isFirebaseConfigured } from '@/lib/env';

/**
 * Keeps the Zustand Bearer token in sync with the live Firebase ID token.
 *
 * - On initial mount (and after a hard reload) Firebase rehydrates the user
 *   from IndexedDB; we copy the current ID token into the store so requests
 *   resume working without a re-login.
 * - Firebase auto-refreshes the ID token every ~55min. `onIdTokenChanged`
 *   fires for each refresh, and we mirror it.
 * - On signOut Firebase passes `null`; we clear the store + downstream caches.
 */
export function FirebaseAuthBridge({ children }: { children: ReactNode }) {
  useEffect(() => {
    // If Firebase isn't wired, unblock AuthGuard immediately — otherwise it
    // would spin on the loader forever waiting for the bridge.
    if (!isFirebaseConfigured) {
      useAuthStore.getState().setFirebaseReady(true);
      return;
    }
    const auth = getFirebaseAuth();
    const unsubscribe = onIdTokenChanged(auth, async (fbUser) => {
      const { setToken, reset, setFirebaseReady, user } = useAuthStore.getState();
      if (!fbUser) {
        // If we already have no token, this was just initial load with no user — no-op.
        if (useAuthStore.getState().token || user) reset();
        setFirebaseReady(true);
        return;
      }
      try {
        const idToken = await fbUser.getIdToken();
        setToken(idToken);
      } catch {
        reset();
      } finally {
        setFirebaseReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  return <>{children}</>;
}
