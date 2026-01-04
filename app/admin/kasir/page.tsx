'use client';

import React from 'react';
import { KasirProvider } from '@/app/contexts/KasirContext';
import { ProductGrid } from '@/components/adminPage/kasir/ProductGrid';
import { KasirCart } from '@/components/adminPage/kasir/KasirCart';
import { CategoryFilter } from '@/components/adminPage/kasir/CategoryFilter';
import { KasirHeader } from '@/components/adminPage/kasir/KasirHeader';

export default function KasirPage() {
  return (
    <KasirProvider>
      <div className="h-full flex flex-col bg-gray-50">
        {/* Header */}
        <KasirHeader />
        
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Side - Product Selection */}
          <div className="flex-1 flex flex-col p-4 lg:p-6 overflow-hidden min-h-0">
            {/* Category Filter */}
            <CategoryFilter />
            
            {/* Products Grid */}
            <div className="flex-1 overflow-auto">
              <ProductGrid />
            </div>
          </div>
          
          {/* Right Side - Cart */}
          <div className="w-full lg:w-96 xl:w-[420px] border-t lg:border-t-0 lg:border-l border-gray-200 bg-white flex-shrink-0 h-[40vh] lg:h-auto">
            <KasirCart />
          </div>
        </div>
      </div>
    </KasirProvider>
  );
}