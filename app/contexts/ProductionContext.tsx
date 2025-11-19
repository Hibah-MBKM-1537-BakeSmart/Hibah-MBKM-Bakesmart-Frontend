'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ProductionStatus = 'pending' | 'verifying' | 'paid' | 'baked' | 'completed' | 'incompleted';

// Based on orders table structure from backend
export interface Order {
  id: number;
  bukti_path?: string;
  status: ProductionStatus;
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
  pending: number;
  verifying: number;
  paid: number;
  baked: number;
  completed: number;
  incompleted: number;
}

interface ProductionContextType {
  orders: Order[];
  summary: ProductionSummary;
  selectedDate: Date;
  dateRange: { start: Date; end: Date };
  updateOrderStatus: (orderId: number, status: ProductionStatus) => void;
  deleteOrder: (orderId: number) => void;
  setSelectedDate: (date: Date) => void;
  setDateRange: (range: { start: Date; end: Date }) => void;
  getOrdersByDate: (date: Date) => Order[];
  getOrdersByStatus: (status: ProductionStatus) => Order[];
  refreshData: () => void;
}

const ProductionContext = createContext<ProductionContextType | undefined>(undefined);

export function ProductionProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  });

  // Demo data matching backend structure
  useEffect(() => {
    const demoOrders: Order[] = [
      {
        id: 1,
        bukti_path: '/uploads/bukti_1.jpg',
        status: 'paid',
        waktu_ambil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        user_id: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: 2,
          nama: 'John Doe',
          no_hp: '08123456791',
          role: 'user'
        },
        order_products: [
          {
            id: 1,
            jumlah: 2,
            harga_beli: 250000,
            note: 'Birthday cake with custom writing',
            order_id: 1,
            product_id: 1,
            product: {
              id: 1,
              nama: 'Chocolate Cake',
              deskripsi: 'Rich chocolate cake with cream frosting',
              harga: 125000,
              stok: 10,
              gambars: [{ id: 1, file_path: '/img/chocolate-cake.jpg', product_id: 1 }]
            }
          }
        ]
      },
      {
        id: 2,
        bukti_path: '/uploads/bukti_2.jpg',
        status: 'baked',
        waktu_ambil: new Date().toISOString(),
        user_id: 3,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: 3,
          nama: 'Jane Smith',
          no_hp: '08123456792',
          role: 'user'
        },
        order_products: [
          {
            id: 2,
            jumlah: 12,
            harga_beli: 180000,
            order_id: 2,
            product_id: 2,
            product: {
              id: 2,
              nama: 'Red Velvet Cupcakes',
              deskripsi: 'Classic red velvet cupcakes (per piece)',
              harga: 15000,
              stok: 24,
              gambars: [{ id: 2, file_path: '/img/red-velvet-cupcakes.jpg', product_id: 2 }]
            }
          }
        ]
      },
      {
        id: 3,
        bukti_path: '/uploads/bukti_3.jpg',
        status: 'completed',
        waktu_ambil: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        user_id: 4,
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        user: {
          id: 4,
          nama: 'Mike Johnson',
          no_hp: '08123456793',
          role: 'user'
        },
        order_products: [
          {
            id: 3,
            jumlah: 24,
            harga_beli: 120000,
            order_id: 3,
            product_id: 5,
            product: {
              id: 5,
              nama: 'Donuts Box (12 pcs)',
              deskripsi: 'Mixed flavors donut box',
              harga: 60000,
              stok: 8,
              gambars: [{ id: 5, file_path: '/img/donuts.jpg', product_id: 5 }]
            }
          }
        ]
      },
      {
        id: 4,
        bukti_path: '/uploads/bukti_4.jpg',
        status: 'paid',
        waktu_ambil: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        user_id: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: 5,
          nama: 'Sarah Wilson',
          no_hp: '08123456794',
          role: 'user'
        },
        order_products: [
          {
            id: 4,
            jumlah: 1,
            harga_beli: 200000,
            note: 'Vanilla cake with strawberry filling',
            order_id: 4,
            product_id: 4,
            product: {
              id: 4,
              nama: 'Birthday Cake',
              deskripsi: 'Custom birthday cake with decoration',
              harga: 200000,
              stok: 5,
              gambars: [{ id: 4, file_path: '/img/birthday-cake.jpg', product_id: 4 }]
            }
          }
        ]
      },
      {
        id: 5,
        status: 'verifying',
        user_id: 6,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: 6,
          nama: 'David Brown',
          no_hp: '08123456795',
          role: 'user'
        },
        order_products: [
          {
            id: 5,
            jumlah: 20,
            harga_beli: 240000,
            order_id: 5,
            product_id: 3,
            product: {
              id: 3,
              nama: 'Croissant',
              deskripsi: 'Buttery French croissant',
              harga: 12000,
              stok: 15,
              gambars: [{ id: 3, file_path: '/img/croissants.jpg', product_id: 3 }]
            }
          }
        ]
      },
      {
        id: 6,
        bukti_path: '/uploads/bukti_6.jpg',
        status: 'incompleted',
        waktu_ambil: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        user_id: 7,
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: 7,
          nama: 'Emma Davis',
          no_hp: '08123456796',
          role: 'user'
        },
        order_products: [
          {
            id: 6,
            jumlah: 6,
            harga_beli: 150000,
            note: 'Cheese tart with blueberry topping',
            order_id: 6,
            product_id: 6,
            product: {
              id: 6,
              nama: 'Cheese Tart',
              deskripsi: 'Creamy cheese tart',
              harga: 25000,
              stok: 12,
              gambars: [{ id: 6, file_path: '/img/cheese-tart.jpg', product_id: 6 }]
            }
          }
        ]
      }
    ];

    setOrders(demoOrders);
  }, []);

  const summary: ProductionSummary = {
    totalOrders: orders.length,
    pending: orders.filter(order => order.status === 'pending').length,
    verifying: orders.filter(order => order.status === 'verifying').length,
    paid: orders.filter(order => order.status === 'paid').length,
    baked: orders.filter(order => order.status === 'baked').length,
    completed: orders.filter(order => order.status === 'completed').length,
    incompleted: orders.filter(order => order.status === 'incompleted').length,
  };

  const updateOrderStatus = (orderId: number, status: ProductionStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  const deleteOrder = (orderId: number) => {
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
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

  const refreshData = () => {
    // In real app, this would fetch fresh data from API
    console.log('Refreshing production data...');
  };

  const contextValue: ProductionContextType = {
    orders,
    summary,
    selectedDate,
    dateRange,
    updateOrderStatus,
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
