# 🐛 Troubleshooting: Error 404 Saat Update Stok

## Masalah
Saat update stok produk menggunakan tombol +/-, muncul error:
```
Gagal mengupdate stok
API Error: 404 Not Found
```

## Penyebab

### 1. **json-server 1.0.0-beta.3 Bug**
Versi beta memiliki beberapa bug:
- ❌ Tidak support individual ID access (`/products/1`)
- ❌ Crash saat handling PATCH requests
- ❌ Route resolution error

### 2. **ID Type Mismatch** (Sudah Diperbaiki)
- Old: ID as string `"1"` → json-server mencari string
- New: ID as integer `1` → perlu restart server

---

## ✅ Solusi

### Step 1: Downgrade json-server ke Versi Stabil

**Edit `package.json`:**
```json
{
  "dependencies": {
    "json-server": "^0.17.4"  // Ganti dari "1.0.0-beta.3"
  }
}
```

**Install:**
```bash
pnpm install
```

### Step 2: Stop Semua Process json-server

**Windows:**
```powershell
# Cari PID yang menggunakan port 3001
netstat -ano | findstr :3001

# Kill process (ganti <PID> dengan nomor yang muncul)
taskkill /PID <PID> /F
```

**Atau kill semua node process:**
```powershell
Get-Process node | Stop-Process -Force
```

### Step 3: Restart json-server

```bash
# Menggunakan npm script (RECOMMENDED)
pnpm run api

# Atau manual
npx json-server --watch db.json --port 3001
```

### Step 4: Verify Server Running

**Cek terminal output:**
```
  \{^_^}/ hi!

  Loading db.json
  Done

  Resources
  http://localhost:3001/products
  http://localhost:3001/categories
```

**Test di browser:**
```
http://localhost:3001/products
```

Harus menampilkan JSON array dengan 8 products.

### Step 5: Clear Browser Cache

**Di browser console (F12):**
```javascript
localStorage.clear();
location.reload();
```

### Step 6: Test Update Stok

1. Buka: http://localhost:3000/admin/products
2. Klik tombol **+** di kolom stok
3. Tidak ada error ✅
4. Stok bertambah ✅

---

## 🔍 Verification Checklist

- [ ] `package.json` uses `json-server: "^0.17.4"`
- [ ] `pnpm install` completed successfully
- [ ] Port 3001 tidak digunakan process lain
- [ ] json-server running (check terminal output)
- [ ] http://localhost:3001/products returns JSON
- [ ] http://localhost:3001/products/1 returns single product
- [ ] Browser localStorage cleared
- [ ] Update stok tidak ada error 404

---

## 📊 Perbandingan Versi

| Aspek | v1.0.0-beta.3 (Bug) | v0.17.4 (Stable) |
|-------|---------------------|------------------|
| **Individual ID** | ❌ 404 Error | ✅ Works |
| **PATCH Method** | ❌ Crash | ✅ Works |
| **Watch Mode** | ⚠️ Unstable | ✅ Stable |
| **Production Ready** | ❌ Beta | ✅ Yes |
| **Community Support** | ⚠️ Limited | ✅ Wide |

---

## 🛠️ Advanced Troubleshooting

### Issue: Port 3001 Already in Use

**Solution:**
```powershell
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Issue: Server Starts but Crashes Immediately

**Check db.json syntax:**
```bash
# PowerShell
Get-Content db.json | ConvertFrom-Json | Out-Null

# Output: (jika valid, tidak ada error)
```

**Common JSON errors:**
- Trailing comma
- Missing quotes
- Invalid escape characters

### Issue: API Returns Empty Array

**Check file path:**
```bash
# Make sure json-server reads correct file
npx json-server --watch db.json --port 3001

# Verify in terminal output:
# "Loading db.json" <- Should show this
```

### Issue: Changes Not Syncing Between Browsers

**Causes:**
1. localStorage cache priority
2. Auto-sync interval not running
3. API connection lost

**Solutions:**
```javascript
// 1. Clear cache (all browsers)
localStorage.removeItem('bakesmart_products_cache');
location.reload();

// 2. Check API connection status
// Open DevTools Console:
// Look for: "API Connection Status: true"

// 3. Manual refresh
// Click refresh button or F5
```

---

## 📝 Best Practices

### 1. Always Use Stable Versions in Production
```json
{
  "json-server": "^0.17.4"  // ✅ Stable
  // NOT: "1.0.0-beta.3"     // ❌ Beta
}
```

### 2. Keep json-server Running in Separate Terminal
```bash
# Terminal 1: API Server
pnpm run api

# Terminal 2: Next.js Dev Server
pnpm dev
```

### 3. Monitor json-server Logs
Watch for errors like:
```
GET /products/1 404 ...
PATCH /products/1 500 ...
```

### 4. Use npm Scripts for Consistency
```json
{
  "scripts": {
    "api": "json-server --watch db.json --port 3001",
    "dev": "next dev",
    "dev:full": "concurrently \"pnpm run api\" \"pnpm run dev\""
  }
}
```

---

## 🎯 Quick Fix Commands

```bash
# 1. Kill old server
Get-Process node | Stop-Process -Force

# 2. Reinstall correct version
pnpm install json-server@0.17.4

# 3. Restart server
pnpm run api

# 4. In new terminal, start Next.js
pnpm dev

# 5. Clear browser cache
# F12 > Console > localStorage.clear(); location.reload();
```

---

## 📚 Resources

- [json-server GitHub Issues](https://github.com/typicode/json-server/issues)
- [json-server v0.17.4 Docs](https://github.com/typicode/json-server/tree/v0.17.4)
- [Changelog v1.0 Beta Issues](https://github.com/typicode/json-server/blob/master/CHANGELOG.md)

---

**Last Updated:** 30 Oktober 2025  
**Status:** ✅ FIXED with json-server@0.17.4
