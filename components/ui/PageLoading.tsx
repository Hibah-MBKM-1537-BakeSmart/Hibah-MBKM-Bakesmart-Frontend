'use client';

import React from 'react';
import { OptimizedLoader } from './OptimizedLoader';

interface PageLoadingProps {
  isLoading: boolean;
}

export function PageLoading({ isLoading }: PageLoadingProps) {
  if (!isLoading) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200"
      style={{ 
        backgroundColor: 'rgba(245, 241, 235, 0.8)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center space-y-3 border" style={{ borderColor: '#e0d5c7' }}>
        <OptimizedLoader size="lg" color="#8b6f47" text="" />
        <p className="text-sm font-admin-body" style={{ color: '#8b6f47' }}>
          Loading page...
        </p>
      </div>
    </div>
  );
}