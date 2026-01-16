/**
 * RBAC Module
 * 
 * Central export for all RBAC functionality.
 */

// Export all configurations
export {
  ROLES,
  MENU_PERMISSIONS,
  SUB_PAGE_PERMISSIONS,
  ROUTE_TO_MENU,
  DEFAULT_REDIRECT,
  PUBLIC_ROUTES,
} from './config';

// Export all types
export type {
  UserRole,
  RoleDefinition,
  MenuId,
  SubPageId,
  Permission,
} from './config';

// Export all utility functions
export {
  canAccessMenu,
  canAccessSubPage,
  canAccessRoute,
  getMenuIdFromPath,
  getAccessibleMenus,
  getAccessibleSubPages,
  getDefaultRedirect,
  getFirstAccessibleRoute,
  isValidRole,
  parseRoles,
} from './utils';

// Export React hook
export { useRBAC } from './useRBAC';

// Export React components
export {
  RBACGuard,
  OwnerOnly,
  CashierAndAbove,
  BakerOnly,
  PackagerOnly,
  AccessDenied,
} from './RBACGuard';
