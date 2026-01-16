# Frontend RBAC Implementation Guide

## Overview

Sistem Role-Based Access Control (RBAC) ini mengontrol akses menu sidebar dan halaman berdasarkan role pengguna. Implementasi ini terintegrasi dengan backend API dan bersifat scalable.

## Struktur File

```
lib/rbac/
├── config.ts       # Konfigurasi roles dan permissions
├── utils.ts        # Utility functions untuk permission checking
├── useRBAC.ts      # React hook untuk RBAC
├── RBACGuard.tsx   # React components untuk conditional rendering
└── index.ts        # Central export
```

## Role Definitions

| Role | Akses Menu | Catatan |
|------|------------|---------|
| **owner** | Semua menu | Akses penuh |
| **cashier** | Semua kecuali Statistics & Users | - |
| **baker** | Production (Daftar Produksi saja) | - |
| **packager** | Production (Kelola Order saja) | - |

## Cara Penggunaan

### 1. Mengecek Akses di Component

```tsx
import { useRBAC } from '@/lib/rbac';

function MyComponent() {
  const { canAccessMenu, canAccessSubPage } = useRBAC();
  
  // Cek akses menu
  if (canAccessMenu('statistics')) {
    // Render komponen statistik
  }
  
  // Cek akses sub-page
  if (canAccessSubPage('production:list')) {
    // Render daftar produksi
  }
}
```

### 2. Conditional Rendering dengan RBACGuard

```tsx
import { RBACGuard, OwnerOnly, AccessDenied } from '@/lib/rbac';

function AdminFeatures() {
  return (
    <>
      {/* Berdasarkan menu */}
      <RBACGuard menuId="statistics">
        <StatisticsComponent />
      </RBACGuard>
      
      {/* Berdasarkan sub-page */}
      <RBACGuard subPageId="production:list">
        <ProductionListComponent />
      </RBACGuard>
      
      {/* Berdasarkan role */}
      <RBACGuard roles={['owner', 'cashier']}>
        <CashierFeatures />
      </RBACGuard>
      
      {/* Dengan fallback */}
      <RBACGuard menuId="users" fallback={<AccessDenied />}>
        <UsersManagement />
      </RBACGuard>
      
      {/* Role-specific shortcuts */}
      <OwnerOnly>
        <AdminOnlyFeature />
      </OwnerOnly>
    </>
  );
}
```

### 3. Menggunakan useAuth untuk Role Checking

```tsx
import { useAuth } from '@/app/contexts/AuthContext';

function MyComponent() {
  const { user, hasRole, canAccess, primaryRole } = useAuth();
  
  // Cek apakah user memiliki role tertentu
  if (hasRole('owner')) {
    // Owner-only logic
  }
  
  // Cek apakah user bisa akses path tertentu
  if (canAccess('/admin/statistics')) {
    // Render link ke statistics
  }
  
  // Ambil role utama
  console.log(`Primary role: ${primaryRole}`);
}
```

## Menambah Role Baru

### 1. Update config.ts

```typescript
// Di lib/rbac/config.ts

// Tambah ke UserRole type
export type UserRole = 'owner' | 'cashier' | 'baker' | 'packager' | 'new_role';

// Tambah ke ROLES object
export const ROLES: Record<UserRole, RoleDefinition> = {
  // ... existing roles
  new_role: {
    id: 6,
    name: 'new_role',
    displayName: 'New Role',
    description: 'Deskripsi role baru',
  },
};

// Update MENU_PERMISSIONS untuk role baru
export const MENU_PERMISSIONS: Permission[] = [
  {
    menuId: 'dashboard',
    allowedRoles: ['owner', 'cashier', 'new_role'], // Tambah new_role
  },
  // ... permissions lainnya
];

// Update DEFAULT_REDIRECT
export const DEFAULT_REDIRECT: Record<UserRole, string> = {
  // ... existing
  new_role: '/admin/dashboard',
};
```

### 2. Update utils.ts

