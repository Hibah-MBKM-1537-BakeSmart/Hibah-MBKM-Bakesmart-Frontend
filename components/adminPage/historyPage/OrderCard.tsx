'use client';

import React from 'react';
import { useHistory } from '@/app/contexts/HistoryContext';
import type { Order } from '@/app/contexts/HistoryContext';
import {
  Eye,
  Printer,
  Phone,
  Calendar,
  Clock,
  CreditCard,
  ShoppingBag
} from 'lucide-react';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const { selectOrder } = useHistory();

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return { bg: '#d4edda', text: '#155724', border: '#c3e6cb' };
      case 'unpaid':
        return { bg: '#f8d7da', text: '#721c24', border: '#f5c6cb' };
      case 'partial':
        return { bg: '#fff3cd', text: '#856404', border: '#ffeaa7' };
      default:
        return { bg: '#e2e3e5', text: '#383d41', border: '#d1ecf1' };
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: '#d4edda', text: '#155724', border: '#c3e6cb' };
      case 'cancelled':
        return { bg: '#f8d7da', text: '#721c24', border: '#f5c6cb' };
      case 'paid':
        return { bg: '#d4edda', text: '#155724', border: '#c3e6cb' };
      case 'processing':
        return { bg: '#fff3cd', text: '#856404', border: '#ffeaa7' };
      case 'verifying':
        return { bg: '#d1ecf1', text: '#0c5460', border: '#bee5eb' };
      default:
        return { bg: '#e2e3e5', text: '#383d41', border: '#d1ecf1' };
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Lunas';
      case 'unpaid': return 'Belum Bayar';
      case 'partial': return 'Sebagian';
      default: return status;
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      case 'paid': return 'Dibayar';
      case 'processing': return 'Diproses';
      case 'verifying': return 'Verifikasi';
      default: return status;
    }
  };

  const getStatusText = (status: string, type: 'payment' | 'order') => {
    switch (status) {
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'Tunai';
      case 'transfer': return 'Transfer';
      case 'card': return 'Kartu';
      default: return method;
    }
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement print functionality
    window.print();
  };

  const handleViewDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectOrder(order);
  };

  const paymentStatusStyle = getPaymentStatusColor(order.status);
  const orderStatusStyle = getOrderStatusColor(order.status);

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
      style={{ borderColor: '#e0d5c7' }}
      onClick={() => selectOrder(order)}
    >
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: '#e0d5c7' }}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f9f7f4' }}>
              <ShoppingBag className="w-4 h-4" style={{ color: '#8b6f47' }} />
            </div>
            <h3 className="text-base font-semibold font-admin-heading" style={{ color: '#5d4037' }}>
              Order #{order.id}
            </h3>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleViewDetail}
              className="p-1.5 rounded-lg border transition-colors"
              style={{ borderColor: '#e0d5c7', color: '#8b6f47' }}
              title="Detail"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg border transition-colors"
              style={{ borderColor: '#e0d5c7', color: '#8b6f47' }}
              title="Print"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-xs font-admin-body" style={{ color: '#8b6f47' }}>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(order.created_at).toLocaleDateString('id-ID')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Customer Info - Removed since backend doesn't include user info */}
      <div className="p-3 bg-opacity-50" style={{ backgroundColor: '#f9f7f4' }}>
        <p className="font-semibold text-sm font-admin-heading" style={{ color: '#5d4037' }}>
          Informasi Pesanan
        </p>
        <div className="flex items-center gap-1 text-xs font-admin-body mt-1" style={{ color: '#8b6f47' }}>
          <CreditCard className="w-3 h-3" />
          <span>{order.provider || 'N/A'}</span>
        </div>
        {order.courier_name && (
          <div className="flex items-center gap-1 text-xs font-admin-body mt-1" style={{ color: '#8b6f47' }}>
            <ShoppingBag className="w-3 h-3" />
            <span>{order.courier_name}</span>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="p-4 flex-grow">
        <h4 className="text-xs font-semibold mb-2 font-admin-heading" style={{ color: '#5d4037' }}>
          Detail Pesanan:
        </h4>
        <div className="space-y-1 max-h-24 overflow-y-auto">
          {order.products?.slice(0, 3).map((item, index) => (
            <div key={index} className="text-xs font-admin-body" style={{ color: '#8b6f47' }}>
              <div className="flex justify-between gap-2">
                <span className="truncate flex-1">{item.nama_id || item.nama_en || 'Product'}</span>
                <span className="whitespace-nowrap">{item.jumlah}x</span>
              </div>
            </div>
          ))}
          {(order.products?.length || 0) > 3 && (
            <p className="text-xs italic font-admin-body" style={{ color: '#8b6f47' }}>
              +{(order.products?.length || 0) - 3} item lainnya
            </p>
          )}
          {(!order.products || order.products.length === 0) && (
            <p className="text-xs italic font-admin-body" style={{ color: '#8b6f47' }}>
              Tidak ada item
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t space-y-3" style={{ borderColor: '#e0d5c7' }}>
        {/* Total Price */}
        <div className="text-center">
          <p className="text-xs font-admin-body mb-1" style={{ color: '#8b6f47' }}>Total</p>
          <p className="text-lg font-bold font-admin-heading" style={{ color: '#5d4037' }}>
            Rp {(order.total_harga || 0).toLocaleString('id-ID')}
          </p>
          {order.shipping_cost && order.shipping_cost > 0 && (
            <p className="text-xs font-admin-body mt-1" style={{ color: '#8b6f47' }}>
              (+ Ongkir: Rp {order.shipping_cost.toLocaleString('id-ID')})
            </p>
          )}
        </div>

        {/* Status Badges */}
        <div className="flex flex-col gap-2">
          {/* Payment Method */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <CreditCard className="w-3 h-3" style={{ color: '#8b6f47' }} />
              <span className="font-admin-body" style={{ color: '#8b6f47' }}>{order.provider || 'N/A'}</span>
            </div>
          </div>
          
          {/* Order Status */}
          <div className="text-center">
            <span
              className="px-3 py-1 text-xs font-semibold rounded-full font-admin-body inline-block w-full"
              style={{
                backgroundColor: orderStatusStyle.bg,
                color: orderStatusStyle.text,
                border: `1px solid ${orderStatusStyle.border}`
              }}
            >
              {getOrderStatusText(order.status)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
