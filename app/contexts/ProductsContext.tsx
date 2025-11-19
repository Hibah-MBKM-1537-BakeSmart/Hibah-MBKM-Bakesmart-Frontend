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
  addons?: Array<{
    id: number;
    nama: string;
    harga_tambahan: number;
    is_active: boolean;
  }>;
  sales?: number;
  rating?: number;
  status: 'active' | 'inactive';
  hari_tersedia?: string[]; // Array of days: ['Senin', 'Selasa', etc.]
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
        console.log('API Connection Status:', isConnected);
        
        if (isConnected) {
          try {
            // Try to load from API (PRIMARY SOURCE)
            const products = await productsApi.getAll();
            setState(prev => ({ 
              ...prev, 
              products, 
              loading: false,
              error: null,
              isApiConnected: true
            }));
            // Backup to localStorage (cache only)
            localStorage.setItem('bakesmart_products_cache', JSON.stringify(products));
          } catch (apiError) {
            console.warn('Failed to load from API, using cache:', apiError);
            // If API fails, use localStorage cache
            const cachedProducts = localStorage.getItem('bakesmart_products_cache');
            if (cachedProducts) {
              const products = JSON.parse(cachedProducts);
              setState(prev => ({ 
                ...prev, 
                products, 
                loading: false,
                error: 'API tidak tersedia. Menggunakan data lokal/demo.',
                isApiConnected: false
              }));
            } else {
              // Use mock data as fallback
              setState(prev => ({ 
                ...prev, 
                products: mockProducts, 
                loading: false,
                error: 'API tidak tersedia. Menggunakan data lokal/demo.',
                isApiConnected: false
              }));
              localStorage.setItem('bakesmart_products_cache', JSON.stringify(mockProducts));
            }
          }
        } else {
          // Fallback to localStorage cache
          const cachedProducts = localStorage.getItem('bakesmart_products_cache');
          if (cachedProducts) {
            const products = JSON.parse(cachedProducts);
            setState(prev => ({ 
              ...prev, 
              products, 
              loading: false,
              error: 'API tidak tersedia. Menggunakan data lokal/demo.',
              isApiConnected: false
            }));
          } else {
            // Use mock data as last resort
            setState(prev => ({ 
              ...prev, 
              products: mockProducts, 
              loading: false,
              error: 'API tidak tersedia. Menggunakan data lokal/demo.',
              isApiConnected: false
            }));
            localStorage.setItem('bakesmart_products_cache', JSON.stringify(mockProducts));
          }
        }
      } catch (error) {
        console.error('Error initializing data:', error);
        // Final fallback - use cache or mock data
        const cachedProducts = localStorage.getItem('bakesmart_products_cache');
        if (cachedProducts) {
          const products = JSON.parse(cachedProducts);
          setState(prev => ({ 
            ...prev, 
            products, 
            loading: false,
            error: 'Menggunakan data lokal',
            isApiConnected: false
          }));
        } else {
          setState(prev => ({ 
            ...prev, 
            products: mockProducts,
            loading: false, 
            error: 'Menggunakan data demo',
            isApiConnected: false
          }));
          localStorage.setItem('bakesmart_products_cache', JSON.stringify(mockProducts));
        }
      }
    };

    initializeData();
  }, []);

  // Auto-sync: Poll API setiap 5 detik untuk sinkronisasi antar browser
  useEffect(() => {
    if (!state.isApiConnected) return;

    const syncInterval = setInterval(async () => {
      try {
        const products = await productsApi.getAll();
        setState(prev => {
          // Only update if data has changed (prevent unnecessary re-renders)
          const hasChanges = JSON.stringify(prev.products) !== JSON.stringify(products);
          if (hasChanges) {
            console.log('Data synced from API');
            localStorage.setItem('bakesmart_products_cache', JSON.stringify(products));
            return { ...prev, products };
          }
          return prev;
        });
      } catch (error) {
        console.warn('Auto-sync failed:', error);
        setState(prev => ({ ...prev, isApiConnected: false }));
      }
    }, 5000); // Sync every 5 seconds

    return () => clearInterval(syncInterval);
  }, [state.isApiConnected]);

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
        // API is available - use API as primary (ID generated in mockApi.ts)
        const newProduct = await productsApi.create(productData);
        setState(prev => ({
          ...prev,
          products: [newProduct, ...prev.products],
          loading: false,
        }));
        // Update cache
        const updatedProducts = [newProduct, ...state.products];
        localStorage.setItem('bakesmart_products_cache', JSON.stringify(updatedProducts));
      } else {
        // API offline - create locally with safe ID generation
        const existingIds = state.products.map(p => p.id);
        const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
        const nextId = maxId + 1;
        
        const newProduct: Product = {
          id: nextId, // Use auto-increment instead of timestamp
          ...productData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sales: 0,
          rating: 0,
        };

        setState(prev => {
          const updatedProducts = [newProduct, ...prev.products];
          localStorage.setItem('bakesmart_products_cache', JSON.stringify(updatedProducts));
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
      console.log('Updating product:', id, 'with data:', productData);
      setState(prev => ({ ...prev, error: null }));
      
      if (state.isApiConnected) {
        // API is available - update API first
        await productsApi.update(id, productData);
        console.log('Product updated in API successfully');
        
        // Update local state
        setState(prev => {
          const updatedProducts = prev.products.map(product =>
            product.id === id
              ? { ...product, ...productData, updated_at: new Date().toISOString() }
              : product
          );
          
          // Update cache
          localStorage.setItem('bakesmart_products_cache', JSON.stringify(updatedProducts));
          
          return {
            ...prev,
            products: updatedProducts,
            loading: false,
          };
        });
      } else {
        // API offline - update locally only
        setState(prev => {
          const updatedProducts = prev.products.map(product =>
            product.id === id
              ? { ...product, ...productData, updated_at: new Date().toISOString() }
              : product
          );
          
          localStorage.setItem('bakesmart_products_cache', JSON.stringify(updatedProducts));
          
          return {
            ...prev,
            products: updatedProducts,
            loading: false,
          };
        });
      }
      
    } catch (error) {
      console.error('Error in updateProduct:', error);
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
        // API is available - delete from API first
        await productsApi.delete(id);
        console.log('Product deleted from API successfully');
        
        setState(prev => {
          const updatedProducts = prev.products.filter(product => product.id !== id);
          localStorage.setItem('bakesmart_products_cache', JSON.stringify(updatedProducts));
          return {
            ...prev,
            products: updatedProducts,
            loading: false,
          };
        });
      } else {
        // API offline - delete locally only
        setState(prev => {
          const updatedProducts = prev.products.filter(product => product.id !== id);
          localStorage.setItem('bakesmart_products_cache', JSON.stringify(updatedProducts));
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
      
      // Always try to reconnect to API
      const isConnected = await checkApiConnection();
      
      if (isConnected) {
        // Refresh from API
        const products = await productsApi.getAll();
        setState(prev => ({
          ...prev,
          products,
          loading: false,
          isApiConnected: true,
          error: null,
        }));
        localStorage.setItem('bakesmart_products_cache', JSON.stringify(products));
      } else {
        // Refresh from cache
        const cachedProducts = localStorage.getItem('bakesmart_products_cache');
        if (cachedProducts) {
          const products = JSON.parse(cachedProducts);
          setState(prev => ({
            ...prev,
            products,
            loading: false,
            isApiConnected: false,
            error: 'API tidak tersedia. Menggunakan data lokal/demo.',
          }));
        } else {
          setState(prev => ({
            ...prev,
            loading: false,
            isApiConnected: false,
            error: 'Tidak ada data tersimpan',
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