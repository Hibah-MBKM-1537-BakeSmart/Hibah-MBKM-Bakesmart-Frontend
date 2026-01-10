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
  product_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductIngredient {
  id: number;
  jumlah: number;
  nama_en: string;
  nama_id: string;
}

// Jenis (Category) - from backend /jenis endpoint
export interface Jenis {
  id: number;
  nama_id: string;
  nama_en: string;
}

// Sub Jenis (Subcategory) - from backend /sub_jenis endpoint
export interface SubJenis {
  id: number;
  nama_id: string;
  nama_en: string;
  jenis_id: number;
  jenis?: Jenis; // Optional: populated when fetching with relations
  min_amount?: number;
  max_amount?: number;
  po_closed?: string; // Time string in HH:mm:ss format
}

// Legacy Category interface (for backwards compatibility)
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
  stock: number; // From stok or daily_stock (if isDaily)
  isDaily?: boolean; // Flag to indicate if this is a daily product
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
  isDaily?: boolean;
  daily_stock?: number | null;
  created_at?: string;
  updated_at?: string;
  gambars?: Array<{ id: number; file_path: string } | null>;
  jenis?: Array<{ id: number; nama_en: string; nama_id: string }>;
  sub_jenis?: Array<{
    id: number;
    nama_en: string;
    nama_id: string;
    jenis_id?: number;
    is_closed?: boolean;
  }>;
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
  vouchers?: Array<{
    id: number;
    kode?: string;
    nama?: string;
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
    product_id?: number;
    created_at?: string;
    updated_at?: string;
  }>;
  jenis: Array<{ id: number; nama_en: string; nama_id: string }>;
  sub_jenis?: Array<{
    id: number;
    nama_en: string;
    nama_id: string;
    jenis_id?: number;
    is_closed?: boolean;
  }>;
  isSubJenisClosed?: boolean; // Flag to indicate if product's sub_jenis is closed
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
