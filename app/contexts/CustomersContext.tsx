'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Based on order_product table structure
interface Purchase {
  id: number;
  jumlah: number;
  harga_beli: number;
  note?: string;
  order_id: number;
  product_id: number;
  created_at: string;
  // Related data via joins
  order?: {
    id: number;
    status: 'pending' | 'verifying' | 'paid' | 'baked' | 'completed';
    created_at: string;
  };
  product?: {
    id: number;
    nama: string;
    harga: number;
  };
}

// Based on users table structure from backend
interface Customer {
  id: number;
  nama: string;
  no_hp: string;
  password?: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
  // Calculated/aggregated data
  totalPurchases: number;
  totalSpent: number;
  lastPurchase?: Purchase;
  purchases: Purchase[];
}

interface CustomersFilters {
  searchQuery: string;
  role: 'all' | 'admin' | 'user';
  sortBy: 'newest' | 'oldest' | 'most_active' | 'name_asc' | 'name_desc';
}

interface CustomersState {
  customers: Customer[];
  filteredCustomers: Customer[];
  filters: CustomersFilters;
  selectedCustomer: Customer | null;
  isLoading: boolean;
  showCustomerDetail: boolean;
  showWhatsAppBlast: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}

interface CustomersContextType {
  state: CustomersState;
  updateFilters: (filters: Partial<CustomersFilters>) => void;
  selectCustomer: (customer: Customer) => void;
  closeCustomerDetail: () => void;
  openWhatsAppBlast: () => void;
  closeWhatsAppBlast: () => void;
  exportToCSV: () => void;
  exportToExcel: () => void;
  refreshCustomers: () => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
}

const CustomersContext = createContext<CustomersContextType | undefined>(undefined);

