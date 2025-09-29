# BakeSmart Admin Dashboard

Dashboard admin yang telah dibuat untuk mengelola website BakeSmart. Dashboard ini dibuat menggunakan Next.js 15, TypeScript, dan Tailwind CSS.

## 📁 Struktur Folder

```
frontend/
├── app/
│   ├── admin/                    # Main admin directory
│   │   ├── layout.tsx           # Admin layout with sidebar & header
│   │   ├── page.tsx             # Admin home (redirects to dashboard)
│   │   ├── dashboard/           # Dashboard overview
│   │   │   └── page.tsx
│   │   ├── products/            # Product management
│   │   │   └── page.tsx
│   │   ├── orders/              # Order management
│   │   │   └── page.tsx
│   │   ├── users/               # User management
│   │   │   └── page.tsx
│   │   └── settings/            # Settings page
│   │       └── page.tsx
│   └── contexts/
│       └── AdminContext.tsx     # Admin state management
├── components/
│   └── adminPage/               # Reusable admin components
│       ├── AdminSidebar.tsx     # Navigation sidebar
│       ├── AdminHeader.tsx      # Header with notifications
│       ├── Modal.tsx            # Modal component
│       ├── StatCard.tsx         # Statistics card
│       ├── Table.tsx            # Reusable table
│       ├── Button.tsx           # Custom button
│       ├── FormComponents.tsx   # Input, Select, Textarea
│       └── index.ts             # Export barrel
```

## 🚀 Fitur Utama

### 1. Dashboard Overview (`/admin/dashboard`)
- **Statistik Real-time**: Revenue, Orders, Products, Customers
- **Recent Orders**: Daftar pesanan terbaru
- **Top Products**: Produk dengan penjualan tertinggi
- **Quick Actions**: Shortcut untuk aksi umum

### 2. Product Management (`/admin/products`)
- **CRUD Operations**: Create, Read, Update, Delete products
- **Search & Filter**: Pencarian berdasarkan nama, kategori
- **Stock Management**: Monitor stock levels
- **Category Management**: Kelola kategori produk
- **Sales Analytics**: Tracking penjualan per produk

### 3. Order Management (`/admin/orders`)
- **Order Tracking**: Monitor status pesanan (pending, processing, ready, delivered)
- **Customer Information**: Detail customer dan kontak
- **Payment Status**: Tracking status pembayaran
- **Order History**: Riwayat pesanan lengkap
- **Status Updates**: Update status pesanan

### 4. User Management (`/admin/users`)
- **User Roles**: Customer, Admin, Super Admin
- **Account Status**: Active, Inactive, Suspended
- **User Analytics**: Total orders, spending per user
- **Contact Information**: Email, phone management
- **Registration Tracking**: Monitor user registrations

### 5. Settings (`/admin/settings`)
- **General Settings**: Business info, timezone, currency
- **Notifications**: Email, SMS, push notifications
- **Appearance**: Theme, colors, logo
- **Security**: 2FA, password requirements, session timeout

## 🎨 Design System

### Colors
- **Primary**: Orange (#f97316) - BakeSmart brand color
- **Success**: Green - untuk status positive
- **Warning**: Yellow - untuk alerts
- **Danger**: Red - untuk errors
- **Gray**: Untuk neutral elements

### Components
- **Consistent Styling**: Semua components menggunakan Tailwind classes
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Focus states, keyboard navigation
- **Loading States**: Loading indicators untuk async operations

## 🔧 Komponen Reusable

### AdminSidebar
- Collapsible sidebar
- Navigation menu dengan icons
- User profile section
- Logout functionality

### AdminHeader
- Search functionality
- Notifications dropdown
- User menu
- Mobile responsive

### StatCard
- Menampilkan statistik dengan icon
- Trend indicators (increase/decrease)
- Customizable colors

### Table
- Generic table component
- Custom cell rendering
- Empty state handling
- Responsive design

### Form Components
- Input dengan validasi
- Select dropdown
- Textarea
- Error handling
- Help text support

### Modal
- Reusable modal dialog
- Multiple sizes (sm, md, lg, xl)
- Close on backdrop click
- Accessible

### Button
- Multiple variants (primary, secondary, danger, etc.)
- Loading states
- Icon support
- Size variations

## 📱 Responsive Design

Dashboard admin didesain untuk bekerja optimal di berbagai ukuran layar:

- **Desktop**: Full sidebar, expanded layout
- **Tablet**: Collapsible sidebar, adjusted spacing
- **Mobile**: Hidden sidebar with hamburger menu, stacked layout

## 🔐 State Management

### AdminContext
Menggunakan React Context untuk state management:

```typescript
interface AdminState {
  user: User | null;
  isAuthenticated: boolean;
  sidebarCollapsed: boolean;
  notifications: Notification[];
}
```

### Functions:
- `login(user)`: User authentication
- `logout()`: Clear user session
- `toggleSidebar()`: Toggle sidebar visibility
- `markNotificationAsRead(id)`: Mark notification as read
- `addNotification(notification)`: Add new notification

## 🚀 Getting Started

1. **Akses Admin Panel**:
   ```
   http://localhost:3000/admin
   ```

2. **Default Admin User** (development):
   - Name: Admin BakeSmart
   - Email: admin@bakesmart.com
   - Role: admin

3. **Navigation**:
   - Dashboard: Overview dan statistik
   - Products: Kelola produk dan inventory
   - Orders: Monitor dan kelola pesanan
   - Users: Manajemen customer dan admin
   - Settings: Konfigurasi aplikasi

## 🔄 Future Enhancements

### Prioritas Tinggi:
1. **Real-time Updates**: WebSocket untuk notifikasi real-time
2. **Advanced Analytics**: Charts dan reports yang lebih detail
3. **Bulk Operations**: Multi-select untuk batch operations
4. **Export/Import**: Excel/CSV export untuk data
5. **Advanced Filters**: More filtering options
6. **Image Upload**: Product image management

### Prioritas Medium:
1. **Role-based Permissions**: Granular access control
2. **Audit Logs**: Track admin actions
3. **Dark Mode**: Complete dark theme implementation
4. **Mobile App**: React Native admin app
5. **API Integration**: Connect with backend APIs
6. **Caching**: Implement data caching

### Prioritas Rendah:
1. **Theming**: Multiple theme options
2. **Plugins**: Extensible plugin system
3. **Multi-language**: i18n support
4. **Advanced Search**: Full-text search across entities

## 🛠️ Technical Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context
- **Routing**: Next.js App Router

## 📋 File Conventions

- **Pages**: `page.tsx` untuk route pages
- **Layouts**: `layout.tsx` untuk shared layouts
- **Components**: PascalCase naming
- **Types**: Interface definitions di context files
- **Exports**: Barrel exports (`index.ts`) untuk cleaner imports

## 🎯 Best Practices

1. **Component Structure**: Satu komponen per file
2. **TypeScript**: Full type safety
3. **Error Handling**: Proper error boundaries
4. **Performance**: Lazy loading dan optimization
5. **Accessibility**: ARIA labels dan keyboard support
6. **Code Organization**: Logical folder structure
7. **Consistent Styling**: Reusable component patterns
