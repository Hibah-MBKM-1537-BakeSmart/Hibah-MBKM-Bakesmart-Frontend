'use client';

import React from 'react';
import { ProductionProvider } from '@/app/contexts/ProductionContext';
import { ProductionHeader } from '@/components/adminPage/production/ProductionHeader';
import { ProductionStats } from '@/components/adminPage/production/ProductionStats';
import { DateFilter } from '@/components/adminPage/production/DateFilter';
import { ProductionCards } from '@/components/adminPage/production/ProductionCards';
import { ProductionTable } from '@/components/adminPage/production/ProductionTable';

export default function ProductionPage() {
  return (
    <ProductionProvider>
      <div className="space-y-6">
        {/* Page Header */}
        <ProductionHeader />
        
        {/* Stats Overview */}
        <ProductionStats />
        
        {/* Date Filter */}
        <DateFilter />
        
        {/* Production Cards */}
        <ProductionCards />
        
        {/* Finished Products Table */}
        <ProductionTable />
      </div>
    </ProductionProvider>
  );
}
