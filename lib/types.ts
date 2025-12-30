// Product-related types (formerly from mockData.ts)
export interface ProductAttribute {
  id: number;
  harga: number;
  nama_en: string;
  nama_id: string;
}

export interface ProductType {
  id: number;
  nama_en: string;
  nama_id: string;
}

export interface ProductDay {
  id: number;
  nama_en: string;
  nama_id: string;
}

export interface ProductImage {
  id: number;
  file_path: string;
  product_id: number;
  created_at: string;
  updated_at: string;
}

export interface ProductIngredient {
  id: number;
  jumlah: number;
  nama_en: string;
  nama_id: string;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
}

export interface CartItem {
  id: number;
  name: string; // Transformed from nama_id/nama_en
  discountPrice: string; // Formatted price string
  originalPrice?: string; // Formatted original price string
  isDiscount?: boolean;
  image: string; // Primary image from gambars array
  category: string; // From jenis array
  stock: number; // From stok
  availableDays: string[]; // From hari array, transformed to string array
  orderDay: string; // Hari pesanan (senin, selasa, etc.)
  selectedAttributes?: ProductAttribute[];
  attributesPrice?: number;
  quantity: number;
  cartId: string; // Unique ID for each cart item
}

// Tipe data mentah dari API eksternal
export interface ApiProduct {
  id: number;
  nama_id: string;
  nama_en: string;
  deskripsi_id?: string;
  deskripsi_en?: string;
  harga: number;
  harga_diskon?: number | null;
  stok?: number;
  isBestSeller?: boolean;
  isDaily?: boolean; // Ada di contoh JSON kamu
  daily_stock?: number | null; // Ada di contoh JSON kamu
  created_at?: string; // Ada di contoh JSON kamu
  updated_at?: string; // Ada di contoh JSON kamu
  gambars?: Array<{ id: number; file_path: string } | null>;
  jenis?: Array<{ id: number; nama_en: string; nama_id: string }>;
  hari?: Array<{ id: number; nama_en: string; nama_id: string }>;
  attributes?: Array<{
    id: number;
    harga: number;
    nama_en: string;
    nama_id: string;
  }>;
  bahans?: Array<{
    id: number;
    jumlah: number;
    nama_en: string;
    nama_id: string;
  }>;
}

// Tipe data yang sudah ditransformasi untuk dipakai di aplikasi
export interface MenuItem {
  id: number;
  nama_id: string;
  nama_en: string;
  deskripsi_id: string;
  deskripsi_en: string;
  harga: number;
  harga_diskon: number | null;
  stok: number;
  isBestSeller: boolean;
  isDaily: boolean;
  dailyStock: number;
  created_at: string;
  updated_at: string;
  gambars: Array<{
    id: number;
    file_path: string;
    product_id: number;
    created_at: string;
    updated_at: string;
  }>;
  jenis: Array<{ id: number; nama_en: string; nama_id: string }>;
  hari: Array<{ id: number; nama_en: string; nama_id: string }>;
  attributes: Array<{
    id: number;
    harga: number;
    nama_en: string;
    nama_id: string;
  }>;
  bahans: Array<{
    id: number;
    jumlah: number;
    nama_en: string;
    nama_id: string;
  }>;
}
