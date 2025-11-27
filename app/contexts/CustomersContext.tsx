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

export const CustomersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  // Load customers from backend via our API proxy
  useEffect(() => {
    const load = async () => {
      setState(prev => ({ ...prev, isLoading: true }));

      try {
        const res = await fetch('/api/users/customers/order/last');
        const json = await res.json().catch(() => ({}));

        // backend may wrap result in { data: [...] } or return array directly
        const raw = json?.data || json || [];

        const customersRaw = Array.isArray(raw) ? raw : (raw?.data || []);

        const mapped: Customer[] = customersRaw.map((c: any) => ({
          id: c.id,
          nama: c.nama || c.name || '',
          no_hp: c.no_hp || c.phone || '',
          role: c.role || 'user',
          created_at: c.created_at || c.createdAt || new Date().toISOString(),
          updated_at: c.updated_at || c.updatedAt || new Date().toISOString(),
          totalPurchases: c.totalPurchases ?? (c.purchases ? c.purchases.length : 0) ?? 0,
          totalSpent: c.totalSpent ?? 0,
          lastPurchase: c.lastOrder || c.lastPurchase || null,
          purchases: c.purchases || []
        }));

        setState(prev => ({
          ...prev,
          customers: mapped,
          filteredCustomers: mapped,
          isLoading: false
        }));
      } catch (err) {
        console.error('[CustomersContext] Failed to load customers:', err);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    load();
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

  const exportToExcel = async () => {
    // Our backend provides an Excel export endpoint - just navigate to it to download
    try {
      // open in new tab so browser handles the file
      window.open('/api/users/export', '_blank');
    } catch (err) {
      console.error('Failed to download Excel:', err);
      // fallback to CSV
      exportToCSV();
    }
  };

  const refreshCustomers = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await fetch('/api/users/customers/order/last');
      const json = await res.json().catch(() => ({}));
      const raw = json?.data || json || [];
      const customersRaw = Array.isArray(raw) ? raw : (raw?.data || []);

      const mapped: Customer[] = customersRaw.map((c: any) => ({
        id: c.id,
        nama: c.nama || c.name || '',
        no_hp: c.no_hp || c.phone || '',
        role: c.role || 'user',
        created_at: c.created_at || c.createdAt || new Date().toISOString(),
        updated_at: c.updated_at || c.updatedAt || new Date().toISOString(),
        totalPurchases: c.totalPurchases ?? (c.purchases ? c.purchases.length : 0) ?? 0,
        totalSpent: c.totalSpent ?? 0,
        lastPurchase: c.lastOrder || c.lastPurchase || null,
        purchases: c.purchases || []
      }));

      setState(prev => ({ ...prev, customers: mapped, filteredCustomers: mapped, isLoading: false }));
    } catch (err) {
      console.error('[CustomersContext] refresh failed', err);
      setState(prev => ({ ...prev, isLoading: false }));
    }
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
