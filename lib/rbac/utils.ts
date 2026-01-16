/**
 * RBAC Utility Functions
 * 
 * Helper functions for checking permissions and access control.
 */

import {
  UserRole,
  MenuId,
  SubPageId,
  MENU_PERMISSIONS,
  SUB_PAGE_PERMISSIONS,
  ROUTE_TO_MENU,
  DEFAULT_REDIRECT,
  PUBLIC_ROUTES,
} from './config';

// ============================================================================
// PERMISSION CHECK FUNCTIONS
// ============================================================================

/**
 * Check if a role has access to a specific menu.
 * @param role - The user's role
 * @param menuId - The menu identifier
 * @returns boolean - Whether the role can access the menu
 */
export function canAccessMenu(role: UserRole | UserRole[], menuId: MenuId): boolean {
  const permission = MENU_PERMISSIONS.find(p => p.menuId === menuId);
  
  if (!permission) {
    // If menu not defined in permissions, deny access by default
    console.warn(`[RBAC] Menu "${menuId}" not found in permissions config`);
    return false;
  }

  // Handle both single role and array of roles
  const roles = Array.isArray(role) ? role : [role];
  
  return roles.some(r => permission.allowedRoles.includes(r));
}

/**
 * Check if a role has access to a specific sub-page.
 * @param role - The user's role
 * @param subPageId - The sub-page identifier
 * @returns boolean - Whether the role can access the sub-page
 */
export function canAccessSubPage(role: UserRole | UserRole[], subPageId: SubPageId): boolean {
  const allowedRoles = SUB_PAGE_PERMISSIONS[subPageId];
  
  if (!allowedRoles) {
    console.warn(`[RBAC] Sub-page "${subPageId}" not found in permissions config`);
    return false;
  }

  const roles = Array.isArray(role) ? role : [role];
  
  return roles.some(r => allowedRoles.includes(r));
}

/**
 * Check if a role can access a specific route/path.
 * @param role - The user's role
 * @param path - The URL path to check
 * @returns boolean - Whether the role can access the route
 */
export function canAccessRoute(role: UserRole | UserRole[], path: string): boolean {
  // Public routes are accessible to everyone
  if (PUBLIC_ROUTES.includes(path)) {
    return true;
  }

  // Find the menu ID for this route
  const menuId = getMenuIdFromPath(path);
  
  if (!menuId) {
    // If route not mapped, check if it's a sub-route of a known menu
    const parentMenu = findParentMenuId(path);
    if (parentMenu) {
      return canAccessMenu(role, parentMenu);
    }
    
    // Unknown route - deny access
    console.warn(`[RBAC] Route "${path}" not found in route mapping`);
    return false;
  }

  return canAccessMenu(role, menuId);
}

/**
 * Get the menu ID from a URL path.
 * @param path - The URL path
 * @returns MenuId | null - The menu identifier or null if not found
 */
export function getMenuIdFromPath(path: string): MenuId | null {
  // Direct match first
  if (ROUTE_TO_MENU[path]) {
    return ROUTE_TO_MENU[path];
  }

  // Try to find parent route match
  return findParentMenuId(path);
}

/**
 * Find parent menu ID for nested routes.
 * @param path - The URL path
 * @returns MenuId | null
 */
function findParentMenuId(path: string): MenuId | null {
  const routes = Object.keys(ROUTE_TO_MENU);
  
  for (const route of routes) {
    if (path.startsWith(route + '/') || path === route) {
      return ROUTE_TO_MENU[route];
    }
  }
  
  return null;
}

/**
 * Get all accessible menus for a role.
 * @param role - The user's role
 * @returns MenuId[] - Array of accessible menu IDs
 */
export function getAccessibleMenus(role: UserRole | UserRole[]): MenuId[] {
  const roles = Array.isArray(role) ? role : [role];
  
  return MENU_PERMISSIONS
    .filter(permission => roles.some(r => permission.allowedRoles.includes(r)))
    .map(permission => permission.menuId);
}

/**
 * Get all accessible sub-pages for a role within a menu.
 * @param role - The user's role
 * @param menuId - The menu identifier
 * @returns SubPageId[] - Array of accessible sub-page IDs
 */
export function getAccessibleSubPages(role: UserRole | UserRole[], menuId: MenuId): SubPageId[] {
  const roles = Array.isArray(role) ? role : [role];
  const prefix = `${menuId}:`;
  
  const subPages = Object.entries(SUB_PAGE_PERMISSIONS)
    .filter(([subPageId, allowedRoles]) => {
      return subPageId.startsWith(prefix) && roles.some(r => allowedRoles.includes(r));
    })
    .map(([subPageId]) => subPageId as SubPageId);

  return subPages;
}

/**
 * Get the default redirect path for a role.
 * @param role - The user's role (uses first role if array)
 * @returns string - The default redirect path
 */
export function getDefaultRedirect(role: UserRole | UserRole[]): string {
  const primaryRole = Array.isArray(role) ? role[0] : role;
  return DEFAULT_REDIRECT[primaryRole] || '/admin/login';
}

/**
 * Get the first accessible route for a role (for unauthorized redirects).
 * @param role - The user's role
 * @returns string - First accessible route or login page
 */
export function getFirstAccessibleRoute(role: UserRole | UserRole[]): string {
  const accessibleMenus = getAccessibleMenus(role);
  
  if (accessibleMenus.length === 0) {
    return '/admin/login';
  }

  // Find the first route that maps to an accessible menu
  const firstMenu = accessibleMenus[0];
  const route = Object.entries(ROUTE_TO_MENU).find(([, menuId]) => menuId === firstMenu);
  
  return route ? route[0] : '/admin/login';
}

// ============================================================================
// ROLE VALIDATION
// ============================================================================

/**
 * Validate if a string is a valid role.
 * @param role - The role string to validate
 * @returns boolean - Whether the role is valid
 */
export function isValidRole(role: string): role is UserRole {
  return ['owner', 'cashier', 'baker', 'packager'].includes(role);
}

/**
 * Parse roles from backend response.
 * Backend may return roles as array of objects or strings.
 * @param roles - Raw roles data from backend
 * @returns UserRole[] - Array of valid UserRole values
 */
export function parseRoles(roles: unknown): UserRole[] {
  if (!roles) return [];
  
  let roleNames: string[] = [];

  if (Array.isArray(roles)) {
    roleNames = roles.map(r => {
      if (typeof r === 'string') return r;
      if (typeof r === 'object' && r !== null && 'name' in r) return (r as { name: string }).name;
      return '';
    }).filter(Boolean);
  } else if (typeof roles === 'string') {
    roleNames = [roles];
  }

  return roleNames.filter(isValidRole);
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type { UserRole, MenuId, SubPageId };
