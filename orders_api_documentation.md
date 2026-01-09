# Orders API Documentation

Dokumentasi lengkap untuk endpoint Orders pada BakeSmart Backend API.

## Base URL
```
/orders
```

---

## Table of Contents
1. [Shipping & Rates](#shipping--rates)
2. [Get Orders](#get-orders)
3. [Order Management](#order-management)
4. [Order Status & Production](#order-status--production)
5. [Validation & Checks](#validation--checks)

---

## Shipping & Rates

### 1. Get Shipping Rates by Coordinates
**Endpoint:** `POST /orders/rates/coordinates`

Mendapatkan estimasi biaya pengiriman berdasarkan koordinat geografis.

**Request Body:**
```json
{
  "origin_latitude": -7.7956,
  "origin_longitude": 110.3695,
  "destination_latitude": -6.2088,
  "destination_longitude": 106.8456,
  "couriers": "jne,tiki,grab",
  "items": [
    {
      "name": "Kue Coklat",
      "value": 50000,
      "weight": 500,
      "quantity": 2
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Shipping rates retrieved",
  "data": {
    "pricing": [...]
  }
}
```

---

### 2. Get Shipping Rates by Postal Code
**Endpoint:** `POST /orders/rates/postal`

Mendapatkan estimasi biaya pengiriman berdasarkan kode pos.

**Request Body:**
```json
{
  "origin_postal_code": "57126",
  "destination_postal_code": "12190",
  "couriers": "jne,tiki,grab",
  "items": [
    {
      "name": "Kue Coklat",
      "value": 50000,
      "weight": 500,
      "quantity": 2
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Shipping rates retrieved",
  "data": {
    "pricing": [...]
  }
}
```

---

### 3. Get Rates by Order ID
**Endpoint:** `GET /orders/{id}/rates`

Mendapatkan estimasi biaya pengiriman untuk order tertentu.

**Parameters:**
- `id` (path) - Order ID

**Response:**
```json
{
  "status": "success",
  "message": "Shipping rates retrieved",
  "data": {
    "pricing": [...]
  }
}
```

---

## Get Orders

### 4. Get All Orders
**Endpoint:** `GET /orders`

Mendapatkan semua order dengan optional filter berdasarkan tanggal.

**Query Parameters:**
- `startDate` (optional) - Tanggal mulai (YYYY-MM-DD)
- `endDate` (optional) - Tanggal akhir (YYYY-MM-DD)

**Response:**
```json
{
  "status": "success",
  "message": "Orders retrieved",
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "total_harga": 150000,
      "status": "ongoing",
      "provider": "BCA",
      "created_at": "2025-01-09T10:30:00.000Z",
      "products": [
        {
          "product_id": 10,
          "product_name_id": "Kue Coklat",
          "product_name_en": "Chocolate Cake",
          "product_price": 50000,
          "jumlah": 2,
          "harga_beli": 45000,
          "note": "Tanpa gula"
        }
      ]
    }
  ]
}
```

---

### 5. Get Order by ID
**Endpoint:** `GET /orders/{id}`

Mendapatkan detail order berdasarkan ID.

**Parameters:**
- `id` (path) - Order ID

**Response:**
```json
{
  "status": "success",
  "message": "Order retrieved",
  "data": {
    "id": 1,
    "user_id": 5,
    "total_harga": 150000,
    "status": "ongoing",
    "provider": "BCA",
    "biteship_id": "btsp_123456",
    "tracking_link": "https://track.biteship.com/...",
    "courier_name": "JNE",
    "shipping_cost": 15000,
    "note": "Antar jam 3 sore",
    "voucher_id": null,
    "created_at": "2025-01-09T10:30:00.000Z",
    "products": [
      {
        "product_id": 10,
        "product_name_id": "Kue Coklat",
        "product_name_en": "Chocolate Cake",
        "jumlah": 2,
        "harga_beli": 45000,
        "note": "Tanpa gula"
      }
    ]
  }
}
```

---

### 6. Get Orders by User ID
**Endpoint:** `GET /orders/user/{id}`

Mendapatkan semua order dari user tertentu.

**Parameters:**
- `id` (path) - User ID

**Response:**
```json
{
  "status": "success",
  "message": "Orders retrieved",
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "total_harga": 150000,
      "status": "ongoing",
      ...
    }
  ]
}
```

---

### 7. Get All Order Groups
**Endpoint:** `GET /orders/group`

Mendapatkan semua order group beserta orders dan products di dalamnya.

**Response:**
```json
{
  "status": "success",
  "message": "Order retrieved",
  "data": [
    {
      "id": 1,
      "tanggal": "2025-01-10",
      "ref_sub_jenis_id": 3,
      "jumlah_sub_jenis": 10,
      "jumlah_jenis": 15,
      "orders": [
        {
          "id": 5,
          "order_group_id": 1,
          "total_harga": 150000,
          "status": "ongoing",
          "products": [...]
        }
      ]
    }
  ]
}
```

---

### 8. Get Orders by Group and Date
**Endpoint:** `POST /orders/group/date`

Mendapatkan order group dan semua orders di dalamnya berdasarkan tanggal.

**Request Body:**
```json
{
  "date": "2025-01-10"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Order retrieved",
  "data": {
    "id": 1,
    "tanggal": "2025-01-10",
    "ref_sub_jenis_id": 3,
    "orders": [...]
  }
}
```

---

### 9. Get Orders by Date
**Endpoint:** `POST /orders/date`

Mendapatkan orders berdasarkan tanggal atau range tanggal.

**Request Body (Single Date):**
```json
{
  "date": "2025-01-09"
}
```

**Request Body (Date Range):**
```json
{
  "date1": "2025-01-01",
  "date2": "2025-01-31"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Orders retrieved",
  "data": [...]
}
```

---

## Order Management

### 10. Create Draft Order
**Endpoint:** `POST /orders`

Membuat order draft (belum terkonfirmasi). Mendukung order dengan pengiriman (delivery) atau ambil langsung (pickup).

**Request Body (Delivery):**
```json
{
  "mode_pengiriman": "delivery",
  "user_id": 5,
  "total_harga": 150000,
  "catatan": "Antar jam 3 sore",
  "voucher_id": 2,
  "min_purchase_for_voucher": 100000,
  "provider_pembayaran": "BCA",
  
  "origin_contact_name": "Toko BakeSmart",
  "origin_contact_phone": "081234567890",
  "origin_contact_email": "store@bakesmart.com",
  "origin_address": "Jl. Contoh No. 123, Surakarta",
  "origin_coordinate": {
    "latitude": -7.7956,
    "longitude": 110.3695
  },
  "origin_note": "Depan masjid",
  
  "destination_contact_name": "John Doe",
  "destination_contact_phone": "081298765432",
  "destination_contact_email": "john@email.com",
  "destination_address": "Jl. Tujuan No. 456, Jakarta",
  "destination_coordinate": {
    "latitude": -6.2088,
    "longitude": 106.8456
  },
  "destination_note": "Rumah cat hijau",
  
  "courier_company": "jne",
  "shipping_cost": 15000,
  "order_note": "Hati-hati barang mudah pecah",
  
  "items": [
    {
      "id": 10,
      "name": "Kue Coklat",
      "jumlah": 2,
      "harga_beli": 45000,
      "note": "Tanpa gula",
      "value": 50000,
      "weight": 500
    }
  ]
}
```

**Request Body (Pickup):**
```json
{
  "mode_pengiriman": "pickup",
  "user_id": 5,
  "total_harga": 100000,
  "catatan": "Ambil jam 4 sore",
  "voucher_id": null,
  "provider_pembayaran": "langsung ambil",
  "destination_contact_name": "Jane Doe",
  "destination_contact_phone": "081234567890",
  "items": [
    {
      "id": 15,
      "jumlah": 3,
      "harga_beli": 30000,
      "note": ""
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Order created",
  "data": {
    "id": 123,
    "user_id": 5
  }
}
```

**Notes:**
- Jika `destination_contact_phone` ada tapi user belum terdaftar, sistem akan otomatis membuat user baru
- Voucher akan diterapkan otomatis jika memenuhi syarat `min_purchase_for_voucher`
- Untuk mode `delivery`, sistem akan membuat draft order di Biteship
- Stok produk tidak langsung dikurangi saat draft dibuat

---

### 11. Create Kasir Order
**Endpoint:** `POST /orders/kasir`

Membuat order langsung dari kasir (completed). Untuk transaksi langsung di toko.

**Request Body:**
```json
{
  "customerName": "John Doe",
  "customerPhone": "081234567890",
  "waktu_ambil": "2025-01-10",
  "provider_pembayaran": "Cash",
  "total_harga": 120000,
  "catatan": "Pesanan langsung",
  "voucher_id": null,
  "items": [
    {
      "product_id": 10,
      "jumlah": 2,
      "harga_beli": 50000,
      "note": "Extra coklat"
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Order created",
  "data": {
    "id": 124
  }
}
```

**Notes:**
- Order langsung dibuat dengan status `completed` dan `production_status` = `completed`
- Stok produk langsung dikurangi
- Jika customer phone belum terdaftar, akan dibuatkan user baru dengan role customer
- Order akan masuk ke order_group sesuai `waktu_ambil`

---

### 12. Confirm Order
**Endpoint:** `POST /orders/{id}/confirm`

Mengonfirmasi order draft menjadi ongoing.

**Parameters:**
- `id` (path) - Order ID

**Response:**
```json
{
  "status": "success",
  "message": "Order confirmed"
}
```

---

### 13. Finish Order
**Endpoint:** `POST /orders/{id}/finish`

Menyelesaikan order dan mengonfirmasi pengiriman via Biteship. Mengirim notifikasi WhatsApp ke customer.

**Parameters:**
- `id` (path) - Order ID

**Response:**
```json
{
  "status": "success",
  "message": "Order confirmed"
}
```

**Notes:**
- Status order berubah menjadi `completed`
- Jika order menggunakan Biteship, akan dikonfirmasi ke Biteship
- Sistem akan mengirim notifikasi WhatsApp ke nomor customer jika tersedia

---

### 14. Update Order
**Endpoint:** `PUT /orders/{id}`

Mengupdate data order.

**Parameters:**
- `id` (path) - Order ID

**Request Body:**
```json
{
  "total_harga": 175000,
  "note": "Update catatan",
  "voucher_id": 3,
  "provider": "Mandiri"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Order updated",
  "data": {
    "id": 1
  }
}
```

**Notes:**
- Jika `voucher_id` disertakan, diskon akan dihitung ulang
- Potongan diskon mengikuti persentase dan maksimal diskon dari voucher

---

### 15. Delete Draft Order
**Endpoint:** `DELETE /orders/draft/{id}`

Menghapus draft order dan membatalkan order di Biteship.

**Parameters:**
- `id` (path) - Order ID

**Response:**
```json
{
  "status": "success",
  "message": "Order deleted",
  "data": {
    "id": 1
  }
}
```

---

### 16. Delete Order
**Endpoint:** `DELETE /orders/{id}`

Menghapus order dan membatalkan order di Biteship.

**Parameters:**
- `id` (path) - Order ID

**Response:**
```json
{
  "status": "success",
  "message": "Order deleted",
  "data": {
    "id": 1
  }
}
```

---

## Order Status & Production

### 17. Update Order Status
**Endpoint:** `PUT /orders/{id}/status`

Mengupdate status order. Jika status menjadi `completed`, akan mengirim notifikasi WhatsApp.

**Parameters:**
- `id` (path) - Order ID

**Request Body:**
```json
{
  "status": "completed"
}
```

**Valid Status:**
- `ongoing` - Order sedang diproses
- `completed` - Order selesai
- `cancelled` - Order dibatalkan

**Response:**
```json
{
  "status": "success",
  "message": "Order updated",
  "data": {
    "id": 1
  }
}
```

**Notes:**
- Jika status diubah menjadi `completed`, sistem akan mengirim notifikasi WhatsApp ke customer

---

### 18. Update Production Status
**Endpoint:** `PUT /orders/{id}/production`

Mengupdate status produksi order.

**Parameters:**
- `id` (path) - Order ID

**Request Body:**
```json
{
  "production_status": "in_production"
}
```

**Valid Production Status:**
- `in_production` - Sedang diproduksi
- `completed` - Produksi selesai

**Response:**
```json
{
  "status": "success",
  "message": "Order production status updated",
  "data": {
    "id": 1,
    "production_status": "in_production"
  }
}
```

---

## Validation & Checks

### 19. Check Sub Jenis Status
**Endpoint:** `POST /orders/check_is_closed_sub_jenis`

Mengecek apakah sub jenis produk sudah ditutup (is_closed).

**Request Body:**
```json
{
  "sub_jenis_id": 5
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Orders retrieved",
  "data": [
    {
      "is_closed": false
    }
  ]
}
```

---

### 20. Check Total Jenis Product
**Endpoint:** `POST /orders/check_total_jenis`

Mengecek apakah penambahan produk masih dalam batas maksimum jenis/sub jenis untuk tanggal tertentu.

**Request Body:**
```json
{
  "tanggal": "2025-01-10",
  "sub_jenis_id": 3,
  "product_id": 15
}
```

**Response (Masih Tersedia):**
```json
{
  "status": "success",
  "message": "Masih belum melampaui batas maksimum jenis",
  "data": "10 + 5 <= 50"
}
```

**Response (Sudah Melampaui Batas):**
```json
{
  "status": "success",
  "message": "Sudah melampaui batas maksimum jenis atau sub jenis",
  "data": {
    "sub_jenis": "45 + 10 <= 50",
    "jenis": "95 + 10 <= 100"
  }
}
```

**Notes:**
- Sistem akan membuat order_group baru jika belum ada untuk tanggal dan sub_jenis tersebut
- Jika masih tersedia, jumlah akan otomatis diupdate di order_group
- Mengecek baik batas maksimum sub jenis maupun jenis

---

## Error Responses

Semua endpoint dapat mengembalikan error response dengan format:

```json
{
  "status": "fail",
  "message": "Error message description",
  "error": "Detailed error information"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## Data Models

### Order Object
```typescript
{
  id: number;
  user_id: number;
  order_group_id?: number;
  total_harga: number;
  provider: string;
  biteship_id?: string;
  tracking_link?: string;
  courier_name?: string;
  shipping_cost?: number;
  bukti_path?: string;
  note?: string;
  voucher_id?: number;
  status: 'ongoing' | 'completed' | 'cancelled';
  production_status?: 'in_production' | 'completed';
  created_at: Date;
  updated_at: Date;
}
```

### Order Product
```typescript
{
  order_id: number;
  product_id: number;
  product_name_id: string;
  product_name_en: string;
  product_price: number;
  jumlah: number;
  harga_beli: number;
  note?: string;
}
```

### Order Group
```typescript
{
  id: number;
  tanggal: string; // YYYY-MM-DD
  ref_sub_jenis_id?: number;
  jumlah_sub_jenis: number;
  jumlah_jenis: number;
}
```

---

## Notes & Best Practices

1. **Authentication**: Pastikan semua request menyertakan token authentication yang valid
2. **Voucher**: Selalu cek minimum purchase sebelum apply voucher
3. **Stock Management**: Untuk kasir order, stok langsung dikurangi. Untuk draft order, stok dikurangi saat confirm
4. **WhatsApp Notification**: Notifikasi otomatis dikirim saat order selesai (status = completed)
5. **Date Format**: Gunakan format YYYY-MM-DD untuk semua input tanggal
6. **Phone Format**: Nomor telepon akan otomatis dikonversi ke format internasional (62xxx) untuk WhatsApp
7. **Biteship Integration**: Order dengan mode delivery otomatis terintegrasi dengan Biteship untuk tracking

---

## Version History

- **v1.0** - Initial documentation (2025-01-09)

---

**Maintained by:** BakeSmart Development Team
