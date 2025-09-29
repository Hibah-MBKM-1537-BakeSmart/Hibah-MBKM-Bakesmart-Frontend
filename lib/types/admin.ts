// Shared interfaces for admin module

// Backend database structure interfaces
export interface BackendOrder {
  id: number;
  bukti_path?: string;
  status: 'pending' | 'verifying' | 'paid' | 'baked' | 'completed';
  waktu_ambil?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    nama: string;
    no_hp: string;
    role: 'admin' | 'user';
  };
  order_products?: BackendOrderItem[];
}

export interface BackendOrderItem {
  id: number;
  jumlah: number;
  harga_beli: number;
  note?: string;
  order_id: number;
  product_id: number;
  product?: {
    id: number;
    nama: string;
    deskripsi: string;
    harga: number;
    stok: number;
  };
}

// Frontend order structure from user side
export interface OrderAttribute {
  id: number;
  name: string;
  additionalPrice: number;
}

export interface FrontendOrderItem {
  productId: number;
  productName: string;
  category: string;
  quantity: number;
  basePrice: number;
  originalPrice: number | null;
  isDiscounted: boolean;
  selectedAttributes: OrderAttribute[];
  attributesPrice: number;
  totalItemPrice: number;
  orderDay: string;
  availableDays: string[];
  cartId: string;
  image: string;
}

export interface CustomerInfo {
  recipientName: string;
  phoneNumber: string;
  deliveryMode: 'delivery' | 'pickup';
  orderDay: string;
  address?: string;
  postalCode?: string;
  notes?: string;
  coordinates?: {
    latitude: string;
    longitude: string;
  };
}

export interface FrontendOrder {
  orderId: string;
  timestamp: string;
  paymentMethod: 'cash' | 'transfer' | 'card';
  paymentMethodLabel: string;
  totalItems: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  totalAmount: number;
  currency: string;
  customer: CustomerInfo;
  items: FrontendOrderItem[];
  status: 'pending' | 'processing' | 'ready' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  deliveryDate?: Date;
}

// Customer interfaces
export interface Customer {
  id: number;
  nama: string;
  email?: string;
  no_hp: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at?: string;
  // Computed fields
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string;
}

// Filter interfaces
export interface HistoryFilters {
  searchQuery: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  status: string;
  period: 'today' | 'week' | 'month' | 'custom' | 'all';
}

export interface CustomersFilters {
  searchQuery: string;
  role: 'all' | 'admin' | 'user';
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  sortBy: 'name' | 'recent' | 'orders' | 'spent';
  sortOrder: 'asc' | 'desc';
}

// Admin states
export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
  todayOrders: number;
  todayRevenue: number;
}
