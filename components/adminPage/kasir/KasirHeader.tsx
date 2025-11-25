'use client';

import React from 'react';
import { useKasir } from '@/app/contexts/KasirContext';
import { Clock, User, Receipt, ShoppingCart } from 'lucide-react';

export function KasirHeader() {
  const { state } = useKasir();
  const currentTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Title and Date */}
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Receipt className="w-6 h-6 mr-2 text-orange-500" />
              Kasir BakeSmart
            </h1>
            <p className="text-sm text-gray-600">{currentDate}</p>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{currentTime}</span>
          </div>
        </div>

        {/* Center Section - Current Customer */}
        <div className="flex items-center space-x-4">
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
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-orange-50 px-4 py-2 rounded-lg">
            <ShoppingCart className="w-5 h-5 text-orange-600" />
            <div className="text-sm">
              <span className="font-medium text-orange-700">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </span>
              <span className="text-orange-600 ml-2">
                Rp {state.cart.reduce((sum, item) => sum + (item.product.harga * item.quantity), 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600">Kasir:</div>
            <div className="text-sm font-medium text-gray-900">Admin BakeSmart</div>
          </div>
        </div>
      </div>
    </div>
  );
}
