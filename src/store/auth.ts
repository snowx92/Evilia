import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Locale, MeResponse, User, Wallet, PermissionCatalogEntry } from '@/types/auth';

type AuthState = {
  token: string | null;
  user: User | null;
  wallet: Wallet | null;
  permissionCatalog: PermissionCatalogEntry[];
  effectivePermissions: string[];
  hydrated: boolean;
  firebaseReady: boolean;
  setToken: (token: string) => void;
  setMe: (me: MeResponse) => void;
  setUser: (user: User) => void;
  setWallet: (wallet: Wallet) => void;
  setLocale: (locale: Locale) => void;
  setFirebaseReady: (ready: boolean) => void;
  reset: () => void;
};

const initial = {
  token: null as string | null,
  user: null as User | null,
  wallet: null as Wallet | null,
  permissionCatalog: [] as PermissionCatalogEntry[],
  effectivePermissions: [] as string[],
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initial,
      hydrated: false,
      firebaseReady: false,
      setToken: (token) => set({ token }),
      setMe: ({ user, wallet, permissionCatalog, effectivePermissions }) =>
        set({ user, wallet, permissionCatalog, effectivePermissions }),
      setUser: (user) => set({ user }),
      setWallet: (wallet) => set({ wallet }),
      setLocale: (locale) =>
        set((state) => (state.user ? { user: { ...state.user, language: locale } } : {})),
      setFirebaseReady: (ready) => set({ firebaseReady: ready }),
      // Keep `firebaseReady` after reset so /login renders immediately.
      reset: () => set({ ...initial, firebaseReady: true }),
    }),
    {
      name: 'Luna Care-auth',
      storage: createJSONStorage(() => localStorage),
      // The Bearer token is a Firebase ID token (~1h TTL) refreshed at runtime
      // via onIdTokenChanged. We persist `user` only — the token re-derives from
      // the Firebase Auth session that lives in IndexedDB.
      partialize: (state) => ({
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

export const hasPermission = (state: AuthState, key: string): boolean => {
  if (!state.user) return false;
  if (state.user.isSuperAdmin) return true;
  return state.effectivePermissions.includes(key);
};
