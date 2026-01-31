"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";

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
    status: "pending" | "verifying" | "paid" | "baked" | "completed";
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
  role: "admin" | "user";
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
  role: "all" | "admin" | "user";
  sortBy: "newest" | "oldest" | "most_active" | "name_asc" | "name_desc";
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
  exportToExcel: () => Promise<void>;
  importCustomers: (file: File) => Promise<any>;
  refreshCustomers: () => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
}

const CustomersContext = createContext<CustomersContextType | undefined>(
  undefined
);

export function CustomersProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CustomersState>({
    customers: [],
    filteredCustomers: [],
    filters: {
      searchQuery: "",
      role: "all",
      sortBy: "newest",
    },
    selectedCustomer: null,
    isLoading: false,
    showCustomerDetail: false,
    showWhatsAppBlast: false,
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1,
  });

  const fetchCustomers = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await fetchWithAuth("/api/customers");
      const result = await response.json();

      if (result.data) {
        const mappedCustomers: Customer[] = result.data.map((item: any) => {
          // Map last_order to Purchase interface if it exists
          let lastPurchase: Purchase | undefined;

          if (
            item.last_order &&
            item.last_order.order_products &&
            item.last_order.order_products.length > 0
          ) {
            const firstProduct = item.last_order.order_products[0];
            lastPurchase = {
              id: firstProduct.id,
              jumlah: firstProduct.quantity,
              harga_beli: firstProduct.price,
              order_id: item.last_order.id,
              product_id: firstProduct.product_id,
              created_at: item.last_order.created_at,
              order: {
                id: item.last_order.id,
                status: item.last_order.status,
                created_at: item.last_order.created_at,
              },
              product: {
                id: firstProduct.product.id,
                nama: firstProduct.product.nama,
                harga: firstProduct.product.harga,
              },
            };
          }

          return {
            id: item.id,
            nama: item.nama,
            no_hp: item.no_hp,
            role: item.role || "user",
            created_at: item.created_at || new Date().toISOString(),
            updated_at:
              item.updated_at || item.created_at || new Date().toISOString(),
            // These fields might need a separate endpoint or aggregation
            totalPurchases: 0,
            totalSpent: 0,
            lastPurchase: lastPurchase,
            purchases: lastPurchase ? [lastPurchase] : [],
          };
        });

        setState((prev) => ({
          ...prev,
          customers: mappedCustomers,
          filteredCustomers: mappedCustomers,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const importCustomers = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Use plain fetch with manual auth header for FormData
      // Don't use fetchWithAuth as it sets Content-Type: application/json
      const token = localStorage.getItem("bakesmart_admin_auth");
      const authHeader = token ? JSON.parse(token).token : null;
      
      const headers: HeadersInit = {};
      if (authHeader) {
        headers["Authorization"] = `Bearer ${authHeader}`;
      }
      // Don't set Content-Type - browser will set it automatically with boundary

      const response = await fetch("/api/customers/import", {
        method: "POST",
        body: formData,
        headers,
      });

      if (!response.ok) throw new Error("Failed to import customers");

      const result = await response.json();
      console.log("Import result:", result);

      // Refresh customers after import
      await fetchCustomers();
      return result;
    } catch (error) {
      console.error("Import error:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter and sort customers
  useEffect(() => {
    let filtered = [...state.customers];

    // Search filter
    if (state.filters.searchQuery) {
      const query = state.filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (customer) =>
          customer.nama.toLowerCase().includes(query) ||
          customer.no_hp.includes(query)
      );
    }

    // Role filter
    if (state.filters.role !== "all") {
      filtered = filtered.filter(
        (customer) => customer.role === state.filters.role
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (state.filters.sortBy) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "most_active":
          return b.totalPurchases - a.totalPurchases;
        case "name_asc":
          return a.nama.localeCompare(b.nama);
        case "name_desc":
          return b.nama.localeCompare(a.nama);
        default:
          return 0;
      }
    });

    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / state.itemsPerPage);

    setState((prev) => ({
      ...prev,
      filteredCustomers: filtered,
      totalPages,
      currentPage: Math.min(prev.currentPage, totalPages || 1),
    }));
  }, [state.customers, state.filters, state.itemsPerPage]);

  const updateFilters = (newFilters: Partial<CustomersFilters>) => {
    setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...newFilters,
      },
      currentPage: 1, // Reset to first page when filtering
    }));
  };

  const selectCustomer = (customer: Customer) => {
    setState((prev) => ({
      ...prev,
      selectedCustomer: customer,
      showCustomerDetail: true,
    }));
  };

  const closeCustomerDetail = () => {
    setState((prev) => ({
      ...prev,
      selectedCustomer: null,
      showCustomerDetail: false,
    }));
  };

  const openWhatsAppBlast = () => {
    setState((prev) => ({
      ...prev,
      showWhatsAppBlast: true,
    }));
  };

  const closeWhatsAppBlast = () => {
    setState((prev) => ({
      ...prev,
      showWhatsAppBlast: false,
    }));
  };

  const exportToCSV = () => {
    const csvData = state.filteredCustomers.map((customer) => ({
      "Customer ID": customer.id,
      "Customer Name": customer.nama,
      "Phone Number": customer.no_hp,
      Role: customer.role,
      "Join Date": new Date(customer.created_at).toLocaleDateString("id-ID"),
      "Last Update": new Date(customer.updated_at).toLocaleDateString("id-ID"),
      "Total Purchases": customer.totalPurchases,
      "Total Spent": `Rp ${customer.totalSpent.toLocaleString("id-ID")}`,
      "Last Purchase": customer.lastPurchase
        ? `${customer.lastPurchase.product?.nama || "Unknown"} (${
            customer.lastPurchase.jumlah
          }x) - ${new Date(customer.lastPurchase.created_at).toLocaleDateString(
            "id-ID"
          )}`
        : "No purchases",
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        headers
          .map((header) => `"${row[header as keyof typeof row]}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `customers-data-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  const exportToExcel = async () => {
    try {
      const response = await fetchWithAuth("/api/customers/export", {
        method: "GET",
      });

      if (!response.ok) throw new Error("Failed to export customers");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "customers.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  };

  const refreshCustomers = () => {
    fetchCustomers();
  };

  const setCurrentPage = (page: number) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  };

  const setItemsPerPage = (items: number) => {
    setState((prev) => ({
      ...prev,
      itemsPerPage: items,
      currentPage: 1,
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
    importCustomers,
    refreshCustomers,
    setCurrentPage,
    setItemsPerPage,
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
    throw new Error("useCustomers must be used within a CustomersProvider");
  }
  return context;
}