```typescript
// Di lib/rbac/utils.ts

// Update isValidRole function
export function isValidRole(role: string): role is UserRole {
  return ['owner', 'cashier', 'baker', 'packager', 'new_role'].includes(role);
}
```

## Menambah Menu Baru

### 1. Update config.ts

```typescript
// Tambah ke MenuId type
export type MenuId = 
  | 'dashboard'
  // ... existing menus
  | 'new_menu';

// Tambah ke MENU_PERMISSIONS
export const MENU_PERMISSIONS: Permission[] = [
  // ... existing
  {
    menuId: 'new_menu',
    allowedRoles: ['owner', 'cashier'],
  },
];

// Tambah ke ROUTE_TO_MENU
export const ROUTE_TO_MENU: Record<string, MenuId> = {
  // ... existing
  '/admin/new-menu': 'new_menu',
};
```

### 2. Update AdminSidebar.tsx

```tsx
// Tambah menu item baru ke menuItems array
const menuItems: MenuItem[] = [
  // ... existing items
  {
    id: 'new_menu',
    labelKey: 'sidebar.newMenu',
    href: '/admin/new-menu',
    icon: NewMenuIcon,
  },
];
```

## Menambah Sub-Page Permission

### 1. Update config.ts

```typescript
// Tambah ke SubPageId type
export type SubPageId = 
  | 'production:list'
  | 'production:manage'
  | 'new_menu:section1'   // Tambah sub-page baru
  | 'new_menu:section2';

// Tambah ke SUB_PAGE_PERMISSIONS
export const SUB_PAGE_PERMISSIONS: Record<SubPageId, UserRole[]> = {
  // ... existing
  'new_menu:section1': ['owner', 'cashier'],
  'new_menu:section2': ['owner'],
};
```

### 2. Gunakan di Component

```tsx
function NewMenuPage() {
  const { canAccessSubPage } = useRBAC();
  
  return (
    <div>
      {canAccessSubPage('new_menu:section1') && (
        <Section1 />
      )}
      {canAccessSubPage('new_menu:section2') && (
        <Section2 />
      )}
    </div>
  );
}
```

## Route Protection

Route protection otomatis dilakukan oleh:

1. **AuthContext** - Redirect ke first accessible route jika mencoba akses route tidak diizinkan
2. **AdminAuthWrapper** - Validasi akses sebelum render halaman

Tidak perlu menambahkan protection manual di setiap halaman.

## Testing

### Testing dengan Role Berbeda

Untuk testing, ubah roles saat login di localStorage:

```javascript
// Di browser console
const authData = JSON.parse(localStorage.getItem('bakesmart_admin_auth'));
authData.roles = ['baker']; // Ubah ke role yang ingin ditest
localStorage.setItem('bakesmart_admin_auth', JSON.stringify(authData));
location.reload();
```

### Mock Login Response

Backend harus mengembalikan response dalam format:

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "nama": "User Name"
  },
  "roles": ["owner"]
}
```

Atau format alternatif:

```json
{
  "token": "jwt_token_here",
  "roles": [
    { "name": "owner" },
    { "name": "cashier" }
  ]
}
```

## Troubleshooting

### User tidak bisa akses halaman yang seharusnya bisa

1. Cek roles di localStorage:
   ```javascript
   JSON.parse(localStorage.getItem('bakesmart_admin_auth')).roles
   ```

2. Pastikan role ada di `MENU_PERMISSIONS` untuk menu tersebut

3. Pastikan route ada di `ROUTE_TO_MENU`

### Sidebar tidak menampilkan menu

1. Cek apakah user sudah login dengan roles yang benar
2. Pastikan menu ada di `menuItems` array di AdminSidebar.tsx
3. Pastikan menu id ada di `MENU_PERMISSIONS`

### Sub-page tidak ter-render

1. Pastikan SubPageId ada di `SUB_PAGE_PERMISSIONS`
2. Pastikan menggunakan `canAccessSubPage()` dengan ID yang benar
3. Format SubPageId: `menuId:sectionName`
