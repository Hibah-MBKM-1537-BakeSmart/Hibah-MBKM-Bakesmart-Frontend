'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface OptimizedLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  color?: string;
}

export const OptimizedLoader = React.memo(function OptimizedLoader({ 
  size = 'md', 
  text = 'Loading...', 
  color = '#8b6f47' 
}: OptimizedLoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Loader2 
        className={`animate-spin ${sizeClasses[size]}`} 
        style={{ color }} 
      />
      {text && (
        <span className="text-sm font-admin-body" style={{ color }}>
          {text}
        </span>
      )}
    </div>
  );
});