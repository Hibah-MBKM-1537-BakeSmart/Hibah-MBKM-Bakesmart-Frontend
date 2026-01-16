'use client';

import React, { useState } from 'react';
import { X, Printer, Calendar, CheckSquare, Square } from 'lucide-react';
import type { Order } from '@/app/contexts/ProductionContext';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

export function PrintModal({ isOpen, onClose, orders }: PrintModalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [printAll, setPrintAll] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

  if (!isOpen) return null;

  // Filter orders by selected date (using waktu_ambil)
  const ordersByDate = orders.filter(order => {
    if (!order.waktu_ambil) return false;
    const orderDate = new Date(order.waktu_ambil).toISOString().slice(0, 10);
    return orderDate === selectedDate;
  });

  // Filter orders that need baking (incompleted, paid, baked status)
  const ordersToBake = ordersByDate.filter(order => 
    ['incompleted', 'paid', 'baked'].includes(order.status as string)
  );

  const toggleOrderSelection = (orderId: number) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === ordersToBake.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(ordersToBake.map(order => order.id));
    }
  };

  const handlePrint = () => {
    const ordersToPrint = printAll ? ordersToBake : ordersToBake.filter(order => selectedOrders.includes(order.id));
    
    if (ordersToPrint.length === 0) {
      alert('Tidak ada pesanan untuk dicetak');
      return;
    }

    // Generate print content
    const printContent = generatePrintContent(ordersToPrint, selectedDate);
    
    // Open print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
    
    onClose();
  };

  const generatePrintContent = (ordersToPrint: Order[], date: string) => {
    const formatDate = (dateString: string) =>
      new Date(dateString).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

    const formatPrice = (price: number) =>
      new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Daftar Produksi - ${formatDate(date)}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #8b6f47;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #5d4037;
              margin: 0;
              font-size: 24px;
            }
            .header h2 {
              color: #8b6f47;
              margin: 5px 0;
              font-size: 18px;
            }
            .summary {
              background-color: #f9f7f4;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .summary h3 {
              margin-top: 0;
              color: #5d4037;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th, td {
              border: 1px solid #e0d5c7;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f9f7f4;
              color: #5d4037;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #fafafa;
            }
            .status {
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;
            }
            .status.incompleted {
              background-color: #fef3c7;
              color: #92400e;
            }
            .status.paid {
              background-color: #e0e7ff;
              color: #3730a3;
            }
            .status.baked {
              background-color: #dbeafe;
              color: #1e40af;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #8b6f47;
              font-size: 12px;
            }
            .notes {
              background-color: #fffbeb;
              border: 1px solid #f59e0b;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 20px;
            }
            .notes h4 {
              margin-top: 0;
              color: #92400e;
            }
            @media print {
              body { margin: 0; }
              .header { page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BakeSmart - Daftar Produksi</h1>
            <h2>${formatDate(date)}</h2>
            <p>Total: ${ordersToPrint.length} pesanan</p>
          </div>

          <div class="summary">
            <h3>Ringkasan Produksi</h3>
            <p><strong>Tanggal Produksi:</strong> ${formatDate(date)}</p>
            <p><strong>Total Pesanan:</strong> ${ordersToPrint.length}</p>
            <p><strong>Total Item:</strong> ${ordersToPrint.reduce((total, order) => 
              total + (order.order_products?.reduce((sum, product) => sum + (product.jumlah || 0), 0) || 0), 0
            )} pcs</p>
            <p><strong>Waktu Cetak:</strong> ${new Date().toLocaleString('id-ID')}</p>
          </div>

          <div class="notes">
            <h4>📝 Catatan Produksi</h4>
            <ul>
              <li>Periksa ketersediaan bahan baku sebelum memulai produksi</li>
              <li>Pastikan suhu oven dan waktu baking sesuai resep</li>
              <li>Centang setiap item yang sudah selesai diproduksi</li>
              <li>Update status di sistem setelah produksi selesai</li>
            </ul>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 8%;">No</th>
                <th style="width: 12%;">Order ID</th>
                <th style="width: 25%;">Produk</th>
                <th style="width: 15%;">Pelanggan</th>
                <th style="width: 10%;">Jumlah</th>
                <th style="width: 15%;">Waktu Ambil</th>
                <th style="width: 10%;">Status</th>
                <th style="width: 5%;">✓</th>
              </tr>
            </thead>
            <tbody>
              ${ordersToPrint.map((order, index) => {
                const totalItems = order.order_products?.reduce((sum, product) => sum + (product.jumlah || 0), 0) || 0;
                const waktuAmbil = order.waktu_ambil ? new Date(order.waktu_ambil).toLocaleString('id-ID', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '-';
                
                return `
                  <tr>
                    <td>${index + 1}</td>
                    <td><strong>#${order.id}</strong></td>
                    <td>
                      ${order.order_products?.map(product => 
                        `<div style="margin-bottom: 5px;">
                          <strong>${product.product?.nama || 'Unknown'}</strong><br>
                          <small style="color: #666;">${product.jumlah} pcs</small>
                          ${product.note ? `<br><em style="color: #8b6f47; font-size: 11px;">${product.note}</em>` : ''}
                        </div>`
                      ).join('') || ''}
                    </td>
                    <td>
                      <strong>${order.user?.nama || 'Unknown'}</strong><br>
                      <small style="color: #666;">${order.user?.no_hp || ''}</small>
                    </td>
                    <td><strong>${totalItems} pcs</strong></td>
                    <td>${waktuAmbil}</td>
                    <td>
                      <span class="status ${order.status}">
                        ${(order.status as string) === 'incompleted' ? 'Belum Selesai' : 
                          (order.status as string) === 'paid' ? 'Sudah Dibayar' : 
                          (order.status as string) === 'baked' ? 'Sedang Dipanggang' : order.status}
                      </span>
                    </td>
                    <td style="border: 2px solid #333; text-align: center; font-size: 18px;">☐</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Dicetak pada: ${new Date().toLocaleString('id-ID')} | BakeSmart Production System</p>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white shadow-xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-orange-600" />
            <h3 className="text-xl font-semibold text-gray-900">Print Daftar Produksi</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100" aria-label="Close">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Date Selection */}
          <div>
            <label htmlFor="printDate" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Pilih Tanggal Produksi
              </div>
            </label>
            <input
              type="date"
              id="printDate"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Orders Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Ringkasan Pesanan</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total pesanan hari ini:</span>
                <span className="ml-2 font-medium">{ordersByDate.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Perlu diproduksi:</span>
                <span className="ml-2 font-medium text-orange-600">{ordersToBake.length}</span>
              </div>
            </div>
          </div>

          {/* Print Options */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Opsi Cetak</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="printOption"
                  checked={printAll}
                  onChange={() => setPrintAll(true)}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Cetak semua pesanan yang perlu diproduksi ({ordersToBake.length} pesanan)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="printOption"
                  checked={!printAll}
                  onChange={() => setPrintAll(false)}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Pilih pesanan tertentu
                </span>
              </label>
            </div>
          </div>

          {/* Order Selection */}
          {!printAll && ordersToBake.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Pilih Pesanan</h4>
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
                >
                  {selectedOrders.length === ordersToBake.length ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  {selectedOrders.length === ordersToBake.length ? 'Batalkan Semua' : 'Pilih Semua'}
                </button>
              </div>
              
              <div className="max-h-64 overflow-y-auto border rounded-lg">
                {ordersToBake.map((order) => (
                  <label key={order.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => toggleOrderSelection(order.id)}
                      className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.id} - {order.order_products?.[0]?.product?.nama}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.user?.nama} • {order.order_products?.reduce((sum, p) => sum + (p.jumlah || 0), 0)} pcs
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      (order.status as string) === 'incompleted' ? 'bg-yellow-100 text-yellow-800' :
                      (order.status as string) === 'paid' ? 'bg-purple-100 text-purple-800' :
                      (order.status as string) === 'baked' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {(order.status as string) === 'incompleted' ? 'Belum Selesai' :
                       (order.status as string) === 'paid' ? 'Sudah Dibayar' :
                       (order.status as string) === 'baked' ? 'Sedang Dipanggang' : order.status}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {ordersToBake.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500">
                <Printer className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Tidak ada pesanan yang perlu diproduksi pada tanggal ini</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Batal
          </button>
          <button
            onClick={handlePrint}
            disabled={ordersToBake.length === 0 || (!printAll && selectedOrders.length === 0)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            Cetak ({printAll ? ordersToBake.length : selectedOrders.length} pesanan)
          </button>
        </div>
      </div>
    </div>
  );
}