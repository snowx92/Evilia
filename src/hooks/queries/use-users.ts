'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services/users.service';
import { queryKeys } from '@/lib/query-keys';
import type {
  CreateSellerRequest,
  CreateSubAdminRequest,
  UpdateUserRequest,
  UsersListParams,
} from '@/types/admin/users';

export function useUsersQuery(params: UsersListParams) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => usersService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useUserQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => usersService.getById(userId),
    enabled: Boolean(userId),
  });
}

/**
 * Fetches every user across all pages by walking the cursor sequentially.
 * Use this only when the consumer truly needs the full list (e.g. the
 * hierarchy tree builds parent->child links across the whole org). The first
 * page is capped at the API's per-page limit (~100), so a paginated tree
 * would otherwise silently drop sellers past row 100.
 */
export function useAllUsersQuery(filters: Omit<UsersListParams, 'page' | 'limit'> = {}) {
  return useQuery({
    queryKey: ['users', 'list', 'all', filters],
    queryFn: async () => {
      const PAGE_SIZE = 100;
      const first = await usersService.list({ ...filters, page: 1, limit: PAGE_SIZE });
      const totalPages = first.totalPages ?? 1;
      if (totalPages <= 1) return first;
      const rest = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) =>
          usersService.list({ ...filters, page: i + 2, limit: PAGE_SIZE }),
        ),
      );
      const items = [first.items, ...rest.map((p) => p.items)].flat();
      return { ...first, items, currentPage: 1, totalItems: items.length };
    },
    placeholderData: (prev) => prev,
  });
}

export function useCreateAdminMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSubAdminRequest) => usersService.createAdmin(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users', 'list'] }),
  });
}

export function useCreateSellerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSellerRequest) => usersService.createSeller(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users', 'list'] }),
  });
}

export function useUpdateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, body }: { userId: string; body: UpdateUserRequest }) =>
      usersService.update(userId, body),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
      qc.invalidateQueries({ queryKey: ['users', 'list'] });
    },
  });
}

function optimisticStatusUpdate(
  qc: ReturnType<typeof useQueryClient>,
  userId: string,
  nextStatus: 'active' | 'suspended',
) {
  // Optimistically flip the user in any cached list page or detail entry.
  qc.setQueriesData<{ items?: { id: string; status: string }[] }>(
    { queryKey: ['users', 'list'] },
    (data) => {
      if (!data?.items) return data;
      return {
        ...data,
        items: data.items.map((u) =>
          u.id === userId ? { ...u, status: nextStatus } : u,
        ),
      };
    },
  );
  qc.setQueryData<{ status: string }>(queryKeys.users.detail(userId), (u) =>
    u ? { ...u, status: nextStatus } : u,
  );
}

export function useSuspendUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersService.suspend(userId),
    onMutate: (userId) => optimisticStatusUpdate(qc, userId, 'suspended'),
    onSettled: (_, __, userId) => {
      qc.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
      qc.invalidateQueries({ queryKey: ['users', 'list'] });
    },
  });
}

export function useActivateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersService.activate(userId),
    onMutate: (userId) => optimisticStatusUpdate(qc, userId, 'active'),
    onSettled: (_, __, userId) => {
      qc.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
      qc.invalidateQueries({ queryKey: ['users', 'list'] });
    },
  });
}

export function useChangeUserPasswordMutation() {
  return useMutation({
    mutationFn: ({ userId, password }: { userId: string; password: string }) =>
      usersService.changePassword(userId, password),
  });
}
