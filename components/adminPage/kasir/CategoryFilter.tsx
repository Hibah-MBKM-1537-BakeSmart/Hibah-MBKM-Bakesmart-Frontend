'use client';

import React from 'react';
import { useKasir } from '@/app/contexts/KasirContext';
import { Package, Search } from 'lucide-react';

const categories = [
  { id: 'All', name: 'Semua Produk', icon: Package },
  { id: 'Cake', name: 'Kue', icon: Package },
  { id: 'Cupcake', name: 'Cupcake', icon: Package },
  { id: 'Pastry', name: 'Pastry', icon: Package },
  { id: 'Donut', name: 'Donut', icon: Package },
  { id: 'Bread', name: 'Roti', icon: Package },
  { id: 'Tart', name: 'Tart', icon: Package },
  { id: 'Pie', name: 'Pie', icon: Package }
];

export function CategoryFilter() {
  const { state, setSelectedCategory } = useKasir();
  const [searchTerm, setSearchTerm] = React.useState('');

  return (
    <div className="mb-6">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
          />
        </div>
      </div>

      {/* Category Buttons */}
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = state.selectedCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isSelected
                  ? 'bg-orange-500 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* Search Results Info */}
      {searchTerm && (
        <div className="mt-3 text-sm text-gray-600">
          Menampilkan hasil pencarian untuk "{searchTerm}"
        </div>
      )}
    </div>
  );
}
