'use client';

import React, { useMemo } from 'react';
import { useKasir } from '@/app/contexts/KasirContext';
import { Package, Search } from 'lucide-react';

export function CategoryFilter() {
  const { state, setSelectedCategory } = useKasir();
  const [searchTerm, setSearchTerm] = React.useState('');

  // Build categories from API data
  const categories = useMemo(() => {
    const allCategory = { id: 'All', name: 'Semua Produk', icon: Package };
    
    if (state.categories && state.categories.length > 0) {
      // Use categories from API
      const apiCategories = state.categories.map((cat: any) => ({
        id: cat.nama_id,
        name: cat.nama_id,
        icon: Package
      }));
      return [allCategory, ...apiCategories];
    }
    
    // Fallback to hardcoded categories if API not available
    return [
      allCategory,
      { id: 'Kue', name: 'Kue', icon: Package },
      { id: 'Cupcake', name: 'Cupcake', icon: Package },
      { id: 'Pastry', name: 'Pastry', icon: Package },
      { id: 'Donut', name: 'Donut', icon: Package },
      { id: 'Roti', name: 'Roti', icon: Package },
      { id: 'Tart', name: 'Tart', icon: Package },
      { id: 'Pie', name: 'Pie', icon: Package }
    ];
  }, [state.categories]);

  return (
    <div className="mb-4 2xl:mb-2">
      {/* Search Bar */}
      <div className="mb-3 2xl:mb-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 2xl:pl-2.5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 2xl:h-4 2xl:w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 2xl:pl-8 pr-3 2xl:pr-2 py-2.5 2xl:py-1.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 2xl:text-sm"
          />
        </div>
      </div>

      {/* Category Buttons - More compact on large screens */}
      <div className="flex flex-wrap gap-2 2xl:gap-1.5">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = state.selectedCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 2xl:space-x-1 px-3 2xl:px-2 py-2 2xl:py-1 rounded-lg font-medium transition-all duration-200 ${
                isSelected
                  ? 'bg-orange-500 text-white shadow-lg transform scale-105 2xl:scale-100'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700'
              }`}
            >
              <Icon className="w-4 h-4 2xl:w-3.5 2xl:h-3.5" />
              <span className="text-sm 2xl:text-xs">{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* Search Results Info */}
      {searchTerm && (
        <div className="mt-3 2xl:mt-2 text-sm 2xl:text-xs text-gray-600">
          Menampilkan hasil pencarian untuk "{searchTerm}"
        </div>
      )}
    </div>
  );
}
