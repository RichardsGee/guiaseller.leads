import type { ReactNode } from 'react';
import { useAuthStore } from '../../store/authStore';

interface RequireRoleProps {
  roles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Show children only if the user has one of the specified roles.
 * Admin always has access.
 */
export function RequireRole({ roles, children, fallback = null }: RequireRoleProps) {
  const { hasRole } = useAuthStore();

  if (!hasRole(...roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RequirePermissionProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Show children only if the user has the specified permission.
 * Admin always has access.
 */
export function RequirePermission({ permission, children, fallback = null }: RequirePermissionProps) {
  const { hasPermission } = useAuthStore();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook to check if user can perform an action.
 */
export function usePermission(permission: string): boolean {
  const { hasPermission } = useAuthStore();
  return hasPermission(permission);
}

/**
 * Hook to check if user has a role.
 */
export function useRole(...roles: string[]): boolean {
  const { hasRole } = useAuthStore();
  return hasRole(...roles);
}
