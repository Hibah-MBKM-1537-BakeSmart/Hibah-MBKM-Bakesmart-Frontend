'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import type { Order, ProductionStatus } from '@/app/contexts/ProductionContext';

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateOrder: (orderId: number, status: ProductionStatus, waktuAmbil?: string) => void;
}

export function EditOrderModal({ isOpen, onClose, order, onUpdateOrder }: EditOrderModalProps) {
  const [status, setStatus] = useState<ProductionStatus>('completed');
  const [waktuAmbil, setWaktuAmbil] = useState('');

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setWaktuAmbil(order.waktu_ambil ? new Date(order.waktu_ambil).toISOString().slice(0, 16) : '');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateOrder(order.id, status, waktuAmbil);
    onClose();
  };

  const handleClose = () => {
    setStatus(order.status);
    setWaktuAmbil(order.waktu_ambil ? new Date(order.waktu_ambil).toISOString().slice(0, 16) : '');
    onClose();
  };

  // Status options for verified orders only
  const statusOptions: { value: ProductionStatus; label: string; color: string }[] = [
    { value: 'completed', label: 'Selesai', color: 'text-green-600' },
    { value: 'incompleted', label: 'Belum Selesai', color: 'text-yellow-600' },
    { value: 'baked', label: 'Sedang Dipanggang', color: 'text-blue-600' },
    { value: 'paid', label: 'Sudah Dibayar', color: 'text-purple-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Edit Pesanan #{order.id}</h3>
          <button onClick={handleClose} className="p-2 rounded-md hover:bg-gray-100" aria-label="Close">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Info (Read Only) */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Informasi Pelanggan</h4>
            <div className="text-sm space-y-1">
              <div><span className="text-gray-600">Nama:</span> <span className="ml-2">{order.user?.nama}</span></div>
              <div><span className="text-gray-600">No. HP:</span> <span className="ml-2">{order.user?.no_hp}</span></div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status Produksi *
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductionStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Pilih status produksi berdasarkan kondisi saat ini
            </p>
          </div>

          {/* Pickup Time */}
          <div>
            <label htmlFor="waktuAmbil" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Waktu Ambil
              </div>
            </label>
            <input
              type="datetime-local"
              id="waktuAmbil"
              value={waktuAmbil}
              onChange={(e) => setWaktuAmbil(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Atur waktu ketika pelanggan dapat mengambil pesanan
            </p>
          </div>

          {/* Products Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Ringkasan Produk</h4>
            <div className="space-y-2">
              {order.order_products?.map((product, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{product.product?.nama}</span>
                  <span>{product.jumlah} pcs</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}