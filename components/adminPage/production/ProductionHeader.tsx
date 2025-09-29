'use client';

import React from 'react';
import { Factory, RefreshCw } from 'lucide-react';
import { useProduction } from '@/app/contexts/ProductionContext';

export function ProductionHeader() {
  const { refreshData } = useProduction();

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b6f47' }}>
          <Factory className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-admin-heading" style={{ color: '#5d4037' }}>
            Production Management
          </h1>
          <p className="font-admin-body" style={{ color: '#8b6f47' }}>
            Manage daily production orders and track baking progress
          </p>
        </div>
      </div>
      
      <button
        onClick={refreshData}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors font-admin-body"
        style={{ 
          borderColor: '#e0d5c7',
          color: '#8b6f47'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f9f7f4';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <RefreshCw className="w-4 h-4" />
        <span>Refresh</span>
      </button>
    </div>
  );
}
