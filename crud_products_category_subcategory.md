# 📘 Dokumentasi API Products, Jenis & Sub Jenis

Dokumentasi ini mencakup semua endpoint untuk mengelola **Products**, **Jenis**, dan **Sub Jenis** di aplikasi Bakesmart.

---

## 📑 Daftar Isi

- [1. Jenis (Kategori Utama)](#1-jenis-kategori-utama)
- [2. Sub Jenis (Sub Kategori)](#2-sub-jenis-sub-kategori)
- [3. Products](#3-products)
- [4. Relasi Product dengan Data Referensi](#4-relasi-product-dengan-data-referensi)
- [5. Stock Management](#5-stock-management)
- [6. Export & Import](#6-export--import)

---

## 1. Jenis (Kategori Utama)

Data master untuk kategori utama produk (contoh: Kue, Roti, Pastry).

### Base URL: `/jenis`

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/jenis` | Ambil semua jenis |
| GET | `/jenis/{id}` | Ambil jenis berdasarkan ID |
| POST | `/jenis` | Buat jenis baru |
| PUT | `/jenis/{id}` | Update jenis |
| DELETE | `/jenis/{id}` | Hapus jenis |
| GET | `/jenis/export` | Export jenis ke Excel |
| POST | `/jenis/import` | Import jenis dari Excel |

### 1.1 Get All Jenis

```http
GET /jenis
```

**Response (200):**
```json
{
  "message": "Ref Jeniss retrieved",
  "data": [
    { "id": 1, "nama_id": "Kue", "nama_en": "Cake" },
    { "id": 2, "nama_id": "Roti", "nama_en": "Bread" }
  ]
}
```

### 1.2 Get Jenis by ID

```http
GET /jenis/{id}
```

**Response (200):**
```json
{
  "message": "Ref Jenis retrieved",
  "data": { "id": 1, "nama_id": "Kue", "nama_en": "Cake" }
}
```

### 1.3 Create Jenis

```http
POST /jenis
Content-Type: application/json

{
  "nama_id": "Pastry",
  "nama_en": "Pastry"
}
```

**Response (201):**
```json
{
  "message": "Ref Jenis created",
  "id": 3,
  "nama_id": "Pastry",
  "nama_en": "Pastry"
}
```

### 1.4 Update Jenis

```http
PUT /jenis/{id}
Content-Type: application/json

{
  "nama_id": "Kue Basah",
  "nama_en": "Wet Cake"
}
```

**Response (200):**
```json
{
  "message": "Ref Jenis updated",
  "id": 1,
  "nama_id": "Kue Basah",
  "nama_en": "Wet Cake"
}
```

### 1.5 Delete Jenis

```http
DELETE /jenis/{id}
```

**Response (200):**
```json
{
  "message": "Ref Jenis deleted",
  "id": 1
}
```

---

## 2. Sub Jenis (Sub Kategori)

Data master untuk sub kategori produk yang terhubung ke Jenis.

### Base URL: `/sub_jenis`

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/sub_jenis` | Ambil semua sub jenis |
| GET | `/sub_jenis/{id}` | Ambil sub jenis berdasarkan ID |
| POST | `/sub_jenis` | Buat sub jenis baru |
| PUT | `/sub_jenis/{id}` | Update sub jenis |
| DELETE | `/sub_jenis/{id}` | Hapus sub jenis |

### 2.1 Get All Sub Jenis

```http
GET /sub_jenis
```

**Response (200):**
```json
{
  "message": "Ref Sub Jeniss retrieved",
  "data": [
    { "id": 1, "nama_id": "Kue Ulang Tahun", "nama_en": "Birthday Cake", "jenis_id": 1 },
    { "id": 2, "nama_id": "Kue Tart", "nama_en": "Tart Cake", "jenis_id": 1 },
    { "id": 3, "nama_id": "Roti Tawar", "nama_en": "White Bread", "jenis_id": 2 }
  ]
}
```

### 2.2 Get Sub Jenis by ID

```http
GET /sub_jenis/{id}
```

**Response (200):**
```json
{
  "message": "Ref Sub Jenis retrieved",
  "data": { "id": 1, "nama_id": "Kue Ulang Tahun", "nama_en": "Birthday Cake", "jenis_id": 1 }
}
```

### 2.3 Create Sub Jenis

```http
POST /sub_jenis
Content-Type: application/json

{
  "nama_id": "Kue Coklat",
  "nama_en": "Chocolate Cake",
  "jenis_id": 1
}
```

**Response (201):**
```json
{
  "message": "Ref Sub Jenis created",
  "id": 4,
  "nama_id": "Kue Coklat",
  "nama_en": "Chocolate Cake",
  "jenis_id": 1
}
```

### 2.4 Update Sub Jenis

```http
PUT /sub_jenis/{id}
Content-Type: application/json

{
  "nama_id": "Kue Coklat Premium",
  "nama_en": "Premium Chocolate Cake"
}
```

**Response (200):**
```json
{
  "message": "Ref Sub Jenis updated",
  "id": 4,
  "nama_id": "Kue Coklat Premium",
  "nama_en": "Premium Chocolate Cake",
  "jenis_id": 1
}
```

### 2.5 Delete Sub Jenis

```http
DELETE /sub_jenis/{id}
```

**Response (200):**
```json
{
  "message": "Ref Sub Jenis deleted",
  "id": 4
}
```

---

## 3. Products

Data produk utama dengan berbagai relasi ke data referensi.

### Base URL: `/products`

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/products` | Ambil semua produk (dengan relasi) |
| GET | `/products/{id}` | Ambil produk berdasarkan ID |
| POST | `/products` | Buat produk baru |
| POST | `/products/sub_jenis/{sub_jenis_id}` | Buat produk dari template sub jenis |
| PUT | `/products/{id}` | Update produk |
| DELETE | `/products/{id}` | Hapus produk |

### 3.1 Get All Products

```http
GET /products
```

**Response (200):**
```json
{
  "message": "Produks retrieved",
  "data": [
    {
      "id": 1,
      "nama_id": "Kue Ulang Tahun Coklat",
      "nama_en": "Chocolate Birthday Cake",
      "deskripsi_id": "Kue ulang tahun dengan rasa coklat premium",
      "deskripsi_en": "Birthday cake with premium chocolate flavor",
      "harga": 250000,
      "harga_diskon": 225000,
      "stok": 10,
      "isBestSeller": true,
      "isDaily": false,
      "daily_stock": null,
      "gambars": [{ "id": 1, "file_path": "/uploads/products/cake1.jpg" }],
      "sub_jenis": [{ "id": 1, "nama_id": "Kue Ulang Tahun", "nama_en": "Birthday Cake" }],
      "jenis": [{ "id": 1, "nama_id": "Kue", "nama_en": "Cake" }],
      "hari": [{ "id": 1, "nama_id": "Senin", "nama_en": "Monday" }],
      "attributes": [{ "id": 1, "nama_id": "Ukuran S", "nama_en": "Size S", "harga": 250000 }],
      "bahans": [{ "id": 1, "nama_id": "Coklat", "nama_en": "Chocolate", "jumlah": 500 }]
    }
  ]
}
```

### 3.2 Get Product by ID

```http
GET /products/{id}
```

**Response (200):**
```json
{
  "message": "Produk retrieved",
  "data": {
    "id": 1,
    "nama_id": "Kue Ulang Tahun Coklat",
    "nama_en": "Chocolate Birthday Cake",
    "harga": 250000,
    "gambars": [...],
    "sub_jenis": [...],
    "jenis": [...],
    "hari": [...],
    "attributes": [...],
    "bahans": [...]
  }
}
```

### 3.3 Create Product

```http
POST /products
Content-Type: application/json

{
  "nama_id": "Roti Gandum",
  "nama_en": "Wheat Bread",
  "deskripsi_id": "Roti gandum sehat",
  "deskripsi_en": "Healthy wheat bread",
  "harga": 35000,
  "stok": 50,
  "isBestSeller": false,
  "isDaily": true,
  "daily_stock": 20
}
```

**Response (201):**
```json
{
  "message": "Produk created",
  "data": {
    "id": 2,
    "nama_id": "Roti Gandum",
    "nama_en": "Wheat Bread",
    ...
  }
}
```

### 3.4 Create Product from Sub Jenis Template

Membuat produk baru dengan otomatis mengisi relasi (hari, attributes, bahans) berdasarkan template sub jenis.

```http
POST /products/sub_jenis/{sub_jenis_id}
Content-Type: application/json

{
  "nama_id": "Kue Tart Strawberry",
  "nama_en": "Strawberry Tart Cake",
  "harga": 300000,
  "stok": 5
}
```

**Response (201):**
```json
{
  "message": "Produk created",
  "data": {
    "id": 3,
    "nama_id": "Kue Tart Strawberry",
    ...
  }
}
```

### 3.5 Update Product

```http
PUT /products/{id}
Content-Type: application/json

{
  "nama_id": "Roti Gandum Premium",
  "harga": 40000,
  "hari": [{ "id": 1 }, { "id": 2 }],
  "attributes": [{ "id": 1, "harga": 40000 }],
  "bahans": [{ "id": 1, "jumlah": 200 }],
  "vouchers": [{ "id": 1 }],
  "sub_jenis": [{ "id": 3 }]
}
```

**Response (200):**
```json
{
  "message": "Produk updated",
  "data": [{ "id": 2, ... }]
}
```

### 3.6 Delete Product

```http
DELETE /products/{id}
```

**Response (200):**
```json
{
  "message": "Produk deleted",
  "id": 2
}
```

---

## 4. Relasi Product dengan Data Referensi

Endpoint untuk mengelola relasi many-to-many antara product dengan data referensi.

### 4.1 Product ↔ Gambar

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/products/{product_id}/gambar` | Upload gambar produk |
| DELETE | `/products/{product_id}/gambar/{gambar_id}` | Hapus gambar produk |

**Upload Gambar:**
```http
POST /products/{product_id}/gambar
Content-Type: multipart/form-data

file: [binary]
```

### 4.2 Product ↔ Sub Jenis

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/products/{product_id}/sub_jenis/{sub_jenis_id}` | Cek relasi |
| POST | `/products/{product_id}/sub_jenis/{sub_jenis_id}` | Tambah relasi |
| DELETE | `/products/{product_id}/sub_jenis/{sub_jenis_id}` | Hapus relasi |

### 4.3 Product ↔ Hari

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/products/{product_id}/hari/{hari_id}` | Cek relasi |
| POST | `/products/{product_id}/hari/{hari_id}` | Tambah relasi |
| DELETE | `/products/{product_id}/hari/{hari_id}` | Hapus relasi |

### 4.4 Product ↔ Attribute

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/products/{product_id}/attribute/{attribute_id}` | Cek relasi |
| POST | `/products/{product_id}/attribute/{attribute_id}` | Tambah relasi |
| DELETE | `/products/{product_id}/attribute/{attribute_id}` | Hapus relasi |

### 4.5 Product ↔ Bahan

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/products/{product_id}/bahan/{bahan_id}` | Cek relasi |
| POST | `/products/{product_id}/bahan/{bahan_id}` | Tambah relasi |
| DELETE | `/products/{product_id}/bahan/{bahan_id}` | Hapus relasi |

### 4.6 Product ↔ Voucher

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/products/{product_id}/voucher/{voucher_id}` | Cek relasi |
| POST | `/products/{product_id}/voucher/{voucher_id}` | Tambah relasi |
| DELETE | `/products/{product_id}/voucher/{voucher_id}` | Hapus relasi |

---

## 5. Stock Management

Endpoint untuk mengelola stok produk.

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/stock/check/all` | Cek stok semua produk |
| POST | `/stock/check/{id}` | Cek stok produk tertentu |
| POST | `/stock/reserve/all` | Reserve stok semua produk |
| POST | `/stock/reserve/{id}` | Reserve stok produk tertentu |
| POST | `/stock/release/all` | Release stok semua produk |
| POST | `/stock/release/{id}` | Release stok produk tertentu |
| POST | `/stock/commit/all` | Commit stok semua produk |
| POST | `/stock/commit/{id}` | Commit stok produk tertentu |

---

## 6. Export & Import

### 6.1 Export Products

```http
GET /products/export
```

**Response:** File Excel (.xlsx)

### 6.2 Import Products

```http
POST /products/import
Content-Type: multipart/form-data

file: [products.xlsx]
```

**Response (200):**
```json
{
  "message": "Products imported successfully",
  "inserted": 10,
  "skipped": 2,
  "total": 12
}
```

### 6.3 Export Jenis

```http
GET /jenis/export
```

### 6.4 Import Jenis

```http
POST /jenis/import
Content-Type: multipart/form-data

file: [jenis.xlsx]
```

---

## 📊 Diagram Relasi Database

```
┌─────────────┐       ┌──────────────────┐       ┌───────────────┐
│  ref_jenis  │──1:N──│  ref_sub_jenis   │──N:M──│   products    │
└─────────────┘       └──────────────────┘       └───────────────┘
                                                        │
                      ┌─────────────────────────────────┼─────────────────────────────────┐
                      │                 │               │               │                 │
                     N:M               N:M             N:M             N:M               N:M
                      │                 │               │               │                 │
               ┌──────┴──────┐   ┌──────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐ ┌───────┴───────┐
               │  ref_hari   │   │ref_attributes│ │ ref_bahans  │ │  vouchers   │ │    gambars    │
               └─────────────┘   └─────────────┘ └─────────────┘ └─────────────┘ └───────────────┘
```

---

## 🔧 Contoh Implementasi Frontend

### Fetch All Products dengan Axios

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:3000';

// Get all products
const getProducts = async () => {
  const response = await axios.get(`${API_URL}/products`);
  return response.data.data;
};

// Create product
const createProduct = async (productData) => {
  const response = await axios.post(`${API_URL}/products`, productData);
  return response.data;
};

// Update product
const updateProduct = async (id, productData) => {
  const response = await axios.put(`${API_URL}/products/${id}`, productData);
  return response.data;
};

// Delete product
const deleteProduct = async (id) => {
  const response = await axios.delete(`${API_URL}/products/${id}`);
  return response.data;
};

// Add sub_jenis to product
const addSubJenisToProduct = async (productId, subJenisId) => {
  const response = await axios.post(`${API_URL}/products/${productId}/sub_jenis/${subJenisId}`);
  return response.data;
};
```

### Fetch Jenis dan Sub Jenis

```javascript
// Get all jenis
const getJenis = async () => {
  const response = await axios.get(`${API_URL}/jenis`);
  return response.data.data;
};

// Get all sub jenis
const getSubJenis = async () => {
  const response = await axios.get(`${API_URL}/sub_jenis`);
  return response.data.data;
};

// Get sub jenis filtered by jenis_id
const getSubJenisByJenis = async (jenisId) => {
  const allSubJenis = await getSubJenis();
  return allSubJenis.filter(sj => sj.jenis_id === jenisId);
};
```

---

## ⚠️ Error Responses

Semua endpoint mengembalikan format error yang konsisten:

```json
{
  "error": "Error message here",
  "statusCode": 400
}
```

| Status Code | Deskripsi |
|-------------|-----------|
| 400 | Bad Request - Data tidak valid |
| 404 | Not Found - Resource tidak ditemukan |
| 409 | Conflict - Relasi sudah ada |
| 500 | Internal Server Error |

---

## 📝 Notes

1. **Jenis** adalah kategori utama (parent)
2. **Sub Jenis** adalah sub kategori yang terhubung ke Jenis via `jenis_id`
3. **Products** bisa memiliki banyak Sub Jenis (many-to-many via `product_sub_jenis`)
4. Semua data referensi (Jenis, Sub Jenis, Hari, Attribute, Bahan) dikelola terpisah dari Products
5. Gunakan endpoint relasi untuk menghubungkan product dengan data referensi