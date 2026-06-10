'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services/users.service';
import { queryKeys } from '@/lib/query-keys';
import type {
  CreateSubAdminRequest,
  CreateMemberRequest,
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

export function useCreateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSubAdminRequest) => usersService.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users', 'list'] }),
  });
}

export function useCreateMemberMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateMemberRequest) => usersService.createMember(body),
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

export function useSuspendUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersService.suspend(userId),
    onSuccess: (_, userId) => {
      qc.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
      qc.invalidateQueries({ queryKey: ['users', 'list'] });
    },
  });
}

export function useActivateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersService.activate(userId),
    onSuccess: (_, userId) => {
      qc.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
      qc.invalidateQueries({ queryKey: ['users', 'list'] });
    },
  });
}
