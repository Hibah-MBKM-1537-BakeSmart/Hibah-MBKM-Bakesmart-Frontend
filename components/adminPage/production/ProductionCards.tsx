'use client';

import React from 'react';
import { Clock, ChefHat, CheckCircle, User, Calendar, Package, CreditCard } from 'lucide-react';
import { useProduction, ProductionStatus } from '@/app/contexts/ProductionContext';

// Using Order interface from ProductionContext instead of ProductionOrder
import type { Order } from '@/app/contexts/ProductionContext';

interface ProductionCardProps {
  order: Order;
  onStatusUpdate: (orderId: number, status: ProductionStatus) => void;
}

function ProductionCard({ order, onStatusUpdate }: ProductionCardProps) {
  const getStatusColor = (status: ProductionStatus) => {
    switch (status) {
      case 'pending':
        return { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' };
      case 'verifying':
        return { bg: '#e0e7ff', text: '#6366f1', border: '#8b5cf6' };
      case 'paid':
        return { bg: '#dcfce7', text: '#16a34a', border: '#22c55e' };
      case 'baked':
        return { bg: '#dbeafe', text: '#2563eb', border: '#3b82f6' };
      case 'completed':
        return { bg: '#d1fae5', text: '#059669', border: '#10b981' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' };
    }
  };

  const getStatusIcon = (status: ProductionStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'verifying':
        return <Package className="w-4 h-4" />;
      case 'paid':
        return <CreditCard className="w-4 h-4" />;
      case 'baked':
        return <ChefHat className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getNextStatus = (currentStatus: ProductionStatus): ProductionStatus | null => {
    switch (currentStatus) {
      case 'pending':
        return 'verifying';
      case 'verifying':
        return 'paid';
      case 'paid':
        return 'baked';
      case 'baked':
        return 'completed';
      case 'completed':
        return null;
      default:
        return null;
    }
  };

  const getActionText = (currentStatus: ProductionStatus): string => {
    switch (currentStatus) {
      case 'pending':
        return 'Verify Order';
      case 'verifying':
        return 'Mark as Paid';
      case 'paid':
        return 'Start Baking';
      case 'baked':
        return 'Mark as Done';
      case 'completed':
        return 'Completed';
      default:
        return 'Process';
    }
  };

  const statusColor = getStatusColor(order.status);
  const nextStatus = getNextStatus(order.status);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6" style={{ borderColor: '#e0d5c7' }}>
      {/* Product Image and Basic Info */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="w-16 h-16 rounded-lg overflow-hidden" style={{ backgroundColor: '#f9f7f4' }}>
          {order.order_products?.[0]?.product?.gambars?.[0]?.file_path ? (
            <img 
              src={order.order_products[0].product.gambars[0].file_path} 
              alt={order.order_products[0].product?.nama || 'Product'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ChefHat className="w-8 h-8" style={{ color: '#8b6f47' }} />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold font-admin-heading" style={{ color: '#5d4037' }}>
            {order.order_products?.[0]?.product?.nama || 'Product Name'}
          </h3>
          <p className="text-sm font-admin-body" style={{ color: '#8b6f47' }}>
            Quantity: {order.order_products?.[0]?.jumlah || 0} {(order.order_products?.[0]?.jumlah || 0) > 1 ? 'pcs' : 'pc'}
          </p>
          <div className="flex items-center mt-2">
            <div 
              className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium font-admin-body"
              style={{ 
                backgroundColor: statusColor.bg, 
                color: statusColor.text,
                border: `1px solid ${statusColor.border}`
              }}
            >
              {getStatusIcon(order.status)}
              <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm font-admin-body">
          <div className="flex items-center space-x-1" style={{ color: '#8b6f47' }}>
            <User className="w-4 h-4" />
            <span>Customer:</span>
          </div>
          <span style={{ color: '#5d4037' }}>{order.user?.nama || 'Unknown Customer'}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm font-admin-body">
          <div className="flex items-center space-x-1" style={{ color: '#8b6f47' }}>
            <Calendar className="w-4 h-4" />
            <span>Order Date:</span>
          </div>
          <span style={{ color: '#5d4037' }}>
            {new Date(order.created_at).toLocaleDateString('id-ID')}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm font-admin-body">
          <span style={{ color: '#8b6f47' }}>Amount:</span>
          <span className="font-semibold" style={{ color: '#5d4037' }}>
            Rp {order.order_products?.reduce((sum, op) => sum + (op.harga_beli * op.jumlah), 0)?.toLocaleString('id-ID') || '0'}
          </span>
        </div>
        
        {order.order_products?.[0]?.note && (
          <div className="mt-2">
            <p className="text-xs font-admin-body" style={{ color: '#8b6f47' }}>
              Notes: {order.order_products[0].note}
            </p>
          </div>
        )}
      </div>

      {/* Action Button */}
      {nextStatus ? (
        <button
          onClick={() => onStatusUpdate(order.id, nextStatus)}
          className="w-full py-2 px-4 rounded-lg font-medium transition-colors font-admin-body"
          style={{
            backgroundColor: '#8b6f47',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#5d4037';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#8b6f47';
          }}
        >
          {getActionText(order.status)}
        </button>
      ) : (
        <div 
          className="w-full py-2 px-4 rounded-lg font-medium text-center font-admin-body"
          style={{
            backgroundColor: statusColor.bg,
            color: statusColor.text
          }}
        >
          ✓ {getActionText(order.status)}
        </div>
      )}
    </div>
  );
}

export function ProductionCards() {
  const { orders, getOrdersByDate, selectedDate, updateOrderStatus } = useProduction();
  
  // Get orders for selected date or today's orders
  const todayOrders = getOrdersByDate(selectedDate).filter(order => order.status !== 'completed');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold font-admin-heading" style={{ color: '#5d4037' }}>
          Today's Production Queue
        </h2>
        <p className="text-sm font-admin-body" style={{ color: '#8b6f47' }}>
          {selectedDate.toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {todayOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center" style={{ borderColor: '#e0d5c7' }}>
          <ChefHat className="w-12 h-12 mx-auto mb-4" style={{ color: '#8b6f47' }} />
          <p className="text-lg font-medium font-admin-heading" style={{ color: '#5d4037' }}>
            No production orders for this date
          </p>
          <p className="text-sm font-admin-body mt-2" style={{ color: '#8b6f47' }}>
            All orders for this date have been completed or there are no orders scheduled.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {todayOrders.map((order) => (
            <ProductionCard 
              key={order.id} 
              order={order} 
              onStatusUpdate={updateOrderStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
