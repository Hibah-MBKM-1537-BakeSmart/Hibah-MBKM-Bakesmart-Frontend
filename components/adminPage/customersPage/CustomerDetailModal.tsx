'use client';

import React, { useEffect } from 'react';
import { X, Phone, MapPin, Calendar, ShoppingBag } from 'lucide-react';
import { useCustomers } from '../../../app/contexts/CustomersContext';

export default function CustomerDetailModal() {
  const { state, closeCustomerDetail } = useCustomers();

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeCustomerDetail();
      }
    };

    if (state.showCustomerDetail) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [state.showCustomerDetail, closeCustomerDetail]);

  if (!state.showCustomerDetail || !state.selectedCustomer) {
    return null;
  }

  const customer = state.selectedCustomer;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeCustomerDetail();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4" 
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(3px)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative z-[10000]"
        style={{
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 font-poppins">Detail Customer</h2>
          <button
            onClick={closeCustomerDetail}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="max-w-md mx-auto">
            {/* Simplified Customer Information */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 font-poppins">Informasi Customer</h3>
              
              {/* Customer Name */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#9B6D49] flex items-center justify-center">
                  <span className="text-sm font-bold text-white font-poppins">
                    {customer.nama.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 font-inter">{customer.nama}</div>
                  <div className="text-sm text-gray-500 font-inter">Customer ID: {customer.id}</div>
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500 font-inter">Nomor Telepon</div>
                  <div className="font-medium text-gray-900 font-inter">{customer.no_hp}</div>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500 font-inter">Member Sejak</div>
                  <div className="font-medium text-gray-900 font-inter">
                    {new Date(customer.created_at).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {/* Last Purchase Date */}
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500 font-inter">Pembelian Terakhir</div>
                  <div className="font-medium text-gray-900 font-inter">
                    {customer.lastPurchase 
                      ? new Date(customer.lastPurchase.created_at).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Belum pernah membeli'
                    }
                  </div>
                </div>
              </div>

              {/* Last Purchase Product (if available) */}
              {customer.lastPurchase && (
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500 font-inter">Produk Terakhir</div>
                    <div className="font-medium text-gray-900 font-inter">
                      {customer.lastPurchase.product?.nama || 'Unknown Product'}
                    </div>
                    <div className="text-sm text-gray-500 font-inter">
                      {customer.lastPurchase.jumlah}x - {formatCurrency(customer.lastPurchase.harga_beli)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex justify-end">
            <button
              onClick={closeCustomerDetail}
              className="px-4 py-2 bg-[#9B6D49] text-white rounded-lg hover:bg-[#8b6f47] font-inter"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