export function CustomersProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CustomersState>({
    customers: [],
    filteredCustomers: [],
    filters: {
      searchQuery: '',
      role: 'all',
      sortBy: 'newest'
    },
    selectedCustomer: null,
    isLoading: false,
    showCustomerDetail: false,
    showWhatsAppBlast: false,
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1
  });

  // Mock data matching backend structure
  useEffect(() => {
    const mockCustomers: Customer[] = [
      {
        id: 2,
        nama: 'Budi Santoso',
        no_hp: '081234567890',
        role: 'user',
        created_at: '2023-01-15T00:00:00.000Z',
        updated_at: '2024-12-15T11:00:00.000Z',
        totalPurchases: 15,
        totalSpent: 2500000,
        lastPurchase: {
          id: 1,
          jumlah: 1,
          harga_beli: 125000,
          order_id: 1,
          product_id: 1,
          created_at: '2024-12-15T08:00:00.000Z',
          order: {
            id: 1,
            status: 'completed',
            created_at: '2024-12-15T08:00:00.000Z'
          },
          product: {
            id: 1,
            nama: 'Chocolate Cake',
            harga: 125000
          }
        },
        purchases: [
          {
            id: 1,
            jumlah: 1,
            harga_beli: 125000,
            order_id: 1,
            product_id: 1,
            created_at: '2024-12-15T08:00:00.000Z',
            product: {
              id: 1,
              nama: 'Chocolate Cake',
              harga: 125000
            }
          }
        ]
      },
      {
        id: 3,
        nama: 'Siti Nurhasanah',
        no_hp: '082345678901',
        role: 'user',
        created_at: '2023-03-20T00:00:00.000Z',
        updated_at: '2024-12-15T15:30:00.000Z',
        totalPurchases: 3,
        totalSpent: 450000,
        lastPurchase: {
          id: 3,
          jumlah: 1,
          harga_beli: 200000,
          note: 'Custom message: Happy Birthday Sarah!',
          order_id: 2,
          product_id: 4,
          created_at: '2024-12-15T12:00:00.000Z',
          product: {
            id: 4,
            nama: 'Birthday Cake',
            harga: 200000
          }
        },
        purchases: [
          {
            id: 3,
            jumlah: 1,
            harga_beli: 200000,
            order_id: 2,
            product_id: 4,
            created_at: '2024-12-15T12:00:00.000Z',
            product: {
              id: 4,
              nama: 'Birthday Cake',
              harga: 200000
            }
          }
        ]
      },
      {
        id: 4,
        nama: 'Ahmad Wijaya',
        no_hp: '083456789012',
        role: 'user',
        created_at: '2022-11-08T00:00:00.000Z',
        updated_at: '2024-12-14T17:30:00.000Z',
        totalPurchases: 8,
        totalSpent: 1200000,
        lastPurchase: {
          id: 4,
          jumlah: 2,
          harga_beli: 120000,
          order_id: 3,
          product_id: 5,
          created_at: '2024-12-14T14:00:00.000Z',
          product: {
            id: 5,
            nama: 'Donuts Box (12 pcs)',
            harga: 60000
          }
        },
        purchases: [
          {
            id: 4,
            jumlah: 2,
            harga_beli: 120000,
            order_id: 3,
            product_id: 5,
            created_at: '2024-12-14T14:00:00.000Z',
            product: {
              id: 5,
              nama: 'Donuts Box (12 pcs)',
              harga: 60000
            }
          }
        ]
      },
      {
        id: 5,
        nama: 'Rina Marlina',
        no_hp: '084567890123',
        role: 'user',
        created_at: '2023-07-12T00:00:00.000Z',
        updated_at: '2024-12-14T08:30:00.000Z',
        totalPurchases: 22,
        totalSpent: 3750000,
        lastPurchase: {
          id: 6,
          jumlah: 1,
          harga_beli: 750000,
          note: 'Wedding on Dec 20, need consultation',
          order_id: 4,
          product_id: 4,
          created_at: '2024-12-14T08:00:00.000Z',
          product: {
            id: 4,
            nama: 'Wedding Cake',
            harga: 750000
          }
        },
        purchases: [
          {
            id: 6,
            jumlah: 1,
            harga_beli: 750000,
            order_id: 4,
            product_id: 4,
            created_at: '2024-12-14T08:00:00.000Z',
            product: {
              id: 4,
              nama: 'Wedding Cake',
              harga: 750000
            }
          }
        ]
      },
      {
        id: 6,
        nama: 'Made Sutrisno',
        no_hp: '085678901234',
        role: 'user',
        created_at: '2023-04-05T00:00:00.000Z',
        updated_at: '2024-12-15T16:00:00.000Z',
        totalPurchases: 18,
        totalSpent: 2890000,
        lastPurchase: {
          id: 7,
          jumlah: 5,
          harga_beli: 125000,
          order_id: 5,
          product_id: 6,
          created_at: '2024-12-15T16:00:00.000Z',
          product: {
            id: 6,
            nama: 'Cheese Tart',
            harga: 25000
          }
        },
        purchases: [
          {
            id: 7,
            jumlah: 5,
            harga_beli: 125000,
            order_id: 5,
            product_id: 6,
            created_at: '2024-12-15T16:00:00.000Z',
            product: {
              id: 6,
              nama: 'Cheese Tart',
              harga: 25000
            }
          }
        ]
      },
      {
        id: 7,
        nama: 'Dewi Sartika',
        no_hp: '086789012345',
        role: 'user',
        created_at: '2023-09-18T00:00:00.000Z',
        updated_at: '2024-01-20T00:00:00.000Z',
        totalPurchases: 5,
        totalSpent: 675000,
        purchases: []
      },
      {
        id: 8,
        nama: 'Agus Setiawan',
        no_hp: '087890123456',
        role: 'user',
        created_at: '2022-12-03T00:00:00.000Z',
        updated_at: '2024-12-12T00:00:00.000Z',
        totalPurchases: 31,
        totalSpent: 4250000,
        lastPurchase: {
          id: 8,
          jumlah: 2,
          harga_beli: 250000,
          order_id: 8,
          product_id: 1,
          created_at: '2024-12-12T00:00:00.000Z',
          product: {
            id: 1,
            nama: 'Chocolate Cake',
            harga: 125000
          }
        },
        purchases: [
          {
            id: 8,
            jumlah: 2,
            harga_beli: 250000,
            order_id: 8,
            product_id: 1,
            created_at: '2024-12-12T00:00:00.000Z',
            product: {
              id: 1,
              nama: 'Chocolate Cake',
              harga: 125000
            }
          }
        ]
      }
    ];

    setState(prev => ({
      ...prev,
      customers: mockCustomers,
      filteredCustomers: mockCustomers
    }));
  }, []);

  // Filter and sort customers
  useEffect(() => {
    let filtered = [...state.customers];

    // Search filter
    if (state.filters.searchQuery) {
      const query = state.filters.searchQuery.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.nama.toLowerCase().includes(query) ||
        customer.no_hp.includes(query)
      );
    }

    // Role filter
    if (state.filters.role !== 'all') {
      filtered = filtered.filter(customer => customer.role === state.filters.role);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (state.filters.sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'most_active':
          return b.totalPurchases - a.totalPurchases;
        case 'name_asc':
          return a.nama.localeCompare(b.nama);
        case 'name_desc':
          return b.nama.localeCompare(a.nama);
        default:
          return 0;
      }
    });

    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / state.itemsPerPage);

    setState(prev => ({
      ...prev,
      filteredCustomers: filtered,
      totalPages,
      currentPage: Math.min(prev.currentPage, totalPages || 1)
    }));
  }, [state.customers, state.filters, state.itemsPerPage]);

  const updateFilters = (newFilters: Partial<CustomersFilters>) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...newFilters
      },
      currentPage: 1 // Reset to first page when filtering
    }));
  };

  const selectCustomer = (customer: Customer) => {
    setState(prev => ({
      ...prev,
      selectedCustomer: customer,
      showCustomerDetail: true
    }));
  };

  const closeCustomerDetail = () => {
    setState(prev => ({
      ...prev,
      selectedCustomer: null,
      showCustomerDetail: false
    }));
  };

  const openWhatsAppBlast = () => {
    setState(prev => ({
      ...prev,
      showWhatsAppBlast: true
    }));
  };

  const closeWhatsAppBlast = () => {
    setState(prev => ({
      ...prev,
      showWhatsAppBlast: false
    }));
  };

  const exportToCSV = () => {
    const csvData = state.filteredCustomers.map(customer => ({
      'Customer ID': customer.id,
      'Customer Name': customer.nama,
      'Phone Number': customer.no_hp,
      'Role': customer.role,
      'Join Date': new Date(customer.created_at).toLocaleDateString('id-ID'),
      'Last Update': new Date(customer.updated_at).toLocaleDateString('id-ID'),
      'Total Purchases': customer.totalPurchases,
      'Total Spent': `Rp ${customer.totalSpent.toLocaleString('id-ID')}`,
      'Last Purchase': customer.lastPurchase ? 
        `${customer.lastPurchase.product?.nama || 'Unknown'} (${customer.lastPurchase.jumlah}x) - ${new Date(customer.lastPurchase.created_at).toLocaleDateString('id-ID')}` : 
        'No purchases'
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `customers-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToExcel = () => {
    // For now, we'll use CSV format. In a real app, you'd use a library like xlsx
    exportToCSV();
  };

  const refreshCustomers = () => {
    setState(prev => ({ ...prev, isLoading: true }));
    // Simulate API call
    setTimeout(() => {
      setState(prev => ({ ...prev, isLoading: false }));
    }, 1000);
  };

  const setCurrentPage = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  const setItemsPerPage = (items: number) => {
    setState(prev => ({ 
      ...prev, 
      itemsPerPage: items,
      currentPage: 1 
    }));
  };

  const contextValue: CustomersContextType = {
    state,
    updateFilters,
    selectCustomer,
    closeCustomerDetail,
    openWhatsAppBlast,
    closeWhatsAppBlast,
    exportToCSV,
    exportToExcel,
    refreshCustomers,
    setCurrentPage,
    setItemsPerPage
  };

  return (
    <CustomersContext.Provider value={contextValue}>
      {children}
    </CustomersContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomersContext);
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomersProvider');
  }
  return context;
}
