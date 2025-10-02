'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { productsApi, checkApiConnection } from '@/lib/api/mockApi';

export interface Product {
  id: number;
  nama: string;
  deskripsi: string;
  harga: number;
  stok: number;
  created_at: string;
  updated_at: string;
  gambars?: Array<{
    id: number;
    file_path: string;
    product_id: number;
  }>;
  jenis?: Array<{
    id: number;
    nama: string;
  }>;
  sales?: number;
  rating?: number;
  status: 'active' | 'inactive';
}

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  isApiConnected: boolean;
}

interface ProductsContextType {
  // State
  products: Product[];
  loading: boolean;
  error: string | null;
  isApiConnected: boolean;
  
  // Actions
  addProduct: (productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'sales' | 'rating'>) => Promise<void>;
  updateProduct: (id: number, productData: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  refreshProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

// Mock initial data
const mockProducts: Product[] = [
  {
    id: 1,
    nama: 'Chocolate Cake',
    deskripsi: 'Rich chocolate cake with cream frosting',
    harga: 125000,
    stok: 15,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    status: 'active',
    rating: 4.8,
    sales: 145,
    jenis: [{ id: 1, nama: 'Cake' }],
    gambars: [{ id: 1, file_path: '/img/Roti.png', product_id: 1 }]
  },
  {
    id: 2,
    nama: 'Red Velvet Cupcakes',
    deskripsi: 'Classic red velvet cupcakes (per piece)',
    harga: 15000,
    stok: 24,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    status: 'active',
    rating: 4.6,
    sales: 89,
    jenis: [{ id: 2, nama: 'Cupcake' }],
    gambars: [{ id: 2, file_path: '/img/Roti.png', product_id: 2 }]
  },
  {
    id: 4,
    nama: 'Birthday Cake',
    deskripsi: 'Custom birthday cake with decoration',
    harga: 200000,
    stok: 8,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    status: 'active',
    rating: 4.9,
    sales: 67,
    jenis: [{ id: 1, nama: 'Cake' }],
    gambars: [{ id: 4, file_path: '/img/Roti.png', product_id: 4 }]
  },
  {
    id: 5,
    nama: 'Donuts Box (12 pcs)',
    deskripsi: 'Mixed flavors donut box',
    harga: 60000,
    stok: 50,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    status: 'active',
    rating: 4.4,
    sales: 234,
    jenis: [{ id: 4, nama: 'Donut' }],
    gambars: [{ id: 5, file_path: '/img/Roti.png', product_id: 5 }]
  },
  {
    id: 3,
    nama: 'Croissant',
    deskripsi: 'Buttery French croissant',
    harga: 12000,
    stok: 0,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    status: 'inactive',
    rating: 4.2,
    sales: 156,
    jenis: [{ id: 3, nama: 'Pastry' }],
    // No gambars - untuk testing placeholder
  },
  {
    id: 6,
    nama: 'Cheese Tart',
    deskripsi: 'Creamy cheese tart',
    harga: 25000,
    stok: 12,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    status: 'active',
    rating: 4.5,
    sales: 78,
    jenis: [{ id: 5, nama: 'Tart' }],
    gambars: [{ id: 6, file_path: '/img/logo.png', product_id: 6 }]
  },
  {
    id: 7,
    nama: 'Apple Pie',
    deskripsi: 'Traditional apple pie',
    harga: 45000,
    stok: 6,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    status: 'active',
    rating: 4.7,
    sales: 45,
    jenis: [{ id: 6, nama: 'Pie' }],
    // No gambars - untuk testing placeholder
  },
  {
    id: 8,
    nama: 'Bagel',
    deskripsi: 'Fresh baked bagel',
    harga: 18000,
    stok: 20,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    status: 'active',
    rating: 4.3,
    sales: 92,
    jenis: [{ id: 7, nama: 'Bread' }],
    gambars: [{ id: 8, file_path: '/img/Roti.png', product_id: 8 }]
  }
];

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProductsState>({
    products: [],
    loading: false,
    error: null,
    isApiConnected: false,
  });

  // Load products from API or localStorage on component mount
  useEffect(() => {
    const initializeData = async () => {
      setState(prev => ({ ...prev, loading: true }));
      
      try {
        // Check if API is available
        const isConnected = await checkApiConnection();
        setState(prev => ({ ...prev, isApiConnected: isConnected }));
        
        if (isConnected) {
          // Load from API
          const products = await productsApi.getAll();
          setState(prev => ({ 
            ...prev, 
            products, 
            loading: false,
            error: null 
          }));
        } else {
          // Fallback to localStorage
          const savedProducts = localStorage.getItem('bakesmart_products');
          if (savedProducts) {
            const products = JSON.parse(savedProducts);
            setState(prev => ({ 
              ...prev, 
              products, 
              loading: false,
              error: 'API tidak tersedia - menggunakan data lokal' 
            }));
          } else {
            // Use mock data as last resort
            setState(prev => ({ 
              ...prev, 
              products: mockProducts, 
              loading: false,
              error: 'API tidak tersedia - menggunakan data demo' 
            }));
            localStorage.setItem('bakesmart_products', JSON.stringify(mockProducts));
          }
        }
      } catch (error) {
        console.error('Error initializing data:', error);
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Gagal memuat data produk' 
        }));
      }
    };

