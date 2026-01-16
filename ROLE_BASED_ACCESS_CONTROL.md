# Role-Based Access Control (RBAC) - Dokumentasi IAM

## Overview
Backend Bakesmart mengimplementasikan sistem Role-Based Access Control (RBAC) untuk mengelola hak akses pengguna berdasarkan peran (role) yang dimiliki. Sistem ini memastikan bahwa setiap endpoint API hanya dapat diakses oleh pengguna dengan role yang sesuai.

## Struktur Database

### Tabel Roles
```sql
CREATE TABLE roles (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) UNIQUE NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabel User-Role (Many-to-Many)
```sql
CREATE TABLE user_roles (
  user_id INTEGER REFERENCES users(id),
  role_id INTEGER REFERENCES roles(id),
  PRIMARY KEY (user_id, role_id)
);
```

## Daftar Role

Sistem memiliki 5 role utama:

| Role | Nama | Deskripsi | Tingkat Akses |
|------|------|-----------|---------------|
| 1 | **owner** | Owner/Pemilik | Akses penuh ke semua fitur |
| 2 | **baker** | Tukang Roti | Akses produksi dan status produksi |
| 3 | **cashier** | Kasir | Akses manajemen pesanan dan customer |
| 4 | **packager** | Packager/Packer | Akses pengemasan dan status pesanan |
| 5 | **customer** | Customer/Pelanggan | Akses sebagai pelanggan (publik) |

## Mekanisme Otorisasi

### Middleware Authorize
File: `controllers/helpers/authorize.js`

Middleware ini menggunakan pre-handler Hapi.js untuk memvalidasi role sebelum mengeksekusi endpoint handler.

**Cara Kerja:**
1. Membaca `credentials.roles` dari token JWT yang terautentikasi
2. Memeriksa apakah user memiliki salah satu role yang diizinkan
3. Menolak akses jika role tidak sesuai (HTTP 403 Forbidden)
4. Dapat dinonaktifkan dengan setting `RBAC_ENABLED = false` di server.js

**Penggunaan:**
```javascript
const authorize = require("../controllers/helpers/authorize");

