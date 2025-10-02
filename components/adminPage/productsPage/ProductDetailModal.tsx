'use client';

import React from 'react';
import { X, Package, Star } from 'lucide-react';
import { Product } from '@/app/contexts/ProductsContext';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function ProductDetailModal({ isOpen, onClose, product }: ProductDetailModalProps) {
  if (!isOpen || !product) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white shadow-xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Detail Produk</h3>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100" aria-label="Close">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center flex-shrink-0">
              {product.gambars && product.gambars.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.gambars[0].file_path} alt={product.nama} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-8 h-8 text-orange-600" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xl font-semibold text-gray-900 truncate">{product.nama}</h4>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {product.status}
                </span>
              </div>
              {product.jenis?.[0]?.nama && (
                <p className="text-sm text-gray-600">Kategori: {product.jenis[0].nama}</p>
              )}
              <p className="mt-2 text-gray-700 whitespace-pre-line">{product.deskripsi}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-600">Harga</p>
              <p className="text-lg font-semibold">{formatPrice(product.harga)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-600">Stok</p>
              <p className="text-lg font-semibold">{product.stok} unit</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-600">Penjualan</p>
              <p className="text-lg font-semibold">{product.sales ?? 0}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-600">Rating</p>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <p className="text-lg font-semibold">{product.rating ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
          <button onClick={onClose} className="px-4 py-2 rounded-md border hover:bg-gray-50">Tutup</button>
        </div>
      </div>
    </div>
  );
}