    initializeData();
  }, []);

  // Helper function to save products to localStorage
  const saveProductsToStorage = (products: Product[]) => {
    try {
      localStorage.setItem('bakesmart_products', JSON.stringify(products));
    } catch (error) {
      console.error('Error saving products to localStorage:', error);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'sales' | 'rating'>): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      if (state.isApiConnected) {
        // Use API
        const newProduct = await productsApi.create(productData);
        setState(prev => ({
          ...prev,
          products: [newProduct, ...prev.products],
          loading: false,
        }));
      } else {
        // Fallback to localStorage
        const newProduct: Product = {
          id: Date.now(),
          ...productData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sales: 0,
          rating: 0,
        };

        setState(prev => {
          const updatedProducts = [newProduct, ...prev.products];
          // Save to localStorage as backup
          localStorage.setItem('bakesmart_products', JSON.stringify(updatedProducts));
          return {
            ...prev,
            products: updatedProducts,
            loading: false,
          };
        });
      }
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan saat menambahkan produk',
      }));
      throw error;
    }
  };

  const updateProduct = async (id: number, productData: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      if (state.isApiConnected) {
        // Use API
        const updatedProduct = await productsApi.update(id, productData);
        setState(prev => ({
          ...prev,
          products: prev.products.map(product =>
            product.id === id ? updatedProduct : product
          ),
          loading: false,
        }));
      } else {
        // Fallback to localStorage
        setState(prev => {
          const updatedProducts = prev.products.map(product =>
            product.id === id
              ? { ...product, ...productData, updated_at: new Date().toISOString() }
              : product
          );
          localStorage.setItem('bakesmart_products', JSON.stringify(updatedProducts));
          return {
            ...prev,
            products: updatedProducts,
            loading: false,
          };
        });
      }
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengupdate produk',
      }));
      throw error;
    }
  };

  const deleteProduct = async (id: number): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      if (state.isApiConnected) {
        // Use API
        await productsApi.delete(id);
        setState(prev => ({
          ...prev,
          products: prev.products.filter(product => product.id !== id),
          loading: false,
        }));
      } else {
        // Fallback to localStorage
        setState(prev => {
          const updatedProducts = prev.products.filter(product => product.id !== id);
          localStorage.setItem('bakesmart_products', JSON.stringify(updatedProducts));
          return {
            ...prev,
            products: updatedProducts,
            loading: false,
          };
        });
      }
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus produk',
      }));
      throw error;
    }
  };

  const refreshProducts = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      if (state.isApiConnected) {
        // Refresh from API
        const products = await productsApi.getAll();
        setState(prev => ({
          ...prev,
          products,
          loading: false,
        }));
      } else {
        // Refresh from localStorage
        const savedProducts = localStorage.getItem('bakesmart_products');
        if (savedProducts) {
          const products = JSON.parse(savedProducts);
          setState(prev => ({
            ...prev,
            products,
            loading: false,
          }));
        } else {
          setState(prev => ({
            ...prev,
            loading: false,
          }));
        }
      }
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat produk',
      }));
    }
  };

  const contextValue: ProductsContextType = {
    // State
    products: state.products,
    loading: state.loading,
    error: state.error,
    isApiConnected: state.isApiConnected,
    
    // Actions
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
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