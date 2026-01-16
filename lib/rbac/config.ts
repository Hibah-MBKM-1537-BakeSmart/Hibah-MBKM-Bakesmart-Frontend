/**
 * Role-Based Access Control (RBAC) Configuration
 * 
 * This file defines all roles, permissions, and access rules for the application.
 * Centralized configuration makes it easy to maintain and scale.
 */

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

export type UserRole = 'owner' | 'cashier' | 'baker' | 'packager';

export interface RoleDefinition {
  id: number;
  name: UserRole;
  displayName: string;
  description: string;
}

export const ROLES: Record<UserRole, RoleDefinition> = {
  owner: {
    id: 1,
    name: 'owner',
    displayName: 'Owner',
    description: 'Owner/Pemilik - Akses penuh ke semua fitur',
  },
  cashier: {
    id: 3,
    name: 'cashier',
    displayName: 'Kasir',
    description: 'Kasir - Akses manajemen pesanan dan customer',
  },
  baker: {
    id: 2,
    name: 'baker',
    displayName: 'Tukang Roti',
    description: 'Tukang Roti - Akses produksi dan status produksi',
  },
  packager: {
    id: 4,
    name: 'packager',
    displayName: 'Packager',
    description: 'Packager/Packer - Akses pengemasan dan status pesanan',
  },
};

// ============================================================================
// MENU/PAGE IDENTIFIERS
// ============================================================================

export type MenuId = 
  | 'dashboard'
  | 'statistics'
  | 'products'
  | 'production'
  | 'kasir'
  | 'history'
  | 'customers'
  | 'vouchers'
  | 'users'
  | 'settings';

// Sub-page identifiers for granular control
export type SubPageId = 
  | 'production:list'      // Daftar Produksi (Production List)
  | 'production:manage';   // Kelola Order (Manage Order)

// ============================================================================
// PERMISSION DEFINITIONS
// ============================================================================

export interface Permission {
  menuId: MenuId;
  subPages?: SubPageId[];
  allowedRoles: UserRole[];
}

/**
 * Menu Permissions Configuration
 * 
 * Defines which roles can access which menus and sub-pages.
 * This is the single source of truth for access control.
 */
export const MENU_PERMISSIONS: Permission[] = [
  {
    menuId: 'dashboard',
    allowedRoles: ['owner', 'cashier'],
  },
  {
    menuId: 'statistics',
    allowedRoles: ['owner'], // Cashier tidak boleh akses Statistics
  },
  {
    menuId: 'products',
    allowedRoles: ['owner', 'cashier'],
  },
  {
    menuId: 'production',
    allowedRoles: ['owner', 'cashier', 'baker', 'packager'],
    // Sub-page permissions defined separately
  },
  {
    menuId: 'kasir',
    allowedRoles: ['owner', 'cashier'],
  },
  {
    menuId: 'history',
    allowedRoles: ['owner', 'cashier'],
  },
  {
    menuId: 'customers',
    allowedRoles: ['owner', 'cashier'],
  },
  {
    menuId: 'vouchers',
    allowedRoles: ['owner', 'cashier'],
  },
  {
    menuId: 'users',
    allowedRoles: ['owner'], // Cashier tidak boleh akses Users
  },
  {
    menuId: 'settings',
    allowedRoles: ['owner', 'cashier'],
  },
];

/**
 * Sub-Page Permissions Configuration
 * 
 * Granular control for pages with multiple sections/tabs.
 */
export const SUB_PAGE_PERMISSIONS: Record<SubPageId, UserRole[]> = {
  'production:list': ['owner', 'cashier', 'baker'],     // Daftar Produksi - Baker bisa akses
  'production:manage': ['owner', 'cashier', 'packager'], // Kelola Order - Packager bisa akses
};

// ============================================================================
// ROUTE TO MENU MAPPING
// ============================================================================

/**
 * Maps URL paths to menu IDs for route protection.
 * Add new routes here when creating new pages.
 */
export const ROUTE_TO_MENU: Record<string, MenuId> = {
  '/admin/dashboard': 'dashboard',
  '/admin/statistics': 'statistics',
  '/admin/products': 'products',
  '/admin/production': 'production',
  '/admin/kasir': 'kasir',
  '/admin/history': 'history',
  '/admin/customers': 'customers',
  '/admin/vouchers': 'vouchers',
  '/admin/users': 'users',
  '/admin/settings': 'settings',
};

// ============================================================================
// DEFAULT REDIRECT PATHS
// ============================================================================

/**
 * Default landing page for each role after login.
 */
export const DEFAULT_REDIRECT: Record<UserRole, string> = {
  owner: '/admin/dashboard',
  cashier: '/admin/dashboard',
  baker: '/admin/production',
  packager: '/admin/production',
};

// ============================================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================================

export const PUBLIC_ROUTES = [
  '/admin/login',
];
