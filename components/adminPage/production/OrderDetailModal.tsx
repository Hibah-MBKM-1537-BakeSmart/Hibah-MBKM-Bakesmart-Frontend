'use client';

import React from 'react';
import { X, Package, User, Calendar, MapPin, FileText } from 'lucide-react';
import type { Order } from '@/app/contexts/ProductionContext';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export function OrderDetailModal({ isOpen, onClose, order }: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'incompleted': return 'bg-yellow-100 text-yellow-800';
      case 'baked': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-purple-100 text-purple-800';
      case 'verifying': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAmount = order.order_products?.reduce((total, product) => 
    total + (product.harga_beli || 0), 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <h3 className="text-xl font-semibold text-gray-900">Detail Pesanan #{order.id}</h3>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100" aria-label="Close">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Status and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Tanggal Pesanan</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{formatDate(order.created_at)}</span>
                </div>
              </div>

              {order.waktu_ambil && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Waktu Ambil</label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{formatDate(order.waktu_ambil)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Pelanggan</label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">{order.user?.nama}</div>
                    <div className="text-xs text-gray-500">{order.user?.no_hp}</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Total Pembayaran</label>
                <div className="text-lg font-semibold text-gray-900 mt-1">
                  {formatPrice(totalAmount)}
                </div>
              </div>
            </div>
          </div>

          {/* Order Products */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Produk Pesanan</h4>
            <div className="space-y-4">
              {order.order_products?.map((orderProduct, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center flex-shrink-0">
                      {orderProduct.product?.gambars && orderProduct.product.gambars.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={orderProduct.product.gambars[0].file_path} 
                          alt={orderProduct.product.nama} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <Package className="w-6 h-6 text-orange-600" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{orderProduct.product?.nama}</h5>
                      <p className="text-sm text-gray-600 mt-1">{orderProduct.product?.deskripsi}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3 text-sm">
                        <div>
                          <span className="text-gray-500">Jumlah:</span>
                          <span className="ml-1 font-medium">{orderProduct.jumlah} pcs</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Harga:</span>
                          <span className="ml-1 font-medium">{formatPrice(orderProduct.product?.harga || 0)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Subtotal:</span>
                          <span className="ml-1 font-medium">{formatPrice(orderProduct.harga_beli || 0)}</span>
                        </div>
                      </div>

                      {orderProduct.note && (
                        <div className="mt-3">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                            <div>
                              <span className="text-sm text-gray-500">Catatan:</span>
                              <p className="text-sm text-gray-700 mt-1">{orderProduct.note}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Proof */}
          {order.bukti_path && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Bukti Pembayaran</h4>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700">{order.bukti_path}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">File bukti pembayaran yang diupload pelanggan</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
          <button onClick={onClose} className="px-4 py-2 rounded-md border hover:bg-gray-50">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}