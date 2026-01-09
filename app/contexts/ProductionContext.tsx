'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ProductionStatus = 'ongoing' | 'completed' | 'cancelled';

// Backend order product structure
interface BackendOrderProduct {
  product_id: number;
  product_name_id: string;
  product_name_en?: string;
  product_price: number;
  jumlah: number;
  harga_beli: number;
  note?: string;
}

// Backend order structure
interface BackendOrder {
  id: number;
  user_id: number;
  user?: {
    id: number;
    nama: string;
    no_hp: string;
  };
  total_harga: number;
  status: string;
  production_status?: 'in_production' | 'completed';
  products: BackendOrderProduct[];
  created_at?: string;
  note?: string;
}

// Backend order group structure
interface OrderGroup {
  id: number;
  tanggal: string;
  orders: BackendOrder[];
}

// Based on orders table structure from backend
export interface Order {
  id: number;
  bukti_path?: string;
  status: ProductionStatus;
  waktu_ambil?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  production_status?: 'in_production' | 'completed';
  // Related data via joins
  user?: {
    id: number;
    nama: string;
    no_hp: string;
    role: 'admin' | 'user';
  };
  order_products?: OrderProduct[];
}

// Based on order_product table structure
export interface OrderProduct {
  id: number;
  jumlah: number;
  harga_beli: number;
  note?: string;
  order_id: number;
  product_id: number;
  // Related data via joins
  product?: {
    id: number;
    nama: string;
    deskripsi: string;
    harga: number;
    stok: number;
    gambars?: Array<{ id: number; file_path: string; product_id: number }>;
  };
}

export interface ProductionSummary {
  totalOrders: number;
  ongoing: number;
  completed: number;
  cancelled: number;
  inProduction: number;
  productionCompleted: number;
}

interface ProductionContextType {
  orders: Order[];
  summary: ProductionSummary;
  selectedDate: Date;
  dateRange: { start: Date; end: Date };
  isLoading: boolean;
  error: string | null;
  updateOrderStatus: (orderId: number, status: ProductionStatus) => Promise<void>;
  updateProductionStatus: (orderId: number, productionStatus: 'in_production' | 'completed') => Promise<void>;
  deleteOrder: (orderId: number) => Promise<void>;
  setSelectedDate: (date: Date) => void;
  setDateRange: (range: { start: Date; end: Date }) => void;
  getOrdersByDate: (date: Date) => Order[];
  getOrdersByStatus: (status: ProductionStatus) => Order[];
  refreshData: () => Promise<void>;
}

const ProductionContext = createContext<ProductionContextType | undefined>(undefined);

// Transform backend data to frontend Order format
const transformBackendData = (groups: OrderGroup[]): Order[] => {
  const allOrders: Order[] = [];

  groups.forEach((group) => {
    group.orders.forEach((order) => {
      // Map backend status to frontend status
      let frontendStatus: ProductionStatus = 'ongoing';
      if (order.status === 'completed') frontendStatus = 'completed';
      else if (order.status === 'cancelled') frontendStatus = 'cancelled';

      allOrders.push({
        id: order.id,
        user_id: order.user_id,
        status: frontendStatus,
        production_status: order.production_status,
        waktu_ambil: group.tanggal,
        created_at: order.created_at || group.tanggal,
        updated_at: order.created_at || group.tanggal,
        user: order.user ? {
          id: order.user.id,
          nama: order.user.nama,
          no_hp: order.user.no_hp,
          role: 'user'
        } : {
          id: order.user_id,
          nama: 'Unknown',
          no_hp: '-',
          role: 'user'
        },
        order_products: order.products.map((p) => ({
          id: p.product_id,
          jumlah: p.jumlah,
          harga_beli: p.harga_beli,
          note: p.note || '',
          order_id: order.id,
          product_id: p.product_id,
          product: {
            id: p.product_id,
            nama: p.product_name_id,
            deskripsi: '',
            harga: p.product_price,
            stok: 0,
          }
        }))
      });
    });
  });

  return allOrders;
};

export function ProductionProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  });

  // Fetch orders from backend API
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('[ProductionContext] Fetching orders from backend...');
      const response = await fetch('/api/orders/group', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const result = await response.json();
      console.log('[ProductionContext] Backend response:', result);

      if (Array.isArray(result.data)) {
        const transformedOrders = transformBackendData(result.data);
        console.log(`[ProductionContext] Transformed ${transformedOrders.length} orders`);
        setOrders(transformedOrders);
      } else {
        console.error('[ProductionContext] Unexpected response format:', result);
        setError('Format response tidak sesuai');
        setOrders([]);
      }
    } catch (err) {
      console.error('[ProductionContext] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat data');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const summary: ProductionSummary = {
    totalOrders: orders.length,
    ongoing: orders.filter(order => order.status === 'ongoing').length,
    completed: orders.filter(order => order.status === 'completed').length,
    cancelled: orders.filter(order => order.status === 'cancelled').length,
    inProduction: orders.filter(order => order.production_status === 'in_production').length,
    productionCompleted: orders.filter(order => order.production_status === 'completed').length,
  };

  const updateOrderStatus = async (orderId: number, status: ProductionStatus) => {
    try {
      // Optimistic update
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status } : order
        )
      );

      // Call backend API - PUT /orders/{id}/status
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        console.error('[ProductionContext] Failed to update order status');
        // Revert on error
        await fetchOrders();
      }
    } catch (err) {
      console.error('[ProductionContext] Error updating order status:', err);
      // Revert on error
      await fetchOrders();
    }
  };

  const updateProductionStatus = async (orderId: number, productionStatus: 'in_production' | 'completed') => {
    try {
      // Optimistic update
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, production_status: productionStatus } : order
        )
      );

      // Call backend API - PUT /orders/{id}/production
      const response = await fetch(`/api/orders/${orderId}/production`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ production_status: productionStatus }),
      });

      if (!response.ok) {
        console.error('[ProductionContext] Failed to update production status');
        // Revert on error
        await fetchOrders();
      }
    } catch (err) {
      console.error('[ProductionContext] Error updating production status:', err);
      // Revert on error
      await fetchOrders();
    }
  };

  const deleteOrder = async (orderId: number) => {
    try {
      // Optimistic update
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));

      // Call backend API - DELETE /orders/{id}
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('[ProductionContext] Failed to delete order');
        // Revert on error
        await fetchOrders();
      }
    } catch (err) {
      console.error('[ProductionContext] Error deleting order:', err);
      // Revert on error
      await fetchOrders();
    }
  };

  const getOrdersByDate = (date: Date) => {
    return orders.filter(order => {
      if (!order.waktu_ambil) return false;
      const orderDate = new Date(order.waktu_ambil);
      return orderDate.toDateString() === date.toDateString();
    });
  };

  const getOrdersByStatus = (status: ProductionStatus) => {
    return orders.filter(order => order.status === status);
  };

  const refreshData = async () => {
    console.log('[ProductionContext] Refreshing production data...');
    await fetchOrders();
  };

  const contextValue: ProductionContextType = {
    orders,
    summary,
    selectedDate,
    dateRange,
    isLoading,
    error,
    updateOrderStatus,
    updateProductionStatus,
    deleteOrder,
    setSelectedDate,
    setDateRange,
    getOrdersByDate,
    getOrdersByStatus,
    refreshData
  };

  return (
    <ProductionContext.Provider value={contextValue}>
      {children}
    </ProductionContext.Provider>
  );
}

export function useProduction() {
  const context = useContext(ProductionContext);
  if (context === undefined) {
    throw new Error('useProduction must be used within a ProductionProvider');
  }
  return context;
}
