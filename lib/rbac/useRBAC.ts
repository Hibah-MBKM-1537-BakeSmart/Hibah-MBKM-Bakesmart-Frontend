/**
 * RBAC React Hook
 * 
 * Custom hook for checking permissions in React components.
 */

'use client';

import { useMemo } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  MenuId,
  SubPageId,
  canAccessMenu,
  canAccessSubPage,
  getAccessibleMenus,
  getAccessibleSubPages,
} from '@/lib/rbac';

interface UseRBACReturn {
  /** Check if user can access a specific menu */
  canAccessMenu: (menuId: MenuId) => boolean;
  /** Check if user can access a specific sub-page */
  canAccessSubPage: (subPageId: SubPageId) => boolean;
  /** Get all menus the user can access */
  accessibleMenus: MenuId[];
  /** Get accessible sub-pages for a specific menu */
  getSubPages: (menuId: MenuId) => SubPageId[];
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth is still loading */
  isLoading: boolean;
}

/**
 * Hook for checking RBAC permissions in components.
 * 
 * @example
 * ```tsx
 * const { canAccessMenu, canAccessSubPage } = useRBAC();
 * 
 * if (canAccessMenu('statistics')) {
 *   // Render statistics section
 * }
 * 
 * if (canAccessSubPage('production:list')) {
 *   // Render production list
 * }
 * ```
 */
export function useRBAC(): UseRBACReturn {
  const { user, isLoading, isAuthenticated } = useAuth();

  const roles = useMemo(() => user?.roles || [], [user?.roles]);

  const checkMenuAccess = useMemo(
    () => (menuId: MenuId): boolean => {
      if (roles.length === 0) return false;
      return canAccessMenu(roles, menuId);
    },
    [roles]
  );

  const checkSubPageAccess = useMemo(
    () => (subPageId: SubPageId): boolean => {
      if (roles.length === 0) return false;
      return canAccessSubPage(roles, subPageId);
    },
    [roles]
  );

  const accessibleMenus = useMemo(
    () => (roles.length > 0 ? getAccessibleMenus(roles) : []),
    [roles]
  );

  const getSubPages = useMemo(
    () => (menuId: MenuId): SubPageId[] => {
      if (roles.length === 0) return [];
      return getAccessibleSubPages(roles, menuId);
    },
    [roles]
  );

  return {
    canAccessMenu: checkMenuAccess,
    canAccessSubPage: checkSubPageAccess,
    accessibleMenus,
    getSubPages,
    isAuthenticated,
    isLoading,
  };
}
