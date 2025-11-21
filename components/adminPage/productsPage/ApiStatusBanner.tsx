'use client';

import React from 'react';
import { CheckCircle2, WifiOff } from 'lucide-react';
import { useProducts } from '@/app/contexts/ProductsContext';

export function ApiStatusBanner() {
  const { isBackendConnected, error } = useProducts();

  if (isBackendConnected) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
        <CheckCircle2 className="h-4 w-4" />
        <span>Terhubung ke Backend (localhost:5000). Data realtime.</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm text-yellow-900">
      <WifiOff className="h-4 w-4" />
      <span>{error || 'Backend tidak tersedia. Pastikan backend berjalan di http://localhost:5000'}</span>
    </div>
  );
}
