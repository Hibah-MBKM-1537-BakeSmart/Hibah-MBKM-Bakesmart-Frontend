'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Use Next.js API route instead of direct backend call to avoid CORS
const BACKEND_URL = '/api/products';

export interface Product {
  id: number;
  nama_id?: string;
  nama_en?: string;
  nama: string;
  deskripsi_id?: string;
  deskripsi_en?: string;
  deskripsi: string;
  harga: number;
  stok: number;
  created_at?: string;
  updated_at?: string;
  gambars?: Array<{
    id: number;
    file_path: string;
    product_id: number;
  }>;
  jenis?: Array<{
    id: number;
    nama_id?: string;
    nama_en?: string;
    nama: string;
  }>;
  hari?: Array<{
    id: number;
    nama_id?: string;
    nama_en?: string;
    nama: string;
  }>;
  attributes?: Array<{
    id: number;
    nama_id?: string;
    nama_en?: string;
    nama: string;
    harga?: number;
  }>;
  bahans?: Array<{
    id: number;
    nama_id?: string;
    nama_en?: string;
    nama: string;
    jumlah?: number;
  }>;
  addons?: Array<{
    id: number;
    nama: string;
    harga_tambahan: number;
    is_active: boolean;
  }>;
  sales?: number;
  rating?: number;
  status: 'active' | 'inactive';
  hari_tersedia?: string[];
}

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  isBackendConnected: boolean;
}

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  isBackendConnected: boolean;
  addProduct: (productData: Partial<Product>) => Promise<void>;
  updateProduct: (id: number, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  refreshProducts: () => Promise<void>;
  exportProduct: () => Promise<void>;
  importProduct: (file: File) => Promise<any>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProductsState>({
    products: [],
    loading: false,
    error: null,
    isBackendConnected: false,
  });

  // Helper function to parse backend response
  const parseBackendResponse = (data: any): Product[] => {
    console.log('[ProductsContext] Parsing backend response:', data);
    
    // Handle different response formats
    let productsArray: any[] = [];
    
    if (Array.isArray(data)) {
      productsArray = data;
    } else if (data?.data) {
      if (Array.isArray(data.data)) {
        productsArray = data.data;
      } else if (data.data?.data && Array.isArray(data.data.data)) {
        productsArray = data.data.data;
      }
    }

    console.log('[ProductsContext] Found products array:', productsArray.length);

    // Map backend format to frontend format
    return productsArray.map((product: any) => ({
      id: product.id,
      nama: product.nama_en || product.nama_id || product.nama || '',
      deskripsi: product.deskripsi_en || product.deskripsi_id || product.deskripsi || '',
      harga: product.harga || 0,
      stok: product.stok ?? 0,
      created_at: product.created_at,
      updated_at: product.updated_at,
      status: (product.status || 'active') as 'active' | 'inactive',
      gambars: product.gambars?.filter((g: any) => g && g.id) || [],
      jenis: product.jenis?.filter((j: any) => j && j.id).map((j: any) => ({
        id: j.id,
        nama: j.nama_en || j.nama_id || j.nama || 'Unknown',
        nama_id: j.nama_id,
        nama_en: j.nama_en,
      })) || [],
      hari: product.hari?.filter((h: any) => h && h.id).map((h: any) => ({
        id: h.id,
        nama: h.nama_en || h.nama_id || h.nama || '',
        nama_id: h.nama_id,
        nama_en: h.nama_en,
      })) || [],
      attributes: product.attributes?.filter((a: any) => a && a.id).map((a: any) => ({
        id: a.id,
        nama: a.nama_en || a.nama_id || a.nama || '',
        harga: a.harga,
        nama_id: a.nama_id,
        nama_en: a.nama_en,
      })) || [],
      bahans: product.bahans?.filter((b: any) => b && b.id).map((b: any) => ({
        id: b.id,
        nama: b.nama_en || b.nama_id || b.nama || '',
        jumlah: b.jumlah,
        nama_id: b.nama_id,
        nama_en: b.nama_en,
      })) || [],
      sales: product.sales || 0,
      rating: product.rating || 0,
      hari_tersedia: product.hari_tersedia || [],
    }));
  };

  // Fetch products from backend
  const refreshProducts = async (): Promise<void> => {
    try {
      console.log('[ProductsContext] Refreshing products from backend...');
      setState(prev => ({ ...prev, loading: true, error: null }));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased to 10 seconds

      const response = await fetch(BACKEND_URL, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[ProductsContext] Backend response:', data);

      const products = parseBackendResponse(data);
      console.log('[ProductsContext] Parsed products:', products.length);

      setState(prev => ({
        ...prev,
        products,
        loading: false,
        error: null,
        isBackendConnected: true,
      }));
    } catch (error: any) {
      console.error('[ProductsContext] Error fetching products:', error);
      
      let errorMessage = 'Tidak dapat terhubung ke backend. ';
      if (error.name === 'AbortError') {
        errorMessage = '⏱️ Backend tidak merespons dalam 10 detik. Pastikan backend server berjalan';
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('fetch')) {
        errorMessage = '🔌 Backend server tidak dapat diakses. Pastikan backend berjalan';
      } else if (error.message?.includes('ECONNREFUSED')) {
        errorMessage = '❌ Koneksi ditolak. Backend server tidak berjalan';
      } else {
        errorMessage += error.message;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        isBackendConnected: false,
      }));
    }
  };

  // Initial load
  useEffect(() => {
    refreshProducts();
  }, []);

  // Create product
  const addProduct = async (productData: Partial<Product>): Promise<void> => {
    try {
      console.log('[ProductsContext] Creating product:', productData);
      setState(prev => ({ ...prev, error: null }));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[ProductsContext] Product created successfully:', data);

      // Parse new product and add to state
      if (data.data) {
        const parsed = parseBackendResponse(data);
        const newProduct = parsed[0];
        if (newProduct) {
          setState(prev => ({
            ...prev,
            products: [...prev.products, newProduct],
            loading: false,
          }));
        } else {
          // Fallback: refresh from backend if parsing failed
          await refreshProducts();
        }
      } else {
        // Fallback: refresh from backend
        await refreshProducts();
      }
    } catch (error: any) {
      console.error('[ProductsContext] Error creating product:', error);
      
      let errorMessage = 'Gagal menambahkan produk. ';
      if (error.name === 'AbortError') {
        errorMessage += 'Request timeout.';
      } else {
        errorMessage += error.message;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  // Update product
  const updateProduct = async (id: number, productData: Partial<Product>): Promise<void> => {
    try {
      console.log('[ProductsContext] Updating product:', id, productData);
      setState(prev => ({ ...prev, error: null }));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${BACKEND_URL}/${id}`, {
        method: 'PUT',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[ProductsContext] Backend PUT response:', JSON.stringify(data));

      // Immediately update local state with optimistic data
      // Don't rely on backend response format, use what we sent
      setState(prev => {
        console.log('[ProductsContext] Updating state, current products:', prev.products.length);
        const updatedProducts = prev.products.map(product => {
          if (product.id === id) {
            const updated = { ...product, ...productData };
            console.log(`[ProductsContext] Updating product ${id}:`, updated);
            return updated;
          }
          return product;
        });
        console.log('[ProductsContext] New products array:', updatedProducts.length);
        return {
          ...prev,
          products: updatedProducts,
          loading: false,
        };
      });

      console.log('[ProductsContext] State update completed');
    } catch (error: any) {
      console.error('[ProductsContext] Error updating product:', error);
      
      let errorMessage = 'Gagal mengupdate produk. ';
      if (error.name === 'AbortError') {
        errorMessage += 'Request timeout.';
      } else {
        errorMessage += error.message;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  // Delete product
  const deleteProduct = async (id: number): Promise<void> => {
    try {
      console.log('[ProductsContext] Deleting product:', id);
      setState(prev => ({ ...prev, error: null }));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${BACKEND_URL}/${id}`, {
        method: 'DELETE',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      console.log('[ProductsContext] Product deleted successfully');

      // Immediately remove from local state
      setState(prev => ({
        ...prev,
        products: prev.products.filter(product => product.id !== id),
        loading: false,
      }));

      console.log('[ProductsContext] Product removed from state');
    } catch (error: any) {
      console.error('[ProductsContext] Error deleting product:', error);
      
      let errorMessage = 'Gagal menghapus produk. ';
      if (error.name === 'AbortError') {
        errorMessage += 'Request timeout.';
      } else {
        errorMessage += error.message;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const exportProduct = async () => {
    try {
      const response = await fetch("/api/products/export", {
        method: "GET",
      });

      if (!response.ok) throw new Error("Failed to export products");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "products.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  };

  const importProduct = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/products/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to import products");

      const result = await response.json();
      await refreshProducts();
      return result;
    } catch (error) {
      console.error("Import error:", error);
      throw error;
    }
  };

  const contextValue: ProductsContextType = {
    products: state.products,
    loading: state.loading,
    error: state.error,
    isBackendConnected: state.isBackendConnected,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
    exportProduct,
    importProduct,
  };

  return (
    <ProductsContext.Provider value={contextValue}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts(): ProductsContextType {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}