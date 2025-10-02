export interface MenuItem {
  id: number;
  name: string;
  category: string;
  availableDays: string[];
  discountPrice: string;
  originalPrice?: string;
  isDiscount: boolean;
  stock: number;
  image: string;
  description: string;
  ingredients: string;
  notes: string;
  isBestSeller?: boolean;
  attributes?: ProductAttribute[];
}

export interface ProductAttribute {
  id: number;
  name: string;
  additionalPrice: number;
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

// Mock menu data
export const mockMenuItems: MenuItem[] = [
  {
    id: 1,
    name: "Foccacia Plain",
    category: "foccacia",
    availableDays: ["senin", "rabu", "jumat"],
    discountPrice: "Rp20,000",
    originalPrice: "Rp25,000",
    isDiscount: true,
    stock: 15,
    image: "/img/Roti.png",
    description:
      "Roti foccacia lembut dengan tekstur yang sempurna. Dibuat dengan bahan-bahan berkualitas tinggi dan dipanggang hingga golden brown. Cocok untuk sarapan atau camilan sore hari.",
    ingredients:
      "Tepung terigu premium, ragi aktif, minyak zaitun, garam laut, air mineral",
    notes:
      "Mengandung gluten, telur, dan susu. Dapat disimpan dalam suhu ruang selama 2-3 hari. Untuk hasil terbaik, panaskan sebentar sebelum disajikan. Tersedia juga varian dengan topping herbs dan olive oil. Sangat cocok untuk sarapan dengan kopi atau teh panas.",
    isBestSeller: true,
    attributes: [
      { id: 1, name: "Extra Herbs", additionalPrice: 3000 },
      { id: 2, name: "Olive Oil Drizzle", additionalPrice: 2000 },
    ],
  },
  {
    id: 2,
    name: "Turkish Cheese Bread",
    category: "turkish-cheese",
    availableDays: ["selasa", "kamis", "sabtu"],
    discountPrice: "Rp25,000",
    originalPrice: "Rp32,000",
    isDiscount: false,
    stock: 8,
    image: "/red-velvet-cake-slice-with-cream-cheese-frosting.jpg",
    description:
      "Roti Turki dengan keju yang melimpah. Tekstur lembut dengan rasa keju yang gurih dan creamy.",
    ingredients:
      "Tepung terigu Turki, keju mozzarella, keju feta, telur segar, susu murni, mentega",
    notes:
      "Dibuat dengan resep tradisional Turki. Menggunakan keju import premium. Sangat cocok untuk sarapan atau makan siang. Dapat dipanaskan kembali di oven untuk mengembalikan tekstur keju yang meleleh. Proses pembuatan menggunakan teknik tradisional dari Istanbul.",
    isBestSeller: true,
  },
  {
    id: 3,
    name: "Country Bread Klasik",
    category: "country-bread",
    availableDays: ["senin", "selasa", "rabu", "kamis", "jumat"],
    discountPrice: "Rp18,000",
    originalPrice: "Rp23,000",
    isDiscount: true,
    stock: 20,
    image: "/blueberry-muffin-with-fresh-blueberries.jpg",
    description:
      "Roti country dengan tekstur padat dan rasa yang khas. Sempurna untuk sandwich atau dimakan langsung.",
    ingredients:
      "Tepung gandum utuh, biji-bijian, madu alami, ragi alami, garam laut",
    notes:
      "Menggunakan tepung gandum utuh organik. Tanpa pengawet buatan. Kaya serat dan nutrisi. Dapat disimpan dalam wadah kedap udara hingga 1 minggu. Tersedia juga varian dengan biji wijen dan biji bunga matahari. Tekstur yang padat dan rasa gandum yang autentik.",
  },
  {
    id: 4,
    name: "Country Loaf Spesial",
    category: "country-loaf",
    availableDays: ["jumat", "sabtu", "minggu"],
    discountPrice: "Rp35,000",
    originalPrice: "Rp42,000",
    isDiscount: true,
    stock: 5,
    image: "/cinnamon-roll-with-glaze.jpg",
    description:
      "Loaf country premium dengan fermentasi panjang. Rasa yang kompleks dan tekstur yang sempurna.",
    ingredients:
      "Tepung gandum organik, starter alami, biji-bijian campuran, madu, garam laut",
    notes:
      "Proses fermentasi 48 jam untuk rasa yang optimal. Lebih mudah dicerna dan memiliki nilai gizi tinggi. Cocok untuk diet sehat. Dapat disimpan hingga 2 minggu dalam freezer. Slice sesuai kebutuhan. Dibuat dengan starter yang sudah berumur 10 tahun.",
    isBestSeller: true,
  },
  {
    id: 5,
    name: "Center Piece Artisan",
    category: "center-piece",
    availableDays: ["sabtu", "minggu"],
    discountPrice: "Rp45,000",
    originalPrice: "Rp55,000",
    isDiscount: false,
    stock: 3,
    image: "/chocolate-chip-cookies-golden-brown.jpg",
    description:
      "Roti artisan premium yang menjadi center piece di meja makan. Bentuk dan rasa yang istimewa.",
    ingredients:
      "Tepung premium, mentega Eropa, telur organik, susu sapi murni, ragi premium",
    notes:
      "Dibuat khusus untuk acara spesial dan presentasi. Bentuk yang artistik dan rasa yang luar biasa. Cocok untuk hadiah atau acara penting. Kemasan premium tersedia. Pre-order 2 hari sebelumnya. Setiap loaf dibuat dengan perhatian detail yang tinggi.",
  },
  {
    id: 6,
    name: "Gandum 4 Grain",
    category: "gandum",
    availableDays: ["senin", "rabu", "jumat", "minggu"],
    discountPrice: "Rp28,000",
    isDiscount: true,
    stock: 12,
    image: "/red-velvet-cake-slice-with-cream-cheese-frosting.jpg",
    description:
      "Roti gandum dengan 4 jenis biji-bijian pilihan. Kaya nutrisi dan serat untuk kesehatan optimal.",
    ingredients:
      "Tepung gandum utuh, biji quinoa, biji chia, biji flax, biji bunga matahari",
    notes:
      "Menggunakan 4 jenis superfood grains. Kaya omega-3 dan protein nabati. Cocok untuk diet sehat dan vegetarian. Tersedia dalam ukuran regular dan jumbo. Tekstur yang unik dengan crunch dari biji-bijian. Sangat bergizi dan mengenyangkan.",
  },
  {
    id: 7,
    name: "Roti Isi Ayam",
    category: "roti-isi",
    availableDays: ["selasa", "kamis", "sabtu"],
    discountPrice: "Rp22,000",
    originalPrice: "Rp28,000",
    isDiscount: true,
    stock: 10,
    image: "/cinnamon-roll-with-glaze.jpg",
    description:
      "Roti lembut dengan isian ayam yang gurih dan sayuran segar. Sempurna untuk makan siang.",
    ingredients:
      "Tepung terigu, daging ayam fillet, wortel, kentang, bawang bombay, rempah pilihan",
    notes:
      "Isian ayam dibuat fresh setiap hari. Tanpa MSG dan pengawet buatan. Sayuran segar dari petani lokal. Sangat mengenyangkan dan bergizi. Tersedia juga varian isi daging sapi dan tuna. Cocok untuk bekal kerja atau sekolah.",
    isBestSeller: true,
  },
  {
    id: 8,
    name: "Roti Kopi Mocha",
    category: "roti-kopi",
    availableDays: [
      "senin",
      "selasa",
      "rabu",
      "kamis",
      "jumat",
      "sabtu",
      "minggu",
    ],
    discountPrice: "Rp20,000",
    originalPrice: "Rp26,000",
    isDiscount: false,
    stock: 15,
    image: "/blueberry-muffin-with-fresh-blueberries.jpg",
    description:
      "Roti dengan aroma dan rasa kopi yang khas. Kombinasi sempurna antara roti dan kopi dalam satu gigitan.",
    ingredients:
      "Tepung terigu, kopi arabica premium, cokelat, gula aren, telur, mentega",
    notes:
      "Menggunakan kopi arabica single origin. Aroma kopi yang harum dan rasa yang tidak terlalu manis. Cocok untuk pecinta kopi. Dapat dinikmati dengan atau tanpa minuman. Tersedia juga varian espresso dan cappuccino. Tekstur yang lembut dengan hint rasa kopi yang autentik.",
    isBestSeller: true,
    attributes: [
      { id: 1, name: "Potong Roti", additionalPrice: 2000 },
      { id: 2, name: "Tambah Coklat", additionalPrice: 5000 },
    ],
  },
];

export const mockCategories: Category[] = [
  { id: "all", name: "Semua Produk", nameEn: "All Products" },
  { id: "turkish-cheese", name: "Turkish Cheese", nameEn: "Turkish Cheese" },
  { id: "country-bread", name: "Country Bread", nameEn: "Country Bread" },
  { id: "country-loaf", name: "Country Loaf", nameEn: "Country Loaf" },
  { id: "center-piece", name: "Center Piece", nameEn: "Center Piece" },
  { id: "gandum", name: "Gandum", nameEn: "Wheat" },
  { id: "foccacia", name: "Foccacia", nameEn: "Foccacia" },
  { id: "roti-isi", name: "Roti Isi", nameEn: "Filled Bread" },
  { id: "roti-kopi", name: "Roti Kopi", nameEn: "Coffee Bread" },
];

export const mockDays = [
  { id: "all", name: "Semua Hari", nameEn: "All Days" },
  { id: "senin", name: "Senin", nameEn: "Monday" },
  { id: "selasa", name: "Selasa", nameEn: "Tuesday" },
  { id: "rabu", name: "Rabu", nameEn: "Wednesday" },
  { id: "kamis", name: "Kamis", nameEn: "Thursday" },
  { id: "jumat", name: "Jumat", nameEn: "Friday" },
  { id: "sabtu", name: "Sabtu", nameEn: "Saturday" },
  { id: "minggu", name: "Minggu", nameEn: "Sunday" },
];
