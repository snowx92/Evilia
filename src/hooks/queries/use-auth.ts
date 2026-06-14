'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import { authService } from '@/services/auth.service';
import { queryKeys } from '@/lib/query-keys';
import { useAuthStore } from '@/store/auth';
import { useLocaleStore } from '@/store/locale';
import { getFirebaseAuth } from '@/lib/firebase';
import type {
  ChangePasswordRequest,
  LoginRequest,
  MeResponse,
  UpdateProfileRequest,
} from '@/types/auth';
import type { PaginationParams } from '@/types/api';

export function useMeQuery(enabled = true) {
  const setMe = useAuthStore((s) => s.setMe);
  const setLocale = useLocaleStore((s) => s.setLocale);

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const me = await authService.me();
      setMe(me);
      if (me.user?.language) setLocale(me.user.language);
      return me;
    },
    enabled,
    staleTime: 60_000,
    retry: false,
  });
}

/**
 * Login flow:
 *   1. POST /v1/auth/login → returns `customAuthToken` (a Firebase custom token)
 *   2. signInWithCustomToken(auth, customAuthToken) → Firebase User
 *   3. user.getIdToken() → Firebase ID token (the actual Bearer for the API)
 *   4. Stash ID token in Zustand for the Axios interceptor; Firebase keeps it
 *      fresh via onIdTokenChanged (wired in AppProviders).
 */
export function useLoginMutation() {
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: LoginRequest) => {
      const loginResult = await authService.login(body);
      const auth = getFirebaseAuth();
      const cred = await signInWithCustomToken(auth, loginResult.customAuthToken);
      const idToken = await cred.user.getIdToken();
      return { ...loginResult, idToken };
    },
    onSuccess: (data) => {
      setToken(data.idToken);
      setUser(data.user);
      qc.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useUpdateProfileMutation() {
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => authService.updateProfile(body),
    onSuccess: (data) => {
      setUser(data.user);
      qc.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (body: ChangePasswordRequest) => authService.changePassword(body),
  });
}

export function useLogout() {
  const reset = useAuthStore((s) => s.reset);
  const qc = useQueryClient();
  return () => {
    void signOut(getFirebaseAuth()).catch(() => {});
    reset();
    qc.clear();
  };
}

export function useNotificationsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.auth.notifications(params.page, params.limit),
    queryFn: () => authService.listNotifications(params),
    staleTime: 30_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => authService.markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth', 'notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authService.markAllNotificationsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth', 'notifications'] }),
  });
}

export function useRegisterFcmToken() {
  return useMutation({ mutationFn: (token: string) => authService.registerFcmToken(token) });
}

export type { MeResponse };
