'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";

// Based on order_product table structure
export interface OrderItem {
  id: number;
  jumlah: number;
  harga_beli: number;
  note?: string;
  order_id: number;
  product_id: number;
  // Related product data via join
  nama_id?: string;
  nama_en?: string;
  // Backend response format from /orders/group
  product_name_id?: string;
  product_name_en?: string;
  product_price?: number;
}

// Based on orders table structure and backend response from /orders/group
export interface Order {
  id: number;
  bukti_path?: string;
  status: 'pending' | 'verifying' | 'paid' | 'processing' | 'completed' | 'cancelled';
  waktu_ambil?: string;
  user_id?: number;
  total_harga?: number | string;
  provider?: string;
  courier_name?: string;
  shipping_cost?: number | string;
  tracking_link?: string;
  note?: string;
  biteship_id?: string;
  created_at: string;
  updated_at: string;
  // Related data via joins
  products?: OrderItem[];
  // Customer info — embedded from /orders/group user object
  customer_name?: string;
  customer_phone?: string;
}

interface HistoryFilters {
  searchQuery: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  status: string;
  period: 'today' | 'week' | 'month' | 'custom' | 'all';
}

interface HistoryState {
  orders: Order[];
  filteredOrders: Order[];
  filters: HistoryFilters;
  selectedOrder: Order | null;
  isLoading: boolean;
  showOrderDetail: boolean;
}

interface HistoryContextType {
  state: HistoryState;
  updateFilters: (filters: Partial<HistoryFilters>) => void;
  selectOrder: (order: Order) => void;
  closeOrderDetail: () => void;
  exportToCSV: () => void;
  refreshOrders: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

/**
 * Transform /orders/group response into a flat Order[] array.
 * Each group has { id, tanggal, orders: [...] }.
 * Each order inside has { id, ..., user: { id, nama, no_hp }, products: [...] }.
 * We flatten all groups and map user → customer_name / customer_phone.
 */
function flattenOrderGroups(groups: any[]): Order[] {
  const allOrders: Order[] = [];

  groups.forEach((group: any) => {
    if (!Array.isArray(group.orders)) return;

    group.orders.forEach((order: any) => {
      allOrders.push({
        id: order.id,
        bukti_path: order.bukti_path,
        status: order.status,
        waktu_ambil: order.waktu_ambil,
        user_id: order.user?.id ?? order.user_id,
        total_harga: Number(order.total_harga),
        provider: order.provider,
        courier_name: order.courier_name,
        shipping_cost: Number(order.shipping_cost),
        tracking_link: order.tracking_link,
        note: order.note,
        biteship_id: order.biteship_id,
        created_at: order.created_at || group.tanggal,
        updated_at: order.updated_at || order.created_at || group.tanggal,
        products: (order.products || []).map((p: any) => ({
          id: p.product_id,
          order_id: order.id,
          product_id: p.product_id,
          jumlah: p.jumlah,
          harga_beli: p.harga_beli,
          note: p.note || '',
          product_name_id: p.product_name_id,
          product_name_en: p.product_name_en,
          product_price: p.product_price,
        })),
        // Map user object → customer fields
        customer_name: order.user?.nama || undefined,
        customer_phone: order.user?.no_hp || undefined,
      });
    });
  });

  return allOrders;
}

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<HistoryState>({
    orders: [],
    filteredOrders: [],
    filters: {
      searchQuery: '',
      dateRange: { from: null, to: null },
      status: 'all',
      period: 'all'
    },
    selectedOrder: null,
    isLoading: true,
    showOrderDetail: false
  });

  // Fetch orders from /api/orders/group (includes user object in each order)
  const doFetchOrders = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await fetchWithAuth('/api/orders/group', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const result = await response.json();
      // Backend: { message: "Order retrieved", data: [...groups] }
      const groups = result.data;

      if (Array.isArray(groups)) {
        const orders = flattenOrderGroups(groups);
        setState(prev => ({
          ...prev,
          orders,
          filteredOrders: orders,
          isLoading: false,
        }));
      } else {
        console.error('[HistoryContext] Unexpected response format:', result);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('[HistoryContext] Error fetching orders:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    doFetchOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(doFetchOrders, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter orders based on current filters
  useEffect(() => {
    let filtered = [...state.orders];

    // Search by order ID or customer name
    if (state.filters.searchQuery) {
      const query = state.filters.searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toString().includes(query) ||
        (order.customer_name && order.customer_name.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (state.filters.status && state.filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === state.filters.status);
    }

    // Date range filter
    if (state.filters.dateRange.from && state.filters.dateRange.to) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= state.filters.dateRange.from! && orderDate <= state.filters.dateRange.to!;
      });
    }

    // Period filter
    if (state.filters.period !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (state.filters.period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0);
      }

      if (state.filters.period !== 'custom') {
        filtered = filtered.filter(order => new Date(order.created_at) >= startDate);
      }
    }

    setState(prev => ({
      ...prev,
      filteredOrders: filtered
    }));
  }, [state.orders, state.filters]);

  const updateFilters = (newFilters: Partial<HistoryFilters>) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...newFilters
      }
    }));
  };

  const selectOrder = (order: Order) => {
    setState(prev => ({
      ...prev,
      selectedOrder: order,
      showOrderDetail: true
    }));
  };

  const closeOrderDetail = () => {
    setState(prev => ({
      ...prev,
      selectedOrder: null,
      showOrderDetail: false
    }));
  };

  const exportToCSV = () => {
    const csvData = state.filteredOrders.map(order => {
      const totalAmount = typeof order.total_harga === 'string'
        ? parseFloat(order.total_harga)
        : (order.total_harga || 0);
      const shippingCost = typeof order.shipping_cost === 'string'
        ? parseFloat(order.shipping_cost)
        : (order.shipping_cost || 0);

      const itemsText = order.products?.map((item: OrderItem) =>
        `${item.product_name_id || item.nama_id || item.product_name_en || item.nama_en || 'Unknown'} (${item.jumlah}x)`
      ).join(', ') || '';

      return {
        'Order ID': order.id,
        'Customer': order.customer_name || '-',
        'Phone': order.customer_phone || '-',
        'Date': new Date(order.created_at).toLocaleDateString('id-ID'),
        'Time': new Date(order.created_at).toLocaleTimeString('id-ID'),
        'Items': itemsText,
        'Total Amount': `Rp ${totalAmount.toLocaleString('id-ID')}`,
        'Status': order.status,
        'Pickup Time': order.waktu_ambil ? new Date(order.waktu_ambil).toLocaleString('id-ID') : '',
        'Provider': order.provider || '',
        'Courier': order.courier_name || '',
        'Shipping Cost': `Rp ${shippingCost.toLocaleString('id-ID')}`,
        'Tracking Link': order.tracking_link || '',
        'Biteship ID': order.biteship_id || '',
        'Note': order.note || ''
      };
    });

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `order-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const refreshOrders = async () => {
    await doFetchOrders();
  };

  const contextValue: HistoryContextType = {
    state,
    updateFilters,
    selectOrder,
    closeOrderDetail,
    exportToCSV,
    refreshOrders
  };

  return (
    <HistoryContext.Provider value={contextValue}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