module.exports = [
  {
    method: "GET",
    path: "/endpoint",
    options: {
      pre: [authorize(["owner", "cashier"])], // Hanya owner dan cashier
    },
    handler: controllerFunction,
  }
];
```

## Matriks Hak Akses per Role

### 1. Owner (Akses Penuh)
Role owner memiliki akses ke **semua endpoint** yang memerlukan autentikasi, termasuk:

#### Manajemen Admin
- ✅ GET `/admins` - Lihat semua admin
- ✅ POST `/admins` - Buat admin baru
- ✅ PUT `/admins/{id}` - Update admin
- ✅ DELETE `/admins/{id}` - Hapus admin

#### Manajemen Role
- ✅ GET `/roles` - Lihat semua role
- ✅ POST `/roles` - Buat role baru
- ✅ PUT `/roles/{id}` - Update role
- ✅ DELETE `/roles/{id}` - Hapus role

#### Manajemen User
- ✅ PUT `/users/{id}` - Update user
- ✅ DELETE `/users/{id}` - Hapus user
- ✅ GET `/users/{user_id}/voucher/{voucher_id}` - Lihat user voucher
- ✅ POST `/users/{user_id}/voucher/{voucher_id}` - Assign voucher
- ✅ DELETE `/users/{user_id}/voucher/{voucher_id}` - Hapus voucher
- ✅ GET `/users/customers` - Lihat semua customer
- ✅ GET `/users/customers/order/last` - Lihat last order customer
- ✅ GET `/users/{user_id}/customers/order/last` - Lihat last order by user

#### Dashboard & Statistik
- ✅ GET `/dashboard/stats` - Lihat statistik dashboard

#### Config
- ✅ PUT `/config` - Update konfigurasi sistem

#### Produk & Stok
- ✅ POST `/products` - Buat produk
- ✅ PUT `/products/{id}` - Update produk
- ✅ DELETE `/products/{id}` - Hapus produk
- ✅ Semua endpoint manajemen stok (`/stock/*`)

#### Pesanan (Orders)
- ✅ GET `/orders` - Lihat semua pesanan
- ✅ GET `/orders/{id}` - Lihat detail pesanan
- ✅ GET `/orders/{id}/rates` - Lihat ongkir
- ✅ GET `/orders/user/{id}` - Lihat pesanan by user
- ✅ GET `/orders/group` - Lihat group pesanan
- ✅ POST `/orders/group/date` - Lihat pesanan by group & date
- ✅ POST `/orders/date` - Lihat pesanan by date
- ✅ POST `/orders/check_total_order` - Cek total pesanan
- ✅ POST `/orders/check_total_jenis` - Cek total jenis produk
- ✅ POST `/orders/{id}/confirm` - Konfirmasi pesanan
- ✅ POST `/orders/{id}/finish` - Selesaikan pesanan
- ✅ PUT `/orders/{id}` - Update pesanan
- ✅ DELETE `/orders/draft/{id}` - Hapus draft
- ✅ DELETE `/orders/{id}` - Hapus pesanan
- ✅ PUT `/orders/{id}/status` - Update status pesanan
- ✅ PUT `/orders/{id}/production` - Update status produksi

#### Last Order
- ✅ Semua endpoint `/last_order/*`

#### Reference Data
- ✅ Semua endpoint CRUD untuk:
  - `/jenis` (Jenis Produk)
  - `/sub_jenis` (Sub Jenis)
  - `/hari` (Hari)
  - `/bahan` (Bahan)
  - `/attribute` (Atribut)
  - `/vouchers` (Voucher)

#### WhatsApp
- ✅ GET `/whatsapp/status` - Status koneksi WA
- ✅ POST `/whatsapp/kirim` - Kirim pesan WA
- ✅ POST `/whatsapp/kirim/otomatis` - Kirim pesan otomatis

#### QR Code
- ✅ POST `/qrcode/generate` - Generate QR Code

#### Import/Export
- ✅ POST `/products/import` - Import produk
- ✅ GET `/products/export` - Export produk
- ✅ POST `/orders/import` - Import pesanan
- ✅ GET `/orders/export` - Export pesanan
- ✅ POST `/ref-data/import` - Import ref data
- ✅ GET `/ref-data/export` - Export ref data
- ✅ POST `/users/import` - Import users

---

### 2. Cashier (Kasir)
Role cashier memiliki akses terbatas untuk operasional kasir dan manajemen customer.

#### Config
- ✅ PUT `/config` - Update konfigurasi sistem

#### Produk & Stok
- ✅ POST `/products` - Buat produk
- ✅ PUT `/products/{id}` - Update produk
- ✅ DELETE `/products/{id}` - Hapus produk
- ✅ Semua endpoint manajemen stok (`/stock/*`)

#### Pesanan (Orders)
- ✅ GET `/orders` - Lihat semua pesanan
- ✅ GET `/orders/{id}` - Lihat detail pesanan
- ✅ GET `/orders/{id}/rates` - Lihat ongkir
- ✅ GET `/orders/user/{id}` - Lihat pesanan by user
- ✅ POST `/orders/check_total_jenis` - Cek total jenis produk
- ❌ GET `/orders/group` - TIDAK BISA (hanya owner, baker, packager)
- ❌ POST `/orders/group/date` - TIDAK BISA (hanya owner, baker, packager)
- ❌ POST `/orders/date` - TIDAK BISA (hanya owner, baker, packager)
- ❌ POST `/orders/check_total_order` - TIDAK BISA (hanya owner, baker, packager)
- ❌ PUT `/orders/{id}/production` - TIDAK BISA (hanya owner, baker)

#### Last Order
- ✅ Semua endpoint `/last_order/*`

#### Reference Data
- ✅ Semua endpoint CRUD untuk:
  - `/jenis` (Jenis Produk)
  - `/sub_jenis` (Sub Jenis)
  - `/hari` (Hari)
  - `/bahan` (Bahan)
  - `/attribute` (Atribut)
  - `/vouchers` (Voucher)

#### User & Customer
- ✅ GET `/users/{user_id}/voucher/{voucher_id}` - Lihat user voucher
- ✅ POST `/users/{user_id}/voucher/{voucher_id}` - Assign voucher
- ✅ DELETE `/users/{user_id}/voucher/{voucher_id}` - Hapus voucher
- ✅ GET `/users/customers` - Lihat semua customer
- ✅ GET `/users/customers/order/last` - Lihat last order customer
- ✅ GET `/users/{user_id}/customers/order/last` - Lihat last order by user

#### WhatsApp
- ✅ GET `/whatsapp/status` - Status koneksi WA
- ✅ POST `/whatsapp/kirim` - Kirim pesan WA
- ✅ POST `/whatsapp/kirim/otomatis` - Kirim pesan otomatis

#### QR Code
- ✅ POST `/qrcode/generate` - Generate QR Code

#### Import/Export
- ✅ POST `/products/import` - Import produk
- ✅ GET `/products/export` - Export produk
- ✅ POST `/orders/import` - Import pesanan
- ✅ GET `/orders/export` - Export pesanan
- ✅ POST `/ref-data/import` - Import ref data
- ✅ GET `/ref-data/export` - Export ref data

#### ❌ Tidak Bisa Akses:
- Manajemen Admin (`/admins/*`)
- Manajemen Role (`/roles/*`)
- Update/Delete User (`/users/{id}`)
- Dashboard Stats (`/dashboard/stats`)
- Import Users (`/users/import`)

---

### 3. Baker (Tukang Roti)
Role baker fokus pada produksi dan status produksi pesanan.

#### Pesanan - Produksi
- ✅ GET `/orders/group` - Lihat group pesanan
- ✅ POST `/orders/group/date` - Lihat pesanan by group & date
- ✅ POST `/orders/date` - Lihat pesanan by date
- ✅ POST `/orders/check_total_order` - Cek total pesanan
- ✅ PUT `/orders/{id}/production` - Update status produksi

#### WhatsApp
- ✅ POST `/whatsapp/kirim` - Kirim pesan WA

#### ❌ Tidak Bisa Akses:
- Manajemen Admin, Role, User
- Dashboard Stats
- Config
- Produk & Stok Management
- Create/Update/Delete Orders
- Confirm/Finish Orders
- Last Order
- Reference Data
- QR Code
- Import/Export

---

### 4. Packager (Packer)
Role packager fokus pada pengemasan dan update status pesanan.

#### Pesanan - Pengemasan
- ✅ GET `/orders/group` - Lihat group pesanan
- ✅ POST `/orders/group/date` - Lihat pesanan by group & date
- ✅ POST `/orders/date` - Lihat pesanan by date
- ✅ POST `/orders/check_total_order` - Cek total pesanan
- ✅ POST `/orders/{id}/confirm` - Konfirmasi pesanan
- ✅ POST `/orders/{id}/finish` - Selesaikan pesanan
- ✅ PUT `/orders/{id}` - Update pesanan
- ✅ DELETE `/orders/draft/{id}` - Hapus draft
- ✅ DELETE `/orders/{id}` - Hapus pesanan
- ✅ PUT `/orders/{id}/status` - Update status pesanan

#### WhatsApp
- ✅ POST `/whatsapp/kirim` - Kirim pesan WA

#### ❌ Tidak Bisa Akses:
- Manajemen Admin, Role, User
- Dashboard Stats
- Config
- Produk & Stok Management
- Update Production Status
- Last Order
- Reference Data
- QR Code
- Import/Export

---

### 5. Customer (Pelanggan)
Role customer adalah untuk end-user/pelanggan. Sebagian besar endpoint publik tidak memerlukan role khusus.

#### Akses Publik (Tanpa Autentikasi)
- ✅ POST `/register` - Registrasi akun
- ✅ POST `/login` - Login
- ✅ GET `/config` - Lihat config
- ✅ GET `/products` - Lihat semua produk
- ✅ GET `/products/{id}` - Lihat detail produk
- ✅ POST `/orders/rates/coordinates` - Cek ongkir by koordinat
- ✅ POST `/orders/rates/postal` - Cek ongkir by postal
- ✅ POST `/orders/check_is_closed_sub_jenis` - Cek sub jenis tutup
- ✅ POST `/orders` - Buat draft pesanan (customer)

#### ❌ Tidak Bisa Akses:
- Semua endpoint management (Admin, Role, User, etc.)
- Dashboard
- Manajemen Produk, Stok
- Manajemen Pesanan (kecuali buat draft)
- Reference Data Management
- WhatsApp, QR Code
- Import/Export

---

## Endpoint Tanpa Autentikasi (Public)

Beberapa endpoint dapat diakses tanpa autentikasi untuk keperluan publik:

```javascript
options: { auth: false }
```

### Authentication
- `POST /register` - Registrasi user
- `POST /login` - Login user

### Config
- `GET /config` - Lihat konfigurasi

### Products
- `GET /products` - Lihat semua produk
- `GET /products/{id}` - Lihat detail produk

### Orders - Publik
- `POST /orders/rates/coordinates` - Cek ongkir berdasarkan koordinat
- `POST /orders/rates/postal` - Cek ongkir berdasarkan kode pos
- `POST /orders/check_is_closed_sub_jenis` - Cek apakah sub jenis tutup
- `POST /orders` - Buat draft order (untuk customer)

---

## Rangkuman Hak Akses

| Fitur | Owner | Cashier | Baker | Packager | Customer |
|-------|:-----:|:-------:|:-----:|:--------:|:--------:|
| **Admin Management** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Role Management** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **User Management** | ✅ | ⚠️ | ❌ | ❌ | ❌ |
| **Dashboard Stats** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Config** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Product CRUD** | ✅ | ✅ | ❌ | ❌ | 👁️ |
| **Stock Management** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Order View** | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ |
| **Order CRUD** | ✅ | ⚠️ | ❌ | ⚠️ | ⚠️ |
| **Production Status** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Order Status** | ✅ | ⚠️ | ❌ | ✅ | ❌ |
| **Last Order** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Reference Data** | ✅ | ✅ | ❌ | ❌ | 👁️ |
| **WhatsApp** | ✅ | ✅ | ⚠️ | ⚠️ | ❌ |
| **QR Code** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Import/Export** | ✅ | ⚠️ | ❌ | ❌ | ❌ |

**Legend:**
- ✅ = Full Access
- ⚠️ = Partial Access
- 👁️ = View Only (Public)
- ❌ = No Access

---

## Konfigurasi RBAC

### Mengaktifkan/Menonaktifkan RBAC

Di file `server.js`, terdapat konfigurasi untuk mengaktifkan atau menonaktifkan RBAC:

```javascript
const RBAC_ENABLED = true; // atau false untuk bypass RBAC
```

Ketika `RBAC_ENABLED = false`, semua middleware `authorize()` akan di-bypass dan tidak melakukan pengecekan role.

### Best Practices

1. **Gunakan Prinsip Least Privilege**: Berikan role dengan akses minimal yang diperlukan
2. **Hindari Hardcode Role**: Role didefinisikan di database, bukan di kode
3. **Multi-Role Support**: User dapat memiliki multiple roles (many-to-many)
4. **Audit Trail**: Pertimbangkan logging untuk akses ke endpoint sensitif
5. **Testing**: Selalu test setiap role untuk memastikan akses sesuai requirement

---

## Security Considerations

### JWT Token
- Token JWT harus menyertakan array `roles` di dalam payload
- Token di-verify pada setiap request yang memerlukan autentikasi
- Token dapat di-invalidate dengan mengimplementasikan token blacklist

### Error Handling
- HTTP 403 Forbidden: User tidak memiliki role yang diperlukan
- HTTP 401 Unauthorized: User belum login atau token invalid

### Testing Role
```javascript
// Test dengan berbagai role
const testToken = {
  userId: 1,
  roles: ["owner"] // atau ["cashier"], ["baker"], dst
}
```

---

## Maintenance & Updates

### Menambah Role Baru
1. Insert ke tabel `roles`
2. Update seed file `05_seed_roles.js`
3. Assign role ke user melalui tabel `user_roles`
4. Update dokumentasi ini

### Mengubah Hak Akses
1. Ubah array `authorize([...])` di route yang bersangkutan
2. Test endpoint dengan role yang diubah
3. Update dokumentasi ini

### Audit Route Permissions
```bash
# Cari semua penggunaan authorize
grep -r "authorize(\[" routes/
```

---

## Troubleshooting

### Error: "No roles found"
- User belum di-assign role di tabel `user_roles`
- Token JWT tidak menyertakan field `roles`

### Error: "Insufficient permissions"
- User memiliki role, tetapi tidak termasuk dalam `allowedRoles`
- Periksa apakah role name sesuai (case-sensitive)

### Bypass RBAC untuk Testing
```javascript
// Di server.js
const RBAC_ENABLED = false; // Disable RBAC
```

---

## Referensi File

### Core Files
- `controllers/helpers/authorize.js` - Middleware authorization
- `controllers/roleController.js` - Role CRUD controller
- `routes/roleRoutes.js` - Role API routes
- `migrations/20251009081234_create_roles_table.js` - Role table migration
- `seeds/05_seed_roles.js` - Role data seeding

### Route Files
Semua file di folder `routes/` menggunakan middleware `authorize()` untuk role-based access control.

---

**Dokumentasi ini berlaku untuk:** Bakesmart Backend API v1.0  
**Terakhir diupdate:** 13 Januari 2026  
**Dibuat oleh:** GitHub Copilot
