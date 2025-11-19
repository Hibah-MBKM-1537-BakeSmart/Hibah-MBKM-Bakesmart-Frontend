# Mock API Setup untuk Testing Multi-Browser

## 📋 Deskripsi
Aplikasi sekarang menggunakan **json-server** sebagai mock API untuk sinkronisasi data antar browser saat testing. Data tersimpan di `db.json` dan dapat diakses oleh semua browser secara real-time.

---

## 🚀 Cara Menjalankan Mock API

### 1. Start JSON Server
Buka terminal dan jalankan:
```bash
pnpm run json-server
```

**Atau secara manual:**
```bash
npx json-server db.json --port 3001 --watch
```

### 2. Verifikasi API Berjalan
Buka browser dan akses:
- **All Products:** http://localhost:3001/products
- **Single Product:** http://localhost:3001/products/1
- **Categories:** http://localhost:3001/categories

Jika berhasil, Anda akan melihat data JSON.

### 3. Jalankan Aplikasi Next.js
Buka terminal baru dan jalankan:
```bash
pnpm dev
```

Aplikasi akan berjalan di: http://localhost:3000

---

## 🔄 Cara Kerja Sinkronisasi

### Strategi Baru (API-First)
1. **API sebagai Single Source of Truth**
   - Semua perubahan data (tambah/edit/hapus) langsung ke API
   - Data disimpan di `db.json` oleh json-server
   - Semua browser membaca dari API yang sama

2. **Auto-Sync Polling (5 detik)**
   - Aplikasi otomatis mengecek API setiap 5 detik
   - Jika ada perubahan, UI di-update otomatis
   - Tidak perlu refresh manual

3. **localStorage sebagai Cache**
   - Hanya digunakan saat API offline/error
   - Auto-fallback jika API tidak tersedia
   - Menampilkan warning: "API tidak tersedia. Menggunakan data lokal/demo."

---

## 🌐 Testing Multi-Browser

### Skenario 1: API Online ✅
1. Jalankan json-server di port 3001
2. Buka Chrome: http://localhost:3000/admin/products
3. Buka Firefox: http://localhost:3000/admin/products
4. Edit stok produk di Chrome → akan otomatis ter-update di Firefox (maks 5 detik)

### Skenario 2: API Offline ⚠️
1. Stop json-server (Ctrl+C)
2. Aplikasi akan menampilkan: "API tidak tersedia. Menggunakan data lokal/demo."
3. Perubahan hanya tersimpan di browser masing-masing (tidak sinkron)
4. Saat API online lagi, refresh halaman untuk reconnect

---

## 📁 File yang Dimodifikasi

### 1. `app/contexts/ProductsContext.tsx`
**Perubahan:**
- ✅ API sebagai primary storage (bukan localStorage)
- ✅ localStorage renamed: `bakesmart_products` → `bakesmart_products_cache`
- ✅ Auto-sync polling setiap 5 detik
- ✅ Smart reconnection saat refresh
- ✅ Error message lebih jelas

**Kode Penting:**
```typescript
// Auto-sync setiap 5 detik
useEffect(() => {
  if (!state.isApiConnected) return;
  
  const syncInterval = setInterval(async () => {
    try {
      const products = await productsApi.getAll();
      setState(prev => {
        const hasChanges = JSON.stringify(prev.products) !== JSON.stringify(products);
        if (hasChanges) {
          console.log('Data synced from API');
          return { ...prev, products };
        }
        return prev;
      });
    } catch (error) {
      console.warn('Auto-sync failed:', error);
      setState(prev => ({ ...prev, isApiConnected: false }));
    }
  }, 5000);
  
  return () => clearInterval(syncInterval);
}, [state.isApiConnected]);
```

---

## 🛠️ Troubleshooting

### ❌ Error: "API tidak tersedia"
**Penyebab:** json-server tidak berjalan atau port 3001 terblokir

**Solusi:**
```bash
# Cek apakah port 3001 digunakan
netstat -ano | findstr :3001

# Stop process yang menggunakan port (ganti PID)
taskkill /PID <PID> /F

# Restart json-server
pnpm run json-server
```

### ❌ Data Tidak Sinkron Antar Browser
**Penyebab:** Auto-sync polling belum berjalan atau API error

**Solusi:**
1. Buka DevTools Console (F12)
2. Cek log: "Data synced from API" setiap 5 detik
3. Jika tidak ada, cek API connection status
4. Refresh halaman untuk reconnect

### ❌ Port 3001 Sudah Digunakan
**Solusi 1: Ganti Port**
```bash
npx json-server db.json --port 3002 --watch
```

**Solusi 2: Update API URL**
Edit `lib/api/mockApi.ts`:
```typescript
const API_BASE_URL = 'http://localhost:3002';
```

---

## 📊 Monitoring

### Console Logs
Buka DevTools Console untuk melihat:
- `API Connection Status: true/false` - Status koneksi awal
- `Data synced from API` - Setiap sync berhasil (5 detik)
- `Auto-sync failed: ...` - Jika sync gagal
- `Product updated in API successfully` - Setiap update berhasil

### API Status Indicator
Di halaman admin products, lihat di header:
- ✅ **Hijau:** API Connected
- ⚠️ **Warning:** API tidak tersedia. Menggunakan data lokal/demo.

---

## 🎯 Best Practices

### Untuk Testing
1. **Selalu jalankan json-server** saat testing multi-browser
2. **Buka console** untuk monitoring sync status
3. **Tunggu 5 detik** setelah edit untuk melihat sync antar browser
4. **Test offline mode** dengan stop json-server

### Untuk Development
1. **Commit db.json** ke repository agar tim punya data yang sama
2. **Gunakan .gitignore** untuk temporary changes di db.json (opsional)
3. **Backup db.json** sebelum testing destructive operations
4. **Document API endpoints** saat menambah fitur baru

---

## 📝 Notes

- **Interval Sync:** 5 detik (bisa diubah di ProductsContext.tsx)
- **Timeout:** API request timeout 10 detik (di mockApi.ts)
- **Cache Strategy:** Cache-aside pattern dengan auto-refresh
- **Conflict Resolution:** Last write wins (API as source of truth)

---

## 🔗 Resources

- [json-server Documentation](https://github.com/typicode/json-server)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [React Context API](https://react.dev/reference/react/useContext)

---

**Dibuat:** 30 Oktober 2025
**Terakhir Update:** 30 Oktober 2025
