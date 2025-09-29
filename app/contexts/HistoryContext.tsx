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
  product?: {
    id: number;
    nama: string;
    deskripsi: string;
    harga: number;
    stok: number;
  };
}

// Based on orders table structure
export interface Order {
  id: number;
  bukti_path?: string;
  status: 'completed' | 'cancelled';
  waktu_ambil?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  // Related data via joins
  user?: {
    id: number;
    nama: string;
    no_hp: string;
    role: 'admin' | 'user';
  };
  order_products?: OrderItem[];
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
    isLoading: false,
    showOrderDetail: false
  });

  // Mock data matching backend structure
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: 1,
        bukti_path: '/uploads/bukti_1.jpg',
        status: 'completed',
        waktu_ambil: '2024-12-15T10:30:00.000Z',
        user_id: 2,
        created_at: '2024-12-15T08:00:00.000Z',
        updated_at: '2024-12-15T11:00:00.000Z',
        user: {
          id: 2,
          nama: 'Budi Santoso',
          no_hp: '081234567890',
          role: 'user'
        },
        order_products: [
          {
            id: 1,
            jumlah: 1,
            harga_beli: 125000,
            order_id: 1,
            product_id: 1,
            product: {
              id: 1,
              nama: 'Chocolate Cake',
              deskripsi: 'Rich chocolate cake with cream frosting',
              harga: 125000,
              stok: 10
            }
          },
          {
            id: 2,
            jumlah: 6,
            harga_beli: 90000,
            order_id: 1,
            product_id: 2,
            product: {
              id: 2,
              nama: 'Red Velvet Cupcakes',
              deskripsi: 'Classic red velvet cupcakes (per piece)',
              harga: 15000,
              stok: 24
            }
          }
        ]
      },
      {
        id: 2,
        bukti_path: '/uploads/bukti_2.jpg',
        status: 'completed',
        waktu_ambil: '2024-12-15T16:00:00.000Z',
        user_id: 3,
        created_at: '2024-12-15T12:00:00.000Z',
        updated_at: '2024-12-15T15:30:00.000Z',
        user: {
          id: 3,
          nama: 'Siti Nurhasanah',
          no_hp: '082345678901',
          role: 'user'
        },
        order_products: [
          {
            id: 3,
            jumlah: 1,
            harga_beli: 200000,
            note: 'Custom message: Happy Birthday Sarah!',
            order_id: 2,
            product_id: 4,
            product: {
              id: 4,
              nama: 'Birthday Cake',
              deskripsi: 'Custom birthday cake with decoration',
              harga: 200000,
              stok: 5
            }
          }
        ]
      },
      {
        id: 3,
        bukti_path: '/uploads/bukti_3.jpg',
        status: 'completed',
        waktu_ambil: '2024-12-14T17:00:00.000Z',
        user_id: 4,
        created_at: '2024-12-14T14:00:00.000Z',
        updated_at: '2024-12-14T17:30:00.000Z',
        user: {
          id: 4,
          nama: 'Ahmad Wijaya',
          no_hp: '083456789012',
          role: 'user'
        },
        order_products: [
          {
            id: 4,
            jumlah: 2,
            harga_beli: 120000,
            order_id: 3,
            product_id: 5,
            product: {
              id: 5,
              nama: 'Donuts Box (12 pcs)',
              deskripsi: 'Mixed flavors donut box',
              harga: 60000,
              stok: 8
            }
          },
          {
            id: 5,
            jumlah: 8,
            harga_beli: 96000,
            order_id: 3,
            product_id: 3,
            product: {
              id: 3,
              nama: 'Croissant',
              deskripsi: 'Buttery French croissant',
              harga: 12000,
              stok: 15
            }
          }
        ]
      },
      {
        id: 4,
        status: 'cancelled',
        waktu_ambil: '2024-12-20T10:00:00.000Z',
        user_id: 5,
        created_at: '2024-12-14T08:00:00.000Z',
        updated_at: '2024-12-14T08:30:00.000Z',
        user: {
          id: 5,
          nama: 'Rina Marlina',
          no_hp: '084567890123',
          role: 'user'
        },
        order_products: [
          {
            id: 6,
            jumlah: 1,
            harga_beli: 750000,
            note: 'Wedding on Dec 20, cancelled due to venue issue',
            order_id: 4,
            product_id: 4,
            product: {
              id: 4,
              nama: 'Wedding Cake',
              deskripsi: 'Custom wedding cake with decoration',
              harga: 750000,
              stok: 2
            }
          }
        ]
      },
      {
        id: 5,
        status: 'cancelled',
        user_id: 6,
        created_at: '2024-12-15T16:00:00.000Z',
        updated_at: '2024-12-15T16:00:00.000Z',
        user: {
          id: 6,
          nama: 'Made Sutrisno',
          no_hp: '085678901234',
          role: 'user'
        },
        order_products: [
          {
            id: 7,
            jumlah: 5,
            harga_beli: 125000,
            note: 'Cancelled by customer request',
            order_id: 5,
            product_id: 6,
            product: {
              id: 6,
              nama: 'Cheese Tart',
              deskripsi: 'Creamy cheese tart',
              harga: 25000,
              stok: 12
            }
          }
        ]
      },
      {
        id: 6,
        bukti_path: '/uploads/bukti_6.jpg',
        status: 'completed',
        waktu_ambil: '2024-12-13T14:30:00.000Z',
        user_id: 7,
        created_at: '2024-12-13T09:00:00.000Z',
        updated_at: '2024-12-13T15:00:00.000Z',
        user: {
          id: 7,
          nama: 'Dewi Sartika',
          no_hp: '086789012345',
          role: 'user'
        },
        order_products: [
          {
            id: 8,
            jumlah: 12,
            harga_beli: 180000,
            order_id: 6,
            product_id: 2,
            product: {
              id: 2,
              nama: 'Red Velvet Cupcakes',
              deskripsi: 'Classic red velvet cupcakes (per piece)',
              harga: 15000,
              stok: 24
            }
          }
        ]
      },
      {
        id: 7,
        status: 'cancelled',
        user_id: 8,
        created_at: '2024-12-12T16:00:00.000Z',
        updated_at: '2024-12-12T16:30:00.000Z',
        user: {
          id: 8,
          nama: 'Agus Pratama',
          no_hp: '087890123456',
          role: 'user'
        },
        order_products: [
          {
            id: 9,
            jumlah: 3,
            harga_beli: 375000,
            note: 'Cancelled - payment issue',
            order_id: 7,
            product_id: 1,
            product: {
              id: 1,
              nama: 'Chocolate Cake',
              deskripsi: 'Rich chocolate cake with cream frosting',
              harga: 125000,
              stok: 10
            }
          }
        ]
      }
    ];

    setState(prev => ({
      ...prev,
      orders: mockOrders,
      filteredOrders: mockOrders
    }));
  }, []);

  // Filter orders based on current filters
  useEffect(() => {
    let filtered = [...state.orders];

    // Search filter
    if (state.filters.searchQuery) {
      const query = state.filters.searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toString().includes(query) ||
        order.user?.nama.toLowerCase().includes(query) ||
        order.user?.no_hp.includes(query)
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
      const totalAmount = order.order_products?.reduce((sum, item) => sum + item.harga_beli, 0) || 0;
      const itemsText = order.order_products?.map(item => 
        `${item.product?.nama || 'Unknown'} (${item.jumlah}x)`
      ).join(', ') || '';
      
      return {
        'Order ID': order.id,
        'Date': new Date(order.created_at).toLocaleDateString('id-ID'),
        'Time': new Date(order.created_at).toLocaleTimeString('id-ID'),
        'Customer Name': order.user?.nama || '',
        'Customer Phone': order.user?.no_hp || '',
        'Items': itemsText,
        'Total Amount': `Rp ${totalAmount.toLocaleString('id-ID')}`,
        'Status': order.status,
        'Pickup Time': order.waktu_ambil ? new Date(order.waktu_ambil).toLocaleString('id-ID') : '',
        'Bukti Path': order.bukti_path || ''
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

  const refreshOrders = () => {
    setState(prev => ({ ...prev, isLoading: true }));
    // Simulate API call
    setTimeout(() => {
      setState(prev => ({ ...prev, isLoading: false }));
    }, 1000);
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
