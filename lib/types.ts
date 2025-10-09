import type { ProductAttribute } from "@/lib/api/mockData";

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