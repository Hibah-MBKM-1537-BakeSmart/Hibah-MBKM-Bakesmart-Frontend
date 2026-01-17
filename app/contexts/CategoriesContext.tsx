'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";

export interface Category {
  id: number;
  nama_id?: string;
  nama_en?: string;
  nama: string;
  created_at: string;
  updated_at: string;
}

interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  isApiConnected: boolean;
}

interface CategoriesContextType {
  // State
  categories: Category[];
  loading: boolean;
  error: string | null;
  isApiConnected: boolean;
  
  // Actions
  addCategory: (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCategory: (id: number, categoryData: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CategoriesState>({
    categories: [],
    loading: true,
    error: null,
    isApiConnected: false,
  });

  // Load categories from backend API on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('[Categories] Loading categories from backend...');
        setState(prev => ({ ...prev, loading: true, isApiConnected: false }));

        const response = await fetchWithAuth('/api/jenis', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status}`);
        }

        const result = await response.json();
        console.log('[Categories] Backend response:', result);

        const categoriesData = result?.data || [];
        console.log(`[Categories] Received ${categoriesData.length} categories from backend`);

        // Transform backend data to match Category interface
        const transformedCategories = categoriesData.map((cat: any) => ({
          id: cat.id,
          nama: cat.nama_id || cat.nama_en || cat.nama || '',
          nama_id: cat.nama_id,
          nama_en: cat.nama_en,
          created_at: cat.created_at || new Date().toISOString(),
          updated_at: cat.updated_at || new Date().toISOString(),
        }));

        setState(prev => ({
          ...prev,
          categories: transformedCategories,
          loading: false,
          isApiConnected: true,
          error: null,
        }));

        console.log('[Categories] Categories loaded successfully');
      } catch (error) {
        console.error('[Categories] Failed to load categories:', error);
        setState(prev => ({
          ...prev,
          categories: [],
          loading: false,
          isApiConnected: false,
          error: error instanceof Error ? error.message : 'Gagal memuat data kategori',
        }));
      }
    };

    loadCategories();
  }, []);

  const addCategory = async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Check if category name already exists
      const existingCategory = state.categories.find(
        cat => cat.nama.toLowerCase() === categoryData.nama.toLowerCase()
      );
      
      if (existingCategory) {
        setState(prev => ({ ...prev, loading: false }));
        throw new Error('Kategori dengan nama ini sudah ada');
      }
      
      // Send to backend API
      const response = await fetchWithAuth('/api/jenis', {
        method: 'POST',
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create category');
      }

      const result = await response.json();
      console.log('[Categories] Category created:', result);

      // Refresh categories after successful creation
      await refreshCategories();
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan saat menambahkan kategori',
      }));
      throw error;
    }
  };

  const updateCategory = async (id: number, categoryData: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Check if new name conflicts with existing categories (excluding current)
      if (categoryData.nama) {
        const existingCategory = state.categories.find(
          cat => cat.id !== id && cat.nama.toLowerCase() === categoryData.nama!.toLowerCase()
        );
        
        if (existingCategory) {
          setState(prev => ({ ...prev, loading: false }));
          throw new Error('Kategori dengan nama ini sudah ada');
        }
      }

      // Send to backend API
      const response = await fetchWithAuth(`/api/jenis/${id}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update category');
      }

      const result = await response.json();
      console.log('[Categories] Category updated:', result);

      // Refresh categories after successful update
      await refreshCategories();
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengupdate kategori',
      }));
      throw error;
    }
  };

  const deleteCategory = async (id: number): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Send to backend API
      const response = await fetchWithAuth(`/api/jenis/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete category');
      }

      console.log('[Categories] Category deleted:', id);

      // Refresh categories after successful deletion
      await refreshCategories();
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus kategori',
      }));
      throw error;
    }
  };

  const refreshCategories = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetchWithAuth('/api/jenis', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const result = await response.json();
      const categoriesData = result?.data || [];

      // Transform backend data to match Category interface
      const transformedCategories = categoriesData.map((cat: any) => ({
        id: cat.id,
        nama: cat.nama_id || cat.nama_en || cat.nama || '',
        nama_id: cat.nama_id,
        nama_en: cat.nama_en,
        created_at: cat.created_at || new Date().toISOString(),
        updated_at: cat.updated_at || new Date().toISOString(),
      }));

      setState(prev => ({
        ...prev,
        categories: transformedCategories,
        loading: false,
        error: null,
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat kategori',
      }));
    }
  };

  const contextValue: CategoriesContextType = {
    // State
    categories: state.categories,
    loading: state.loading,
    error: state.error,
    isApiConnected: state.isApiConnected,
    
    // Actions
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories,
  };

  return (
    <CategoriesContext.Provider value={contextValue}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories(): CategoriesContextType {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}