# Admins API Documentation

Dokumentasi lengkap untuk endpoint Admins pada BakeSmart Backend API.

## Base URL
```
/admins
```

---

## Table of Contents
1. [Get All Admins](#get-all-admins)
2. [Create Admin](#create-admin)
3. [Update Admin](#update-admin)
4. [Delete Admin](#delete-admin)
5. [Admin Roles](#admin-roles)
6. [Error Handling](#error-handling)

---

## Get All Admins

### Endpoint: GET /admins

Mendapatkan daftar semua admin dalam sistem.

**Method:** `GET`

**Authorization:** Tidak diperlukan (saat ini commented)

**Query Parameters:** Tidak ada

**Response:**
```json
{
  "status": "success",
  "message": "Admins retrieved",
  "data": [
    {
      "id": 1,
      "nama": "Budi Santoso",
      "no_hp": "081234567890",
      "roles": [
        {
          "id": 1,
          "name": "owner"
        },
        {
          "id": 2,
          "name": "baker"
        }
      ]
    },
    {
      "id": 2,
      "nama": "Siti Nurhaliza",
      "no_hp": "081298765432",
      "roles": [
        {
          "id": 3,
          "name": "cashier"
        }
      ]
    }
  ]
}
```

**Response (Empty):**
```json
{
  "status": "success",
  "message": "Admins retrieved",
  "data": []
}
```

**Notes:**
- Admin adalah user yang memiliki minimal salah satu dari role: `owner`, `baker`, `cashier`, `packager`
- Satu admin bisa memiliki multiple roles
- Response berisi informasi nama, nomor HP, dan semua roles yang dimiliki

---

## Create Admin

### Endpoint: POST /admins

Membuat admin baru dengan satu atau lebih role.

**Method:** `POST`

**Authorization:** Required - `manage_users` permission

**Request Body:**
```json
{
  "nama": "Ahmad Hidayat",
  "no_hp": "081345678901",
  "password": "SecurePassword123!",
  "role_ids": [1, 3]
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nama` | string | Yes | Nama lengkap admin |
| `no_hp` | string | Yes | Nomor telepon (harus unik) |
| `password` | string | Yes | Password untuk login (akan di-hash) |
| `role_ids` | array | Yes | Array ID roles (minimal 1, hanya admin roles) |

**Success Response (201 Created):**
```json
{
  "status": "success",
  "message": "Admin created successfully",
  "data": {
    "data": {
      "id": 5,
      "nama": "Ahmad Hidayat",
      "no_hp": "081345678901",
      "roles": [
        {
          "id": 1,
          "name": "owner"
        },
        {
          "id": 3,
          "name": "cashier"
        }
      ]
    }
  }
}
```

**Error Responses:**

**400 - Invalid role_ids:**
```json
{
  "status": "fail",
  "message": "Bad Request",
  "error": "role_ids harus berupa array dan tidak boleh kosong"
}
```

**400 - Non-admin role:**
```json
{
  "status": "fail",
  "message": "Bad Request",
  "error": "Beberapa role_id tidak valid atau bukan admin role"
}
```

**400 - Duplicate phone number:**
```json
{
  "status": "fail",
  "message": "Bad Request",
  "error": "Nomor HP sudah terdaftar"
}
```

**Notes:**
- Password harus kuat dan aman (minimal 8 karakter, kombinasi huruf besar/kecil/angka/simbol disarankan)
- Nomor HP harus unik dalam sistem (tidak boleh duplikat)
- `role_ids` harus berisi ID roles yang valid dari tabel `roles`
- Hanya roles admin yang diizinkan: `owner`, `baker`, `cashier`, `packager`
- Password akan di-hash menggunakan bcrypt sebelum disimpan

---

## Update Admin

### Endpoint: PUT /admins/{id}

Mengupdate informasi admin (nama, nomor HP, password, atau roles).

**Method:** `PUT`

**Authorization:** Required - `manage_users` permission

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Admin ID |

**Request Body (Full Update):**
```json
{
  "nama": "Ahmad Hidayat Updated",
  "no_hp": "081345678902",
  "password": "NewPassword456!",
  "role_ids": [1, 2, 3]
}
```

**Request Body (Partial Update - Nama dan Roles):**
```json
{
  "nama": "Budi Santoso Jr",
  "role_ids": [1]
}
```

**Request Body (Password Change Only):**
```json
{
  "password": "NewPassword789!"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nama` | string | No | Nama lengkap admin (baru) |
| `no_hp` | string | No | Nomor telepon (harus unik) |
| `password` | string | No | Password baru (akan di-hash) |
| `role_ids` | array | No | Array ID roles baru |

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Admin updated successfully",
  "data": {
    "data": {
      "id": 5,
      "nama": "Ahmad Hidayat Updated",
      "no_hp": "081345678902",
      "roles": [
        {
          "id": 1,
          "name": "owner"
        },
        {
          "id": 2,
          "name": "baker"
        },
        {
          "id": 3,
          "name": "cashier"
        }
      ]
    }
  }
}
```

**Error Responses:**

**404 - Admin not found:**
```json
{
  "status": "fail",
  "message": "Not Found",
  "error": "Admin tidak ditemukan"
}
```

**400 - Not an admin:**
```json
{
  "status": "fail",
  "message": "Bad Request",
  "error": "User bukan admin"
}
```

**400 - Duplicate phone number:**
```json
{
  "status": "fail",
  "message": "Bad Request",
  "error": "Nomor HP sudah digunakan user lain"
}
```

**400 - Invalid role:**
```json
{
  "status": "fail",
  "message": "Bad Request",
  "error": "Beberapa role_id tidak valid atau bukan admin role"
}
```

**Notes:**
- Semua parameter bersifat optional (update partial)
- Jika nomor HP diupdate, harus divalidasi tidak digunakan user lain
- Jika roles diupdate, roles lama akan dihapus dan diganti dengan roles baru
- Password akan di-hash ulang sebelum disimpan
- Hanya dapat mengupdate user yang memiliki salah satu admin role

---

## Delete Admin

### Endpoint: DELETE /admins/{id}

Menghapus admin dari sistem beserta semua role-nya.

**Method:** `DELETE`

**Authorization:** Required - `manage_users` permission

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Admin ID |

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Admin deleted successfully",
  "data": {
    "id": 5
  }
}
```

**Error Responses:**

**404 - Admin not found:**
```json
{
  "status": "fail",
  "message": "Not Found",
  "error": "Admin tidak ditemukan"
}
```

**400 - Not an admin:**
```json
{
  "status": "fail",
  "message": "Bad Request",
  "error": "User bukan admin"
}
```

**Notes:**
- Penghapusan bersifat cascade - semua user_roles yang terkait akan otomatis dihapus
- Hanya user dengan admin role yang dapat dihapus
- Operasi ini tidak bisa di-undo, hati-hati!
- User_roles akan terhapus otomatis karena foreign key constraint CASCADE

---

## Admin Roles

Admin roles yang tersedia dalam sistem:

| Role | ID | Description |
|------|----|----|
| `owner` | 1 | Pemilik/Manajer utama toko |
| `baker` | 2 | Staff produksi/pembuat kue |
| `cashier` | 3 | Staff kasir/penjualan |
| `packager` | 4 | Staff pengemasan |

**Notes:**
- Satu admin bisa memiliki multiple roles
- Hanya roles ini yang diizinkan sebagai admin
- Role yang lain (seperti `customer`) bukan admin role

---

## Data Models

### Admin Object
```typescript
{
  id: number;
  nama: string;
  no_hp: string;
  password: string; // hashed with bcrypt
  roles: Role[];
  created_at?: Date;
  updated_at?: Date;
}
```

### Role Object
```typescript
{
  id: number;
  name: 'owner' | 'baker' | 'cashier' | 'packager';
}
```

### User Roles Junction
```typescript
{
  user_id: number;
  role_id: number;
}
```

---

## Error Responses

Semua endpoint dapat mengembalikan error response dengan format:

```json
{
  "status": "fail",
  "message": "Error message",
  "error": "Detailed error information"
}
```

**HTTP Status Codes:**

| Code | Description |
|------|-------------|
| `200` | OK - Request berhasil |
| `201` | Created - Resource berhasil dibuat |
| `400` | Bad Request - Invalid data atau validasi gagal |
| `404` | Not Found - Resource tidak ditemukan |
| `401` | Unauthorized - Authentication diperlukan |
| `403` | Forbidden - Tidak memiliki permission |
| `500` | Internal Server Error - Error pada server |

---

## Authorization & Permissions

### Required Permissions

- **GET /admins** - No specific permission required
- **POST /admins** - Requires `manage_users` permission
- **PUT /admins/{id}** - Requires `manage_users` permission
- **DELETE /admins/{id}** - Requires `manage_users` permission

### How to Authorize

Authorization dilakukan melalui middleware `authorize` yang mengecek:
1. Token authentication user
2. Permission yang dimiliki user melalui role-nya
3. Jika valid, request dilanjutkan; jika tidak, return 403 Forbidden

---

## Request/Response Examples

### Example 1: Get All Admins
```bash
curl -X GET http://localhost:3000/admins \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example 2: Create Admin with Multiple Roles
```bash
curl -X POST http://localhost:3000/admins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "nama": "Rina Wijaya",
    "no_hp": "089876543210",
    "password": "SecurePass123!",
    "role_ids": [2, 4]
  }'
```

### Example 3: Update Admin Password
```bash
curl -X PUT http://localhost:3000/admins/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "password": "NewSecurePass456!"
  }'
```

### Example 4: Update Admin Roles
```bash
curl -X PUT http://localhost:3000/admins/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "role_ids": [1, 3]
  }'
```

### Example 5: Delete Admin
```bash
curl -X DELETE http://localhost:3000/admins/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Best Practices

### Security
1. **Password**: Selalu gunakan password yang kuat dengan kombinasi huruf besar, kecil, angka, dan simbol
2. **Phone Number**: Validasi format nomor telepon sebelum menyimpan
3. **Authorization**: Pastikan user yang request memiliki permission `manage_users`
4. **Hashing**: Password selalu di-hash dengan bcrypt sebelum disimpan

### Data Validation
1. **Required Fields**: Nama dan nomor HP harus tidak kosong
2. **Unique Phone**: Nomor HP harus unik, tidak boleh duplikat
3. **Valid Roles**: Role IDs harus valid dan merupakan admin roles
4. **Array Format**: `role_ids` harus berupa array dengan minimal 1 elemen

### API Usage
1. **GET First**: Gunakan GET /admins terlebih dahulu untuk validasi data sebelum update
2. **Partial Updates**: Gunakan PUT dengan hanya parameter yang ingin diubah
3. **Error Handling**: Selalu handle error responses dengan graceful
4. **Logging**: Log setiap action untuk audit trail

### Role Management
1. **Assign Carefully**: Berikan roles sesuai job desk masing-masing
2. **Multiple Roles**: Gunakan dengan bijak, jangan assign roles yang tidak diperlukan
3. **Permission Check**: Pastikan permission yang diperlukan sesuai dengan roles
4. **Regular Review**: Review dan update roles secara berkala

---

## Database Schema

### users table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(255) NOT NULL,
  no_hp VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### roles table
```sql
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### user_roles table (Junction)
```sql
CREATE TABLE user_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
```

---

## Common Workflows

### Workflow 1: Create New Admin with Baker Role
```
1. GET /admins (check existing admins)
2. POST /admins (create new admin with role_id for baker)
3. Verify admin created successfully
```

### Workflow 2: Change Admin Role from Cashier to Baker
```
1. GET /admins (get current admin data)
2. PUT /admins/{id} (update role_ids to baker role)
3. Verify role updated
```

### Workflow 3: Promote Admin to Owner
```
1. GET /admins (check current roles)
2. PUT /admins/{id} (add owner role to existing roles)
3. Verify multiple roles assigned
```

### Workflow 4: Reset Admin Password
```
1. PUT /admins/{id} (with new password)
2. User must login with new password
```

### Workflow 5: Deactivate Admin
```
1. DELETE /admins/{id} (remove admin from system)
2. Verify deletion successful
```

---

## Limitations & Considerations

1. **Phone Number**: No formatting validation, accepts various formats
2. **Password**: No complexity validation on client-side (implement on frontend if needed)
3. **Soft Delete**: Current implementation uses hard delete, consider soft delete for audit trail
4. **Concurrent Updates**: No optimistic locking, last write wins
5. **Batch Operations**: API tidak support batch create/update/delete
6. **Search/Filter**: API tidak support search atau filter by nama/no_hp
7. **Pagination**: API tidak support pagination untuk large datasets
8. **Audit Trail**: Tidak ada built-in logging untuk track perubahan

---

## Troubleshooting

### Issue: "Nomor HP sudah terdaftar"
**Solution**: Gunakan nomor HP yang belum terdaftar, atau gunakan GET /admins terlebih dahulu untuk check

### Issue: "Beberapa role_id tidak valid"
**Solution**: Pastikan role_ids merupakan admin roles (1-4) dan valid di database

### Issue: "User bukan admin"
**Solution**: Endpoint hanya untuk user dengan admin role, check apakah user masih menjadi admin

### Issue: 403 Forbidden
**Solution**: User tidak memiliki permission `manage_users`, pastikan sudah login dan memiliki role yang tepat

---

## Version History

- **v1.0** - Initial documentation (2025-01-09)
  - Documented GET, POST, PUT, DELETE endpoints
  - Added security best practices
  - Added common workflows

---

## Support & Contact

Untuk pertanyaan atau laporan bug, hubungi:
- **Development Team**: dev@bakesmart.com
- **Issue Tracking**: [GitHub Issues]
- **Documentation**: [Wiki]

---

**Maintained by:** BakeSmart Development Team
**Last Updated:** 2025-01-09
