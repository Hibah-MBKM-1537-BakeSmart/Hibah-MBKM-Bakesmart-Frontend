/**
 * RBAC Guard Component
 * 
 * Wrapper components for role-based conditional rendering.
 */

'use client';

import React from 'react';
import { useRBAC } from './useRBAC';
import { MenuId, SubPageId, UserRole } from './config';

// ============================================================================
// RBAC GUARD COMPONENT
// ============================================================================

interface RBACGuardProps {
  children: React.ReactNode;
  /** Menu ID to check access for */
  menuId?: MenuId;
  /** Sub-page ID to check access for */
  subPageId?: SubPageId;
  /** Required role(s) */
  roles?: UserRole | UserRole[];
  /** Fallback component to render if access denied */
  fallback?: React.ReactNode;
}

/**
 * Conditional render component based on RBAC permissions.
 * 
 * @example
 * ```tsx
 * // Check menu access
 * <RBACGuard menuId="statistics">
 *   <StatisticsComponent />
 * </RBACGuard>
 * 
 * // Check sub-page access
 * <RBACGuard subPageId="production:list">
 *   <ProductionListComponent />
 * </RBACGuard>
 * 
 * // Check specific roles
 * <RBACGuard roles={['owner', 'cashier']}>
 *   <AdminFeatureComponent />
 * </RBACGuard>
 * 
 * // With fallback
 * <RBACGuard menuId="users" fallback={<AccessDenied />}>
 *   <UsersManagement />
 * </RBACGuard>
 * ```
 */
export function RBACGuard({
  children,
  menuId,
  subPageId,
  roles,
  fallback = null,
}: RBACGuardProps): React.ReactElement | null {
  const { canAccessMenu, canAccessSubPage, isLoading } = useRBAC();
  const { user } = require('@/app/contexts/AuthContext').useAuth();

  // Show nothing while loading
  if (isLoading) {
    return null;
  }

  // Check menu access
  if (menuId && !canAccessMenu(menuId)) {
    return <>{fallback}</>;
  }

  // Check sub-page access
  if (subPageId && !canAccessSubPage(subPageId)) {
    return <>{fallback}</>;
  }

  // Check role access
  if (roles) {
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    const userRoles = user?.roles || [];
    const hasRole = requiredRoles.some((r) => userRoles.includes(r));
    if (!hasRole) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

// ============================================================================
// ROLE SPECIFIC GUARDS
// ============================================================================

interface RoleGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Render children only for Owner role.
 */
export function OwnerOnly({ children, fallback = null }: RoleGuardProps) {
  return (
    <RBACGuard roles="owner" fallback={fallback}>
      {children}
    </RBACGuard>
  );
}

/**
 * Render children only for Cashier role (or higher).
 */
export function CashierAndAbove({ children, fallback = null }: RoleGuardProps) {
  return (
    <RBACGuard roles={['owner', 'cashier']} fallback={fallback}>
      {children}
    </RBACGuard>
  );
}

/**
 * Render children only for Baker role.
 */
export function BakerOnly({ children, fallback = null }: RoleGuardProps) {
  return (
    <RBACGuard roles={['owner', 'baker']} fallback={fallback}>
      {children}
    </RBACGuard>
  );
}

/**
 * Render children only for Packager role.
 */
export function PackagerOnly({ children, fallback = null }: RoleGuardProps) {
  return (
    <RBACGuard roles={['owner', 'packager']} fallback={fallback}>
      {children}
    </RBACGuard>
  );
}

// ============================================================================
// ACCESS DENIED COMPONENT
// ============================================================================

interface AccessDeniedProps {
  message?: string;
  showHomeButton?: boolean;
}

/**
 * Standard access denied component.
 */
export function AccessDenied({
  message = 'Anda tidak memiliki izin untuk mengakses halaman ini.',
  showHomeButton = true,
}: AccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: '#fee2e2' }}
      >
        <svg
          className="w-8 h-8 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-bold mb-2" style={{ color: '#5d4037' }}>
        Akses Ditolak
      </h2>
      <p className="text-gray-600 mb-4 max-w-md">{message}</p>
      {showHomeButton && (
        <a
          href="/admin/dashboard"
          className="px-4 py-2 rounded-lg text-white transition-colors"
          style={{ backgroundColor: '#8b6f47' }}
        >
          Kembali ke Dashboard
        </a>
      )}
    </div>
  );
}
