# 🌐 Testing Multi-Browser dengan Mock API

## 🚀 Quick Start (3 Langkah)

### **1. Start Mock API Server**
```bash
pnpm run api
```
✅ API akan berjalan di: http://localhost:3001

### **2. Start Next.js Development Server** (Terminal Baru)
```bash
pnpm dev
```
✅ Aplikasi akan berjalan di: http://localhost:3000

### **3. Test Multi-Browser**
Buka **3 browser berbeda** secara bersamaan:
- **Chrome:** http://localhost:3000/admin/products
- **Firefox:** http://localhost:3000/admin/products
- **Edge:** http://localhost:3000/admin/products

---

## 🎯 Cara Testing Sinkronisasi

### Test 1: Edit Stok Produk
1. Di **Chrome**, klik tombol **+** di kolom stok produk pertama
2. Tunggu **maksimal 5 detik**
3. Lihat di **Firefox** → stok akan otomatis update! ✨
4. Lihat di **Edge** → stok juga update! ✨

**Expected Result:**
```
Chrome:   Chocolate Cake - Stok: 16 ✅
Firefox:  Chocolate Cake - Stok: 16 ✅ (auto-sync)
Edge:     Chocolate Cake - Stok: 16 ✅ (auto-sync)
```

---

### Test 2: Tambah Produk Baru
1. Di **Firefox**, klik tombol **"Tambah Produk"**
2. Isi form dan simpan
3. Tunggu **maksimal 5 detik**
4. Lihat di **Chrome** dan **Edge** → produk baru muncul! ✨

---

### Test 3: Hapus Produk
1. Di **Edge**, klik tombol **hapus** (trash icon) di salah satu produk
2. Konfirmasi hapus
3. Tunggu **maksimal 5 detik**
4. Lihat di **Chrome** dan **Firefox** → produk hilang! ✨

---

## 🔍 Monitoring Sync Status

### Buka DevTools Console (F12)
Anda akan melihat log seperti ini:

```
API Connection Status: true ✅
Data synced from API (setiap 5 detik)
Product updated in API successfully
```

### Jika API Offline
```
API Connection Status: false ⚠️
API tidak tersedia. Menggunakan data lokal/demo.
```

---

## ⚡ Shortcut: Start Semuanya Sekaligus

Jika Anda punya package **concurrently** terinstal:
```bash
pnpm run dev:full
```

Ini akan menjalankan **API + Next.js** dalam satu terminal!

---

## 🛠️ Troubleshooting

### ❌ "API tidak tersedia" muncul terus
**Solusi:**
```bash
# Cek apakah json-server berjalan
curl http://localhost:3001/products

# Jika error, restart json-server
pnpm run api
```

### ❌ Data tidak sinkron antar browser
**Penyebab:** Auto-sync interval belum berjalan

**Solusi:**
1. Refresh semua browser (F5)
2. Buka DevTools Console
3. Cek log "Data synced from API" muncul setiap 5 detik
4. Jika tidak, cek API connection

### ❌ Port 3001 sudah digunakan
**Solusi 1: Kill process lama**
```powershell
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Solusi 2: Ganti port**
```bash
# Edit package.json, ganti --port 3001 jadi --port 3002
pnpm run api
```

---

## 📊 Hasil Testing yang Diharapkan

### ✅ Berhasil:
- [ ] Chrome update → Firefox auto-sync (5 detik)
- [ ] Firefox update → Edge auto-sync (5 detik)
- [ ] Edge update → Chrome auto-sync (5 detik)
- [ ] Tambah produk → semua browser lihat produk baru
- [ ] Hapus produk → semua browser produk hilang
- [ ] Console log: "Data synced from API" setiap 5 detik

### ⚠️ Normal (API Offline):
- [ ] Warning muncul: "API tidak tersedia. Menggunakan data lokal/demo."
- [ ] Setiap browser punya data sendiri (tidak sinkron)
- [ ] Saat API online lagi, refresh untuk reconnect

---

## 🎓 Penjelasan Teknis

### Bagaimana Sinkronisasi Bekerja?

1. **Polling Mechanism**
   ```typescript
   setInterval(async () => {
     const products = await productsApi.getAll();
     if (hasChanges) {
       updateState(products); // Re-render UI
     }
   }, 5000); // Every 5 seconds
   ```

2. **API sebagai Single Source of Truth**
   - Semua browser → baca dari db.json (via json-server)
   - Edit di browser A → tulis ke db.json
   - Browser B polling → baca perubahan dari db.json
   - Browser B re-render dengan data baru

3. **Fallback Strategy**
   ```
   API Online:  API → State → UI ✅
   API Offline: Cache → State → UI ⚠️
   ```

---

## 📝 Tips Testing

1. **Buka Console di semua browser** untuk monitoring
2. **Gunakan Incognito/Private Mode** untuk testing isolasi
3. **Test dengan koneksi lambat** (DevTools Network Throttling)
4. **Test API offline** dengan stop json-server
5. **Backup db.json** sebelum testing destructive operations

---

## 🔗 Dokumentasi Terkait

- [MOCK_API_SETUP.md](./MOCK_API_SETUP.md) - Cara kerja API dan arsitektur
- [README.md](./README.md) - Panduan umum aplikasi

---

**Happy Testing! 🎉**

Jika ada masalah, cek:
1. Console logs (F12)
2. API response (http://localhost:3001/products)
3. json-server terminal output
