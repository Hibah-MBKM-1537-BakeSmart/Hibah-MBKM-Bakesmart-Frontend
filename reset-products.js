// Script untuk mengembalikan produk yang hilang
// Cara pakai: Buka browser console di http://localhost:3000/admin/products
// Copy paste seluruh isi file ini ke console, lalu tekan Enter
// Setelah itu refresh halaman (F5)

const mockProducts = [
  {
    id: 1,
    nama: 'Chocolate Cake',
    deskripsi: 'Rich chocolate cake with cream frosting',
    harga: 125000,
    stok: 15,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    status: 'active',
    rating: 4.8,
    sales: 145,
    jenis: [{ id: 1, nama: 'Cake' }],
    gambars: [{ id: 1, file_path: '/img/Roti.png', product_id: 1 }]
  },
  {
    id: 2,
    nama: 'Red Velvet Cupcakes',
    deskripsi: 'Classic red velvet cupcakes (per piece)',
    harga: 15000,
    stok: 24,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    status: 'active',
    rating: 4.6,
    sales: 89,
    jenis: [{ id: 2, nama: 'Cupcake' }],
    gambars: [{ id: 2, file_path: '/img/Roti.png', product_id: 2 }]
  },
  {
    id: 4,
    nama: 'Birthday Cake',
    deskripsi: 'Custom birthday cake with decoration',
    harga: 200000,
    stok: 8,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    status: 'active',
    rating: 4.9,
    sales: 67,
    jenis: [{ id: 1, nama: 'Cake' }],
    gambars: [{ id: 4, file_path: '/img/Roti.png', product_id: 4 }]
  },
  {
    id: 5,
    nama: 'Donuts Box (12 pcs)',
    deskripsi: 'Mixed flavors donut box',
    harga: 60000,
    stok: 50,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    status: 'active',
    rating: 4.4,
    sales: 234,
    jenis: [{ id: 4, nama: 'Donut' }],
    gambars: [{ id: 5, file_path: '/img/Roti.png', product_id: 5 }]
  },
  {
    id: 3,
    nama: 'Croissant',
    deskripsi: 'Buttery French croissant',
    harga: 12000,
    stok: 0,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    status: 'inactive',
    rating: 4.2,
    sales: 156,
    jenis: [{ id: 3, nama: 'Pastry' }]
  },
  {
    id: 6,
    nama: 'Cheese Tart',
    deskripsi: 'Creamy cheese tart',
    harga: 25000,
    stok: 12,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    status: 'active',
    rating: 4.5,
    sales: 78,
    jenis: [{ id: 5, nama: 'Tart' }],
    gambars: [{ id: 6, file_path: '/img/logo.png', product_id: 6 }]
  },
  {
    id: 7,
    nama: 'Apple Pie',
    deskripsi: 'Traditional apple pie',
    harga: 45000,
    stok: 6,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    status: 'active',
    rating: 4.7,
    sales: 45,
    jenis: [{ id: 6, nama: 'Pie' }]
  },
  {
    id: 8,
    nama: 'Bagel',
    deskripsi: 'Fresh baked bagel',
    harga: 18000,
    stok: 20,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    status: 'active',
    rating: 4.3,
    sales: 92,
    jenis: [{ id: 7, nama: 'Bread' }],
    gambars: [{ id: 8, file_path: '/img/Roti.png', product_id: 8 }]
  },
  {
    id: 9,
    nama: 'jhgjfgjftuftuyf',
    deskripsi: 'jgjfjgfjtufjtyf',
    harga: 30000,
    stok: 30,
    created_at: '2025-01-30T08:33:12.822Z',
    updated_at: '2025-01-30T08:33:12.822Z',
    status: 'active',
    sales: 0,
    rating: 0,
    jenis: [{ id: 3, nama: 'Pastry' }],
    gambars: []
  }
];

// Reset localStorage
localStorage.setItem('bakesmart_products', JSON.stringify(mockProducts));

console.log('✅ Produk berhasil dikembalikan!');
console.log('📦 Total produk:', mockProducts.length);
console.log('🔄 Silakan refresh halaman (tekan F5)');
