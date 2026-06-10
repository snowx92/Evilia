'use client';
import { type ReactNode } from 'react';
import { useAuthStore, hasPermission } from '@/store/auth';

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission?: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const allowed = useAuthStore((s) => {
    if (!permission) return true;
    return hasPermission(s, permission);
  });
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
