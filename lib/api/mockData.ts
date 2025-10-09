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
  created_at: string;
  updated_at: string;
  gambars: ProductImage[];
  jenis: ProductType[];
  hari: ProductDay[];
  attributes: ProductAttribute[];
  bahans: ProductIngredient[];
}

export interface ProductImage {
  id: number;
  file_path: string;
  product_id: number;
  created_at: string;
  updated_at: string;
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

export interface ProductAttribute {
  id: number;
  harga: number;
  nama_en: string;
  nama_id: string;
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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const mockMenuItems: MenuItem[] = [
  {
    id: 1,
    nama_id: "Roti 1",
    nama_en: "Bread 1",
    deskripsi_id: "Tes",
    deskripsi_en: "Tes",
    harga: 1000,
    harga_diskon: null,
    stok: 10,
    isBestSeller: false,
    created_at: "2025-09-26T04:12:33.534Z",
    updated_at: "2025-09-26T04:12:33.534Z",
    gambars: [
      {
        id: 1,
        file_path: "/images/roti_1_a.jpg",
        product_id: 1,
        created_at: "",
        updated_at: "",
      },
      {
        id: 2,
        file_path: "/images/roti_1_b.jpg",
        product_id: 1,
        created_at: "",
        updated_at: "",
      },
    ],
    jenis: [{ id: 1, nama_en: "Bread Type A", nama_id: "Jenis Roti A" }],
    hari: [
      { id: 1, nama_en: "Monday", nama_id: "Senin" },
      { id: 3, nama_en: "Wednesday", nama_id: "Rabu" },
    ],
    attributes: [
      { id: 1, harga: 10000, nama_en: "Cut", nama_id: "Potong" },
      { id: 6, harga: 2000, nama_en: "Extra Cheese", nama_id: "Tambah Keju" },
    ],
    bahans: [
      {
        id: 1,
        jumlah: 1,
        nama_en: "Bread Ingredient A",
        nama_id: "Bahan Roti A",
      },
    ],
  },
  {
    id: 2,
    nama_id: "Roti 2",
    nama_en: "Bread 2",
    deskripsi_id: "Tes",
    deskripsi_en: "Tes",
    harga: 5000,
    harga_diskon: null,
    stok: 10,
    isBestSeller: false,
    created_at: "2025-09-26T04:12:33.534Z",
    updated_at: "2025-09-26T04:12:33.534Z",
    gambars: [
      {
        id: 3,
        file_path: "/images/roti_2_a.jpg",
        product_id: 2,
        created_at: "",
        updated_at: "",
      },
    ],
    jenis: [{ id: 2, nama_en: "Bread Type B", nama_id: "Jenis Roti B" }],
    hari: [
      { id: 2, nama_en: "Tuesday", nama_id: "Selasa" },
      { id: 4, nama_en: "Thursday", nama_id: "Kamis" },
      { id: 6, nama_en: "Saturday", nama_id: "Sabtu" },
    ],
    attributes: [
      { id: 2, harga: 10000, nama_en: "Jam", nama_id: "Selai" },
      { id: 7, harga: 3000, nama_en: "Peanut Butter", nama_id: "Selai Kacang" },
    ],
    bahans: [
      {
        id: 2,
        jumlah: 1,
        nama_en: "Bread Ingredient B",
        nama_id: "Bahan Roti B",
      },
    ],
  },
  {
    id: 3,
    nama_id: "Roti 3",
    nama_en: "Bread 3",
    deskripsi_id: "Tes",
    deskripsi_en: "Tes",
    harga: 7000,
    harga_diskon: null,
    stok: 10,
    isBestSeller: false,
    created_at: "2025-09-26T04:12:33.534Z",
    updated_at: "2025-09-26T04:12:33.534Z",
    gambars: [
      {
        id: 4,
        file_path: "/images/roti_3_a.jpg",
        product_id: 3,
        created_at: "",
        updated_at: "",
      },
    ],
    jenis: [{ id: 3, nama_en: "Bread Type C", nama_id: "Jenis Roti C" }],
    hari: [
      { id: 1, nama_en: "Monday", nama_id: "Senin" },
      { id: 2, nama_en: "Tuesday", nama_id: "Selasa" },
      { id: 5, nama_en: "Friday", nama_id: "Jumat" },
    ],
    attributes: [
      { id: 3, harga: 10000, nama_en: "Bread Atr C", nama_id: "Atr Roti C" },
    ],
    bahans: [
      {
        id: 3,
        jumlah: 1,
        nama_en: "Bread Ingredient C",
        nama_id: "Bahan Roti C",
      },
    ],
  },
  {
    id: 4,
    nama_id: "Roti 4",
    nama_en: "Bread 4",
    deskripsi_id: "Tes",
    deskripsi_en: "Tes",
    harga: 9000,
    harga_diskon: null,
    stok: 10,
    isBestSeller: false,
    created_at: "2025-09-26T04:12:33.534Z",
    updated_at: "2025-09-26T04:12:33.534Z",
    gambars: [
      {
        id: 5,
        file_path: "/images/roti_4_a.jpg",
        product_id: 4,
        created_at: "",
        updated_at: "",
      },
    ],
    jenis: [{ id: 4, nama_en: "Bread Type D", nama_id: "Jenis Roti D" }],
    hari: [
      { id: 4, nama_en: "Thursday", nama_id: "Kamis" },
      { id: 6, nama_en: "Saturday", nama_id: "Sabtu" },
    ],
    attributes: [
      { id: 4, harga: 10000, nama_en: "Bread Atr D", nama_id: "Atr Roti D" },
      {
        id: 8,
        harga: 4000,
        nama_en: "Add Chocolate",
        nama_id: "Tambah Cokelat",
      },
    ],
    bahans: [
      {
        id: 4,
        jumlah: 1,
        nama_en: "Bread Ingredient D",
        nama_id: "Bahan Roti D",
      },
    ],
  },
  {
    id: 5,
    nama_id: "Roti 5",
    nama_en: "Bread 5",
    deskripsi_id: "Tes",
    deskripsi_en: "Tes",
    harga: 11000,
    harga_diskon: null,
    stok: 10,
    isBestSeller: false,
    created_at: "2025-09-26T04:12:33.534Z",
    updated_at: "2025-09-26T04:12:33.534Z",
    gambars: [
      {
        id: 6,
        file_path: "/images/roti_5_a.jpg",
        product_id: 5,
        created_at: "",
        updated_at: "",
      },
    ],
    jenis: [{ id: 5, nama_en: "Bread Type E", nama_id: "Jenis Roti E" }],
    hari: [
      { id: 5, nama_en: "Friday", nama_id: "Jumat" },
      { id: 7, nama_en: "Sunday", nama_id: "Minggu" },
      { id: 3, nama_en: "Wednesday", nama_id: "Rabu" },
    ],
    attributes: [
      { id: 5, harga: 10000, nama_en: "Bread Atr E", nama_id: "Atr Roti E" },
      { id: 9, harga: 3500, nama_en: "Extra Cream", nama_id: "Extra Cream" },
    ],
    bahans: [
      {
        id: 5,
        jumlah: 1,
        nama_en: "Bread Ingredient E",
        nama_id: "Bahan Roti E",
      },
    ],
  },
  {
    id: 6,
    nama_id: "Roti 6",
    nama_en: "Bread 6",
    deskripsi_id: "Tes",
    deskripsi_en: "Tes",
    harga: 20000,
    harga_diskon: null,
    stok: 10,
    isBestSeller: false,
    created_at: "2025-09-26T04:12:33.534Z",
    updated_at: "2025-09-26T04:12:33.534Z",
    gambars: [
      {
        id: 7,
        file_path: "/images/roti_6_a.jpg",
        product_id: 6,
        created_at: "",
        updated_at: "",
      },
      {
        id: 8,
        file_path: "/images/roti_6_b.jpg",
        product_id: 6,
        created_at: "",
        updated_at: "",
      },
    ],
    jenis: [
      { id: 1, nama_en: "Bread Type A", nama_id: "Jenis Roti A" },
      { id: 2, nama_en: "Bread Type B", nama_id: "Jenis Roti B" },
      { id: 5, nama_en: "Bread Type E", nama_id: "Jenis Roti E" },
    ],
    hari: [
      { id: 1, nama_en: "Monday", nama_id: "Senin" },
      { id: 2, nama_en: "Tuesday", nama_id: "Selasa" },
      { id: 3, nama_en: "Wednesday", nama_id: "Rabu" },
      { id: 4, nama_en: "Thursday", nama_id: "Kamis" },
      { id: 5, nama_en: "Friday", nama_id: "Jumat" },
      { id: 6, nama_en: "Saturday", nama_id: "Sabtu" },
      { id: 7, nama_en: "Sunday", nama_id: "Minggu" },
    ],
    attributes: [
      { id: 1, harga: 10000, nama_en: "Cut", nama_id: "Potong" },
      { id: 9, harga: 3500, nama_en: "Extra Cream", nama_id: "Extra Cream" },
      {
        id: 8,
        harga: 4000,
        nama_en: "Add Chocolate",
        nama_id: "Tambah Cokelat",
      },
    ],
    bahans: [
      {
        id: 1,
        jumlah: 1,
        nama_en: "Bread Ingredient A",
        nama_id: "Bahan Roti A",
      },
    ],
  },
];

export const mockCategories: ProductType[] = [
  { id: 0, nama_id: "Semua Produk", nama_en: "All Products" },
  { id: 1, nama_id: "Jenis Roti A", nama_en: "Bread Type A" },
  { id: 2, nama_id: "Jenis Roti B", nama_en: "Bread Type B" },
  { id: 3, nama_id: "Jenis Roti C", nama_en: "Bread Type C" },
  { id: 4, nama_id: "Jenis Roti D", nama_en: "Bread Type D" },
  { id: 5, nama_id: "Jenis Roti E", nama_en: "Bread Type E" },
];

export const mockDays = [
  { id: "all", name: "Semua Hari", nameEn: "All Days" },
  { id: "1", name: "Senin", nameEn: "Monday" },
  { id: "2", name: "Selasa", nameEn: "Tuesday" },
  { id: "3", name: "Rabu", nameEn: "Wednesday" },
  { id: "4", name: "Kamis", nameEn: "Thursday" },
  { id: "5", name: "Jumat", nameEn: "Friday" },
  { id: "6", name: "Sabtu", nameEn: "Saturday" },
  { id: "7", name: "Minggu", nameEn: "Sunday" },
];
