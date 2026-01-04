'use client';

import React, { useState, useEffect } from 'react';
import { useKasir } from '@/app/contexts/KasirContext';
import { Clock, User, Receipt, ShoppingCart } from 'lucide-react';

export function KasirHeader() {
  const { state } = useKasir();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    // Function to update time
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
      setCurrentDate(now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    };

    // Update immediately
    updateDateTime();

    // Update every second
    const interval = setInterval(updateDateTime, 1000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        {/* Left Section - Title and Date */}
        <div className="flex items-center space-x-3 sm:space-x-6">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center">
              <Receipt className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-orange-500" />
              <span className="hidden xs:inline">Kasir BakeSmart</span>
              <span className="xs:hidden">Kasir</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">{currentDate}</p>
          </div>
          
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 bg-gray-50 px-2 sm:px-3 py-1 sm:py-2 rounded-lg">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="font-mono">{currentTime}</span>
          </div>
        </div>

        {/* Center Section - Current Customer (hidden on small screens) */}
        <div className="hidden md:flex items-center space-x-4">
          {state.customerName && (
            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Customer: {state.customerName}
              </span>
            </div>
          )}
        </div>

        {/* Right Section - Cart Summary */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-1 sm:space-x-2 bg-orange-50 px-2 sm:px-4 py-1 sm:py-2 rounded-lg">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            <div className="text-xs sm:text-sm">
              <span className="font-medium text-orange-700">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </span>
              <span className="text-orange-600 ml-1 sm:ml-2">
                Rp {state.cart.reduce((sum, item) => sum + (item.product.harga * item.quantity), 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
          
          <div className="hidden sm:block text-right">
            <div className="text-sm text-gray-600">Kasir:</div>
            <div className="text-sm font-medium text-gray-900">Admin BakeSmart</div>
          </div>
        </div>
      </div>
    </div>
  );
}
