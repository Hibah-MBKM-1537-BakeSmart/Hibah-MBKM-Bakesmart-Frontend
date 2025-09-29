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
      className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
      style={{ borderColor: '#e0d5c7' }}
      onClick={() => selectOrder(order)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f9f7f4' }}>
            <ShoppingBag className="w-5 h-5" style={{ color: '#8b6f47' }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-admin-heading" style={{ color: '#5d4037' }}>
              Order #{order.id}
            </h3>
            <div className="flex items-center space-x-4 text-sm font-admin-body" style={{ color: '#8b6f47' }}>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(order.created_at).toLocaleDateString('id-ID')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleViewDetail}
            className="p-2 rounded-lg border transition-colors"
            style={{ borderColor: '#e0d5c7', color: '#8b6f47' }}
            title="Detail"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            className="p-2 rounded-lg border transition-colors"
            style={{ borderColor: '#e0d5c7', color: '#8b6f47' }}
            title="Print"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#f9f7f4' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium font-admin-heading" style={{ color: '#5d4037' }}>
              {order.user?.nama || 'Unknown Customer'}
            </p>
            <div className="flex items-center space-x-1 text-sm font-admin-body" style={{ color: '#8b6f47' }}>
              <Phone className="w-3 h-3" />
              <span>{order.user?.no_hp || 'No Phone'}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold font-admin-heading" style={{ color: '#5d4037' }}>
              Rp {order.order_products?.reduce((sum, item) => sum + (item.harga_beli * item.jumlah), 0)?.toLocaleString('id-ID') || '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2 font-admin-heading" style={{ color: '#5d4037' }}>
          Detail Pesanan:
        </h4>
        <div className="space-y-1">
          {order.order_products?.map((item, index) => (
            <div key={index} className="flex justify-between text-sm font-admin-body" style={{ color: '#8b6f47' }}>
              <span>{item.product?.nama || 'Product Name'}</span>
              <span>{item.jumlah}x @ Rp {item.harga_beli.toLocaleString('id-ID')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status and Payment Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Payment Status */}
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" style={{ color: '#8b6f47' }} />
            <span
              className="px-2 py-1 text-xs font-medium rounded-full font-admin-body"
              style={{
                backgroundColor: paymentStatusStyle.bg,
                color: paymentStatusStyle.text,
                border: `1px solid ${paymentStatusStyle.border}`
              }}
            >
              {getStatusText(order.status, 'payment')}
            </span>
            <span className="text-xs font-admin-body" style={{ color: '#8b6f47' }}>
              (Transfer Bank)
            </span>
          </div>
        </div>

        {/* Order Status */}
        <span
          className="px-3 py-1 text-sm font-medium rounded-full font-admin-body"
          style={{
            backgroundColor: orderStatusStyle.bg,
            color: orderStatusStyle.text,
            border: `1px solid ${orderStatusStyle.border}`
          }}
        >
          {getStatusText(order.status, 'order')}
        </span>
      </div>

      {/* Notes (if any) */}
      {order.order_products?.[0]?.note && (
        <div className="mt-4 pt-3 border-t" style={{ borderColor: '#e0d5c7' }}>
          <p className="text-sm font-admin-body" style={{ color: '#8b6f47' }}>
            <span className="font-medium">Catatan:</span> {order.order_products?.[0]?.note}
          </p>
        </div>
      )}
    </div>
  );
}
