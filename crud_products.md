# 📘 Dokumentasi API CRUD Products

Dokumentasi lengkap untuk **Create, Read, Update, Delete (CRUD)** produk di aplikasi Bakesmart.

---

## 📑 Daftar Isi

- [1. Overview](#1-overview)
- [2. Base Endpoints](#2-base-endpoints)
- [3. Product CRUD](#3-product-crud)
- [4. Product Relations](#4-product-relations)
- [5. Product Images](#5-product-images)
- [6. Stock Management](#6-stock-management)
- [7. Export & Import](#7-export--import)
- [8. Struktur Database](#8-struktur-database)
- [9. Implementasi Frontend](#9-implementasi-frontend)

---

## 1. Overview

Products adalah data produk (roti, kue, pastry) yang dijual di Bakesmart. Setiap product memiliki:
- **Data dasar**: nama, harga, stok, deskripsi
- **Relasi**: sub_jenis, hari, attributes, bahans, vouchers
- **Gambar**: multiple images per product

---

## 2. Base Endpoints

### Products

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/products` | Ambil semua products |
| GET | `/products/{id}` | Ambil product by ID |
| POST | `/products` | Buat product baru |
| POST | `/products/sub_jenis/{sub_jenis_id}` | Buat product dari template sub jenis |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Hapus product |

### Product Images

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/products/{product_id}/gambar` | Ambil semua gambar product |
| POST | `/products/{product_id}/gambar` | Upload gambar product |
| DELETE | `/products/{product_id}/gambar/{gambar_id}` | Hapus gambar product |

### Product Relations

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/products/{product_id}/sub_jenis` | Get sub jenis |
| POST | `/products/{product_id}/sub_jenis/{sub_jenis_id}` | Add sub jenis |
| DELETE | `/products/{product_id}/sub_jenis/{sub_jenis_id}` | Remove sub jenis |
| GET | `/products/{product_id}/hari` | Get hari |
| POST | `/products/{product_id}/hari/{hari_id}` | Add hari |
| DELETE | `/products/{product_id}/hari/{hari_id}` | Remove hari |
| GET | `/products/{product_id}/attribute` | Get attributes |
| POST | `/products/{product_id}/attribute/{attribute_id}` | Add attribute |
| DELETE | `/products/{product_id}/attribute/{attribute_id}` | Remove attribute |
| GET | `/products/{product_id}/bahan` | Get bahans |
| POST | `/products/{product_id}/bahan/{bahan_id}` | Add bahan |
| DELETE | `/products/{product_id}/bahan/{bahan_id}` | Remove bahan |
| GET | `/products/{product_id}/voucher` | Get vouchers |
| POST | `/products/{product_id}/voucher/{voucher_id}` | Add voucher |
| DELETE | `/products/{product_id}/voucher/{voucher_id}` | Remove voucher |

### Export & Import

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/products/export` | Export products ke Excel |
| POST | `/products/import` | Import products dari Excel |

---

## 3. Product CRUD

### 3.1 Get All Products

Ambil semua products dengan semua relasi.

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
      "nama_id": "Roti Tawar Original",
      "nama_en": "Original White Bread",
      "deskripsi_id": "Roti tawar dengan kualitas premium",
      "deskripsi_en": "White bread with premium quality",
      "harga": 15000,
      "harga_diskon": null,
      "stok": 50,
      "isBestSeller": true,
      "isDaily": true,
      "daily_stock": 20,
      "created_at": "2026-01-01T10:00:00.000Z",
      "updated_at": "2026-01-07T08:00:00.000Z",
      "gambars": [
        {
          "id": 1,
          "file_path": "/uploads/products/roti-tawar-1.jpg",
          "product_id": 1
        },
        {
          "id": 2,
          "file_path": "/uploads/products/roti-tawar-2.jpg",
          "product_id": 1
        }
      ],
      "sub_jenis": [
        {
          "id": 3,
          "nama_id": "Roti Tawar",
          "nama_en": "White Bread"
        }
      ],
      "jenis": [
        {
          "id": 2,
          "nama_id": "Roti",
          "nama_en": "Bread"
        }
      ],
      "hari": [
        {
          "id": 1,
          "nama_id": "Senin",
          "nama_en": "Monday"
        },
        {
          "id": 2,
          "nama_id": "Selasa",
          "nama_en": "Tuesday"
        }
      ],
      "attributes": [
        {
          "id": 1,
          "nama_id": "Potong",
          "nama_en": "Cut",
          "harga": 0
        },
        {
          "id": 2,
          "nama_id": "Selai",
          "nama_en": "Jam",
          "harga": 5000
        }
      ],
      "bahans": [
        {
          "id": 1,
          "nama_id": "Tepung Terigu",
          "nama_en": "Wheat Flour",
          "jumlah": 500
        },
        {
          "id": 2,
          "nama_id": "Gula",
          "nama_en": "Sugar",
          "jumlah": 100
        }
      ]
    }
  ]
}
```

---

### 3.2 Get Product by ID

Ambil detail product tertentu.

```http
GET /products/{id}
```

**Example:**
```http
GET /products/1
```

**Response (200):**
```json
{
  "message": "Produk retrieved",
  "data": {
    "id": 1,
    "nama_id": "Roti Tawar Original",
    "nama_en": "Original White Bread",
    "harga": 15000,
    "stok": 50,
    "gambars": [...],
    "sub_jenis": [...],
    "hari": [...],
    "attributes": [...],
    "bahans": [...]
  }
}
```

**Response (404) - Product not found:**
```json
{
  "error": "Produk not found"
}
```

---

### 3.3 Create Product (Basic)

Buat product baru tanpa relasi.

```http
POST /products
Content-Type: application/json

{
  "nama_id": "Roti Gandum Premium",
  "nama_en": "Premium Wheat Bread",
  "deskripsi_id": "Roti gandum dengan bahan organik",
  "deskripsi_en": "Wheat bread with organic ingredients",
  "harga": 20000,
  "harga_diskon": null,
  "stok": 30,
  "isBestSeller": false,
  "isDaily": true,
  "daily_stock": 15
}
```

**Response (201):**
```json
{
  "message": "Produk created",
  "data": {
    "id": 10,
    "nama_id": "Roti Gandum Premium",
    "nama_en": "Premium Wheat Bread",
    "harga": 20000,
    "stok": 30,
    "created_at": "2026-01-07T10:00:00.000Z"
  }
}
```

---

### 3.4 Create Product from Sub Jenis Template

Buat product dengan otomatis meng-copy relasi (hari, attributes, bahans) dari template sub jenis.

```http
POST /products/sub_jenis/{sub_jenis_id}
Content-Type: application/json
```

**Example:**
```http
POST /products/sub_jenis/3
Content-Type: application/json

{
  "nama_id": "Roti Tawar Gandum Spesial",
  "nama_en": "Special Wheat White Bread",
  "harga": 18000,
  "stok": 25,
  "isBestSeller": false,
  "isDaily": true
}
```

**Response (201):**
```json
{
  "message": "Produk created",
  "data": {
    "id": 11,
    "nama_id": "Roti Tawar Gandum Spesial",
    "nama_en": "Special Wheat White Bread",
    "harga": 18000,
    "stok": 25
  }
}
```

**Penjelasan:**
- Product otomatis terhubung dengan sub_jenis_id yang dipilih
- Relasi (hari, attributes, bahans) otomatis di-copy dari template sub_jenis
- Sangat berguna untuk membuat variant produk dengan kategori yang sama

---

### 3.5 Update Product (Full)

Update product beserta semua relasinya.

```http
PUT /products/{id}
Content-Type: application/json

{
  "nama_id": "Roti Tawar Original Premium",
  "harga": 17000,
  "harga_diskon": 15000,
  "stok": 60,
  "hari": [
    { "id": 1 },
    { "id": 2 },
    { "id": 3 }
  ],
  "attributes": [
    { "id": 1, "harga": 0 },
    { "id": 2, "harga": 5000 },
    { "id": 3, "harga": 3000 }
  ],
  "bahans": [
    { "id": 1, "jumlah": 600 },
    { "id": 2, "jumlah": 150 }
  ],
  "sub_jenis": [
    { "id": 3 }
  ],
  "vouchers": [
    { "id": 1 }
  ]
}
```

**Example:**
```http
PUT /products/1
```

**Response (200):**
```json
{
  "message": "Produk updated",
  "data": [
    {
      "id": 1,
      "nama_id": "Roti Tawar Original Premium",
      "harga": 17000,
      "harga_diskon": 15000,
      "stok": 60
    }
  ]
}
```

**Penjelasan:**
- Endpoint ini akan **menghapus** semua relasi lama (hari, attributes, bahans, dll)
- Kemudian **insert** relasi baru sesuai payload
- Gunakan untuk update complete data product

---

### 3.6 Update Product (Partial)

Update hanya field tertentu tanpa mengubah relasi.

```http
PUT /products/{id}
Content-Type: application/json

{
  "harga": 16000,
  "stok": 55
}
```

**Response (200):**
```json
{
  "message": "Produk updated",
  "data": [
    {
      "id": 1,
      "harga": 16000,
      "stok": 55
    }
  ]
}
```

---

### 3.7 Delete Product

Hapus product.

```http
DELETE /products/{id}
```

**Example:**
```http
DELETE /products/10
```

**Response (200):**
```json
{
  "message": "Produk deleted",
  "id": "10"
}
```

**Response (404) - Product not found:**
```json
{
  "error": "Produk not found"
}
```

**⚠️ Catatan:** 
- Menghapus product akan otomatis menghapus semua relasi (CASCADE)
- Gambar product juga akan terhapus dari database

---

## 4. Product Relations

### 4.1 Get Product Sub Jenis

```http
GET /products/{product_id}/sub_jenis
```

**Response (200):**
```json
{
  "message": "Produk retrieved",
  "data": [
    {
      "id": 3,
      "nama_id": "Roti Tawar",
      "nama_en": "White Bread"
    }
  ]
}
```

---

### 4.2 Add Sub Jenis to Product

```http
POST /products/{product_id}/sub_jenis/{sub_jenis_id}
```

**Example:**
```http
POST /products/1/sub_jenis/3
```

**Response (201):**
```json
{
  "id": 15,
  "product_id": 1,
  "sub_jenis_id": 3
}
```

**Response (409) - Already exists:**
```json
{
  "message": "This product already has the assigned jenis_id.",
  "product_id": 1,
  "jenis_id": 3
}
```

---

### 4.3 Remove Sub Jenis from Product

```http
DELETE /products/{product_id}/sub_jenis/{sub_jenis_id}
```

**Example:**
```http
DELETE /products/1/sub_jenis/3
```

**Response (200):**
```json
{
  "message": "Product_Sub_Jenis deleted",
  "product_id": 1,
  "sub_jenis_id": 3
}
```

---

### 4.4 Get Product Hari

```http
GET /products/{product_id}/hari
```

---

### 4.5 Add Hari to Product

```http
POST /products/{product_id}/hari/{hari_id}
```

**Example:**
```http
POST /products/1/hari/1
```

**Response (201):**
```json
{
  "id": 20,
  "product_id": 1,
  "hari_id": 1
}
```

---

### 4.6 Get Product Attributes

```http
GET /products/{product_id}/attribute
```

---

### 4.7 Add Attribute to Product

```http
POST /products/{product_id}/attribute/{attribute_id}
Content-Type: application/json

{
  "harga": 5000
}
```

**Example:**
```http
POST /products/1/attribute/2
Content-Type: application/json

{
  "harga": 5000
}
```

**Response (201):**
```json
{
  "id": 25,
  "product_id": 1,
  "attribute_id": 2
}
```

---

### 4.8 Get Product Bahans

```http
GET /products/{product_id}/bahan
```

---

### 4.9 Add Bahan to Product

```http
POST /products/{product_id}/bahan/{bahan_id}
Content-Type: application/json

{
  "jumlah": 500
}
```

---

### 4.10 Get Product Vouchers

```http
GET /products/{product_id}/voucher
```

---

### 4.11 Add Voucher to Product

```http
POST /products/{product_id}/voucher/{voucher_id}
```

---

## 5. Product Images

### 5.1 Get Product Images

```http
GET /products/{product_id}/gambar
```

**Response (200):**
```json
{
  "message": "Produk retrieved",
  "data": [
    {
      "id": 1,
      "file_path": "/uploads/products/roti-1.jpg",
      "product_id": 1
    },
    {
      "id": 2,
      "file_path": "/uploads/products/roti-2.jpg",
      "product_id": 1
    }
  ]
}
```

---

### 5.2 Upload Product Image

```http
POST /products/{product_id}/gambar
Content-Type: multipart/form-data

file: [binary]
```

**Example Request (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

await axios.post(`/products/1/gambar`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

**Response (201):**
```json
{
  "message": "Gambar Added to Produk",
  "data": true
}
```

**File Constraints:**
- Max size: 10 MB
- Supported formats: jpg, jpeg, png, gif
- Files saved to: `/uploads/products/`

---

### 5.3 Delete Product Image

```http
DELETE /products/{product_id}/gambar/{gambar_id}
```

**Example:**
```http
DELETE /products/1/gambar/2
```

**Response (200):**
```json
{
  "message": "Produk deleted",
  "id": "1"
}
```

---

## 6. Stock Management

### Check Stock

```http
POST /stock/check/{id}
Content-Type: application/json

{
  "quantity": 5
}
```

### Reserve Stock

```http
POST /stock/reserve/{id}
Content-Type: application/json

{
  "quantity": 3
}
```

### Release Stock

```http
POST /stock/release/{id}
Content-Type: application/json

{
  "quantity": 2
}
```

### Commit Stock

```http
POST /stock/commit/{id}
Content-Type: application/json

{
  "quantity": 3
}
```

---

## 7. Export & Import

### 7.1 Export Products to Excel

```http
GET /products/export
```

**Response:** Excel file (.xlsx)

**File Contents:**
- ID, Nama (ID), Nama (EN), Deskripsi (ID), Deskripsi (EN)
- Harga, Harga Diskon, Stok
- Best Seller, Daily, Daily Stock
- Sub Jenis, Jenis, Hari, Attributes, Bahans
- Gambars, Created At

---

### 7.2 Import Products from Excel

```http
POST /products/import
Content-Type: multipart/form-data

file: [products.xlsx]
```

**Response (200):**
```json
{
  "message": "Products imported successfully",
  "inserted": 15,
  "skipped": 2,
  "total": 17
}
```

**Excel Format:**
| Nama (ID) | Nama (EN) | Harga | Stok | ... |
|-----------|-----------|-------|------|-----|
| Roti Tawar | White Bread | 15000 | 50 | ... |

---

## 8. Struktur Database

### 8.1 Tabel `products`

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key |
| `nama_id` | VARCHAR | Nama produk (ID) |
| `nama_en` | VARCHAR | Nama produk (EN) |
| `deskripsi_id` | TEXT | Deskripsi (ID) |
| `deskripsi_en` | TEXT | Deskripsi (EN) |
| `harga` | INTEGER | Harga produk |
| `harga_diskon` | INTEGER | Harga diskon (nullable) |
| `stok` | INTEGER | Stok tersedia |
| `isBestSeller` | BOOLEAN | Best seller flag |
| `isDaily` | BOOLEAN | Produk harian flag |
| `daily_stock` | INTEGER | Stok harian (nullable) |
| `created_at` | TIMESTAMP | Waktu dibuat |
| `updated_at` | TIMESTAMP | Waktu diupdate |

### 8.2 Relasi Tables

| Table | Description |
|-------|-------------|
| `gambars` | Product images |
| `product_sub_jenis` | Product → Sub Jenis (pivot) |
| `product_hari` | Product → Hari (pivot) |
| `product_attribute` | Product → Attributes (pivot + harga) |
| `product_bahan` | Product → Bahans (pivot + jumlah) |
| `product_voucher` | Product → Vouchers (pivot) |

---

## 9. Implementasi Frontend

### 9.1 Fetch All Products

```javascript
const getProducts = async () => {
  const response = await axios.get('/products');
  return response.data.data;
};
```

---

### 9.2 Create Product

```javascript
const createProduct = async (productData) => {
  const response = await axios.post('/products', productData);
  return response.data;
};

// Example usage
const newProduct = await createProduct({
  nama_id: "Croissant Premium",
  nama_en: "Premium Croissant",
  harga: 25000,
  stok: 20,
  isBestSeller: false,
  isDaily: false
});
```

---

### 9.3 Create Product from Template

```javascript
const createFromTemplate = async (subJenisId, productData) => {
  const response = await axios.post(
    `/products/sub_jenis/${subJenisId}`,
    productData
  );
  return response.data;
};

// Example: Buat Roti Tawar Variant baru
await createFromTemplate(3, {
  nama_id: "Roti Tawar Kismis",
  nama_en: "Raisin White Bread",
  harga: 18000,
  stok: 30
});
```

---

### 9.4 Update Product

```javascript
const updateProduct = async (id, updateData) => {
  const response = await axios.put(`/products/${id}`, updateData);
  return response.data;
};

// Update harga & stok
await updateProduct(1, {
  harga: 16000,
  stok: 45
});

// Update full dengan relasi
await updateProduct(1, {
  nama_id: "Roti Tawar Premium",
  harga: 18000,
  attributes: [
    { id: 1, harga: 0 },
    { id: 2, harga: 5000 }
  ],
  hari: [
    { id: 1 },
    { id: 2 }
  ]
});
```

---

### 9.5 Upload Product Image

```javascript
const uploadProductImage = async (productId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(
    `/products/${productId}/gambar`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  );
  return response.data;
};

// Example in React
const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  await uploadProductImage(productId, file);
  alert('Gambar berhasil diupload!');
};
```

---

### 9.6 Delete Product

```javascript
const deleteProduct = async (id) => {
  if (confirm('Hapus produk ini?')) {
    await axios.delete(`/products/${id}`);
    alert('Produk berhasil dihapus!');
  }
};
```

---

### 9.7 React Component: Product Form

```jsx
import React, { useState } from 'react';
import axios from 'axios';

const ProductForm = ({ productId = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    nama_id: '',
    nama_en: '',
    deskripsi_id: '',
    deskripsi_en: '',
    harga: 0,
    harga_diskon: null,
    stok: 0,
    isBestSeller: false,
    isDaily: false,
    daily_stock: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (productId) {
        // Update
        await axios.put(`/products/${productId}`, formData);
        alert('Produk berhasil diupdate!');
      } else {
        // Create
        await axios.post('/products', formData);
        alert('Produk berhasil dibuat!');
      }
      onSuccess && onSuccess();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nama Produk (ID)"
        value={formData.nama_id}
        onChange={(e) => setFormData({...formData, nama_id: e.target.value})}
        required
      />
      
      <input
        type="text"
        placeholder="Product Name (EN)"
        value={formData.nama_en}
        onChange={(e) => setFormData({...formData, nama_en: e.target.value})}
        required
      />

      <textarea
        placeholder="Deskripsi (ID)"
        value={formData.deskripsi_id}
        onChange={(e) => setFormData({...formData, deskripsi_id: e.target.value})}
      />

      <input
        type="number"
        placeholder="Harga"
        value={formData.harga}
        onChange={(e) => setFormData({...formData, harga: parseInt(e.target.value)})}
        required
      />

      <input
        type="number"
        placeholder="Stok"
        value={formData.stok}
        onChange={(e) => setFormData({...formData, stok: parseInt(e.target.value)})}
        required
      />

      <label>
        <input
          type="checkbox"
          checked={formData.isBestSeller}
          onChange={(e) => setFormData({...formData, isBestSeller: e.target.checked})}
        />
        Best Seller
      </label>

      <label>
        <input
          type="checkbox"
          checked={formData.isDaily}
          onChange={(e) => setFormData({...formData, isDaily: e.target.checked})}
        />
        Produk Harian
      </label>

      <button type="submit">
        {productId ? 'Update Produk' : 'Buat Produk'}
      </button>
    </form>
  );
};

export default ProductForm;
```

---

## 📝 Summary

### CRUD Operations:

| Operation | Endpoint | Method |
|-----------|----------|--------|
| Read All | `/products` | GET |
| Read One | `/products/{id}` | GET |
| Create | `/products` | POST |
| Create from Template | `/products/sub_jenis/{sub_jenis_id}` | POST |
| Update | `/products/{id}` | PUT |
| Delete | `/products/{id}` | DELETE |

### Key Features:

✅ **Full CRUD** operations  
✅ **Multiple images** per product  
✅ **Relations** management (sub_jenis, hari, attributes, bahans, vouchers)  
✅ **Template creation** from sub_jenis  
✅ **Export/Import** Excel  
✅ **Stock management** API  

---

## ⚠️ Best Practices

1. **Validasi Input**: Selalu validasi harga, stok, dan field required
2. **Image Upload**: Compress image di client sebelum upload
3. **Batch Update**: Gunakan `PUT /products/{id}` dengan array relasi untuk update banyak relasi sekaligus
4. **Template**: Gunakan template sub_jenis untuk consistency dalam kategori yang sama
5. **Stock**: Gunakan stock management API untuk avoid race condition

---

## 🔗 Related Documentation

- [API-DOCS-PRODUCTS.md](./API-DOCS-PRODUCTS.md) - Overview Products, Jenis, Sub Jenis
- [API-DOCS-ATTRIBUTES.md](./API-DOCS-ATTRIBUTES.md) - Attributes (Add-ons)
- [API-DOCS-ORDERS.md](./API-DOCS-ORDERS.md) - Orders Management