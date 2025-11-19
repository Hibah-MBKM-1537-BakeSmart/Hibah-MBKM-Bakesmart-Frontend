/**
 * Script untuk membersihkan localStorage cache lama
 * Jalankan di Browser Console (F12) jika ada masalah dengan data lama
 * 
 * Cara pakai:
 * 1. Buka http://localhost:3000/admin/products
 * 2. Tekan F12 untuk buka DevTools
 * 3. Pilih tab "Console"
 * 4. Copy-paste script ini dan tekan Enter
 * 5. Refresh halaman (F5)
 */

// Remove old localStorage keys
const oldKeys = [
  'bakesmart_products',           // Old primary storage
  'bakesmart_products_demo',      // Old demo data
  'bakesmart_products_backup'     // Old backup
];

console.log('🧹 Cleaning old localStorage cache...');

oldKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Removed: ${key}`);
  } else {
    console.log(`⚠️ Not found: ${key}`);
  }
});

// Check current cache
const currentCache = localStorage.getItem('bakesmart_products_cache');
if (currentCache) {
  const data = JSON.parse(currentCache);
  console.log(`📦 Current cache: ${data.length} products`);
  console.log('Products:', data.map(p => `${p.id}: ${p.nama}`).join(', '));
} else {
  console.log('📦 No cache found (will fetch from API)');
}

console.log('✨ Cache cleanup complete! Please refresh the page (F5)');

// Optional: Clear ALL localStorage (uncomment if needed)
// localStorage.clear();
// console.log('🗑️ All localStorage cleared!');
