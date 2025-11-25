'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
}

// Based on orders table structure
export interface Order {
  id: number;
  bukti_path?: string;
  status: 'verifying' | 'paid' | 'processing' | 'completed' | 'cancelled';
  waktu_ambil?: string;
  user_id?: number;
  total_harga?: number;
  provider?: string;
  courier_name?: string;
  shipping_cost?: number;
  tracking_link?: string;
  note?: string;
  biteship_id?: string;
  created_at: string;
  updated_at: string;
  // Related data via joins
  products?: OrderItem[];
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

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        
        const response = await fetch('/api/orders?relation=products', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          setState(prev => ({
            ...prev,
            orders: result.data,
            filteredOrders: result.data,
            isLoading: false
          }));
        } else {
          console.error('Invalid response format:', result);
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchOrders();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter orders based on current filters
  useEffect(() => {
    let filtered = [...state.orders];

    // Search filter by order ID
    if (state.filters.searchQuery) {
      const query = state.filters.searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toString().includes(query)
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
      const totalAmount = order.total_harga || 0;
      const itemsText = order.products?.map((item: OrderItem) => 
        `${item.nama_id || item.nama_en || 'Unknown'} (${item.jumlah}x)`
      ).join(', ') || '';
      
      return {
        'Order ID': order.id,
        'Date': new Date(order.created_at).toLocaleDateString('id-ID'),
        'Time': new Date(order.created_at).toLocaleTimeString('id-ID'),
        'Items': itemsText,
        'Total Amount': `Rp ${totalAmount.toLocaleString('id-ID')}`,
        'Status': order.status,
        'Pickup Time': order.waktu_ambil ? new Date(order.waktu_ambil).toLocaleString('id-ID') : '',
        'Provider': order.provider || '',
        'Courier': order.courier_name || '',
        'Shipping Cost': order.shipping_cost ? `Rp ${order.shipping_cost.toLocaleString('id-ID')}` : '',
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
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await fetch('/api/orders?relation=products', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          orders: result.data,
          isLoading: false
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error refreshing orders:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
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
