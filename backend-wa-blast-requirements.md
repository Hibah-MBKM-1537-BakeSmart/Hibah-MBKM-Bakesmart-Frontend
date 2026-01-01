# Spesifikasi Kebutuhan Backend - Fitur WhatsApp Blast

Dokumen ini merangkum kebutuhan teknis sisi Backend untuk mendukung fitur pengiriman pesan massal (WhatsApp Blast) pada modul Customer.

## 1. API Endpoints

### A. Send Blast (Trigger Pengiriman)

Endpoint utama untuk menerima request blast dari frontend.

- **URL:** `/api/v1/whatsapp/blast`
- **Method:** `POST`
- **Auth:** Required (Admin Token)
- **Request Body (JSON):**
  ```json
  {
    "target_type": "selected", // Opsi: 'selected', 'all', atau 'filter'
    "customer_ids": [101, 102, 105], // Array ID customer (Wajib jika target_type = 'selected')
    "filter_params": { "status": "active" }, // Opsional (jika target_type = 'filter')
    "message": "Halo {name}, kami ada promo spesial untuk Anda!",
    "image": "(Binary/File)" // Opsional (Multipart form-data jika ada gambar)
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Blast message has been queued successfully.",
    "blast_id": 55
  }
  ```

### B. Get Blast History (Log Riwayat)

Untuk menampilkan riwayat blast yang pernah dilakukan oleh admin.

- **URL:** `/api/v1/whatsapp/blast/history`
- **Method:** `GET`
- **Response:** List riwayat blast beserta statusnya (pending/completed).

---

## 2. Arsitektur & Logic (Penting)

### A. Queue System (Antrian)

**CRITICAL:** Pengiriman pesan massal **tidak boleh** dilakukan secara _synchronous_ (langsung saat request API) karena berisiko timeout dan memblokir server.

1.  **Job Queue:** Gunakan Redis, BullMQ, RabbitMQ, atau database job table.
2.  **Flow:**
    - API menerima request -> Simpan record ke DB -> Masukkan ke Queue -> Return "Success" ke Frontend.
    - **Worker (Background Process)** mengambil job dari Queue dan mengirim pesan satu per satu.
3.  **Throttling/Delay:** Tambahkan jeda (misal: 3-5 detik) antar pengiriman pesan untuk menghindari pemblokiran nomor WA oleh pihak WhatsApp.

### B. Integrasi Gateway

Backend harus terhubung dengan penyedia layanan WhatsApp API (3rd Party) seperti:

- Official WhatsApp Business API (Meta).
- Unofficial API (Fonnte, Watzap, Twilio, dll).

### C. Phone Number Formatting

Backend wajib melakukan sanitasi nomor telepon sebelum dikirim ke gateway:

- Ubah awalan `08` menjadi `628`.
- Hapus karakter non-digit (spasi, strip `-`, plus `+`).

---

## 3. Database Schema

Diperlukan tabel baru untuk mencatat riwayat dan status pengiriman.

### Table: `whatsapp_blasts`

Menyimpan informasi header dari satu sesi blast.

| Column             | Type      | Description                                   |
| :----------------- | :-------- | :-------------------------------------------- |
| `id`               | PK        | ID Blast                                      |
| `admin_id`         | FK        | ID Admin yang mengirim                        |
| `title`            | Varchar   | Judul/Topik Blast (Opsional)                  |
| `message_template` | Text      | Isi pesan asli                                |
| `target_count`     | Int       | Total penerima                                |
| `status`           | Enum      | `queued`, `processing`, `completed`, `failed` |
| `created_at`       | Timestamp | Waktu dibuat                                  |

### Table: `whatsapp_blast_logs`

Menyimpan detail status pengiriman per customer (untuk tracking detail).

| Column          | Type      | Description                                  |
| :-------------- | :-------- | :------------------------------------------- |
| `id`            | PK        | ID Log                                       |
| `blast_id`      | FK        | Referensi ke tabel `whatsapp_blasts`         |
| `customer_id`   | FK        | Referensi ke tabel `customers`               |
| `phone_number`  | Varchar   | Nomor HP tujuan (format 628xxx)              |
| `status`        | Enum      | `pending`, `sent`, `failed`                  |
| `error_message` | Text      | Alasan jika gagal (misal: nomor tidak valid) |
| `sent_at`       | Timestamp | Waktu sukses terkirim                        |

---

## 4. Checklist Validasi Backend

1.  [ ] Pastikan `message` tidak kosong.
2.  [ ] Pastikan `customer_ids` valid (ada di database).
3.  [ ] Filter customer yang tidak memiliki nomor telepon atau format nomor salah sebelum masuk antrian.
