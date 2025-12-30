'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Note: This context now uses localStorage only - no external mock API dependency

export interface Category {
  id: number;
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

// Mock initial data based on existing categories in the products
const mockCategories: Category[] = [
  {
    id: 1,
    nama: 'Cake',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    nama: 'Cupcake',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 3,
    nama: 'Pastry',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 4,
    nama: 'Donut',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 5,
    nama: 'Tart',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 6,
    nama: 'Pie',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 7,
    nama: 'Bread',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
];

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CategoriesState>({
    categories: [],
    loading: false,
    error: null,
    isApiConnected: false,
  });

  // Load categories from localStorage on component mount
  useEffect(() => {
    const initializeData = async () => {
      setState(prev => ({ ...prev, loading: true }));
      
      try {
        // Load from localStorage
        const savedCategories = localStorage.getItem('bakesmart_categories');
        if (savedCategories) {
          const categories = JSON.parse(savedCategories);
          setState(prev => ({ 
            ...prev, 
            categories, 
            loading: false,
            error: null 
          }));
        } else {
          // Use mock data as fallback
          setState(prev => ({ 
            ...prev, 
            categories: mockCategories, 
            loading: false,
            error: null 
          }));
          localStorage.setItem('bakesmart_categories', JSON.stringify(mockCategories));
        }
      } catch (error) {
        console.error('Error initializing categories data:', error);
        setState(prev => ({ 
          ...prev, 
          categories: mockCategories,
          loading: false, 
          error: 'Gagal memuat data kategori' 
        }));
      }
    };

    initializeData();
  }, []);

  // Helper function to save categories to localStorage
  const saveCategoriesToStorage = (categories: Category[]) => {
    try {
      localStorage.setItem('bakesmart_categories', JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories to localStorage:', error);
    }
  };

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
      
      // Use localStorage for persistence
      const newCategory: Category = {
        id: Date.now(),
        ...categoryData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setState(prev => {
        const updatedCategories = [...prev.categories, newCategory];
        localStorage.setItem('bakesmart_categories', JSON.stringify(updatedCategories));
        return {
          ...prev,
          categories: updatedCategories,
          loading: false,
        };
      });
      
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
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
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

      setState(prev => {
        const updatedCategories = prev.categories.map(cat =>
          cat.id === id
            ? { ...cat, ...categoryData, updated_at: new Date().toISOString() }
            : cat
        );
        // Save to localStorage with the most current state
        saveCategoriesToStorage(updatedCategories);
        return {
          ...prev,
          categories: updatedCategories,
          loading: false,
        };
      });
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/categories/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(categoryData),
      // });
      // if (!response.ok) throw new Error('Failed to update category');
      
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
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if category is being used by products
      // This would need to be checked against actual product data
      // For now, we'll skip this check in mock implementation
      
      setState(prev => {
        const updatedCategories = prev.categories.filter(cat => cat.id !== id);
        // Save to localStorage with the most current state
        saveCategoriesToStorage(updatedCategories);
        return {
          ...prev,
          categories: updatedCategories,
          loading: false,
        };
      });
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/categories/${id}`, {
      //   method: 'DELETE',
      // });
      // if (!response.ok) throw new Error('Failed to delete category');
      
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
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real implementation, this would fetch from API
      setState(prev => ({
        ...prev,
        loading: false,
      }));
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/categories');
      // if (!response.ok) throw new Error('Failed to fetch categories');
      // const categories = await response.json();
      // setState(prev => ({ ...prev, categories, loading: false }));
      
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