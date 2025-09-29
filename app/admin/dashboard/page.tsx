'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Calendar,
  Clock
} from 'lucide-react';

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const stats: StatCard[] = [
  {
    title: 'Total Revenue',
    value: 'Rp 45,320,000',
    change: '+12.5%',
    changeType: 'increase',
    icon: DollarSign,
    color: '#8b6f47'
  },
  {
    title: 'Total Orders',
    value: '1,234',
    change: '+8.2%',
    changeType: 'increase',
    icon: ShoppingCart,
    color: '#9B6D49'
  },
  {
    title: 'Total Products',
    value: '156',
    change: '+3.1%',
    changeType: 'increase',
    icon: Package,
    color: '#5d4037'
  },
  {
    title: 'Total Customers',
    value: '2,847',
    change: '-2.4%',
    changeType: 'decrease',
    icon: Users,
    color: '#7b5235'
  }
];

const recentOrders = [
  {
    id: 1,
    customer: 'Budi Santoso',
    customerPhone: '081234567890',
    product: 'Chocolate Cake',
    quantity: 1,
    amount: 125000,
    status: 'completed' as const,
    created_at: '2024-12-15T08:00:00.000Z'
  },
  {
    id: 2,
    customer: 'Siti Nurhasanah',
    customerPhone: '082345678901',
    product: 'Birthday Cake',
    quantity: 1,
    amount: 200000,
    status: 'baked' as const,
    created_at: '2024-12-15T12:00:00.000Z'
  },
  {
    id: 3,
    customer: 'Ahmad Wijaya',
    customerPhone: '083456789012',
    product: 'Donuts Box (12 pcs)',
    quantity: 2,
    amount: 120000,
    status: 'completed' as const,
    created_at: '2024-12-14T14:00:00.000Z'
  },
  {
    id: 4,
    customer: 'Rina Marlina',
    customerPhone: '084567890123',
    product: 'Wedding Cake',
    quantity: 1,
    amount: 750000,
    status: 'paid' as const,
    created_at: '2024-12-14T08:00:00.000Z'
  }
];

const topProducts = [
  {
    id: 1,
    nama: 'Chocolate Cake',
    sales: 145,
    revenue: 18125000,
    stok: 10
  },
  {
    id: 2,
    nama: 'Red Velvet Cupcakes',
    sales: 89,
    revenue: 1335000,
    stok: 24
  },
  {
    id: 4,
    nama: 'Birthday Cake',
    sales: 67,
    revenue: 13400000,
    stok: 5
  },
  {
    id: 5,
    nama: 'Donuts Box (12 pcs)',
    sales: 234,
    revenue: 14040000,
    stok: 8
  }
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-admin-heading" style={{ color: '#5d4037' }}>Dashboard</h1>
          <p className="font-admin-body" style={{ color: '#8b6f47' }}>Welcome back! Here's what's happening with your bakery.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm font-admin-body" style={{ color: '#8b6f47' }}>
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6" style={{ borderColor: '#e0d5c7' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium font-admin-body" style={{ color: '#8b6f47' }}>{stat.title}</p>
                  <p className="text-2xl font-bold mt-2 font-admin-heading" style={{ color: '#5d4037' }}>{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === 'increase' ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium font-admin-body ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1 font-admin-body">vs last month</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: stat.color }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border" style={{ borderColor: '#e0d5c7' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: '#e0d5c7' }}>
            <h2 className="text-lg font-semibold font-admin-heading" style={{ color: '#5d4037' }}>Recent Orders</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.map((order, index) => {
                const timeAgo = () => {
                  const now = new Date();
                  const orderTime = new Date(order.created_at);
                  const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
                  
                  if (diffInMinutes < 60) {
                    return `${diffInMinutes} minutes ago`;
                  } else if (diffInMinutes < 1440) {
                    return `${Math.floor(diffInMinutes / 60)} hours ago`;
                  } else {
                    return `${Math.floor(diffInMinutes / 1440)} days ago`;
                  }
                };

                const getStatusDisplay = (status: string) => {
                  switch (status) {
                    case 'completed': return 'Completed';
                    case 'baked': return 'Baked';
                    case 'paid': return 'Paid';
                    case 'verifying': return 'Verifying';
                    case 'pending': return 'Pending';
                    default: return status;
                  }
                };

                const getStatusStyle = (status: string) => {
                  switch (status) {
                    case 'completed':
                      return 'text-white';
                    case 'baked':
                      return 'bg-blue-100 text-blue-800';
                    case 'paid':
                      return 'bg-green-100 text-green-800';
                    case 'verifying':
                      return 'bg-yellow-100 text-yellow-800';
                    case 'pending':
                      return 'bg-gray-100 text-gray-800';
                    default:
                      return 'bg-gray-100 text-gray-800';
                  }
                };

                return (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#f9f7f4' }}>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium font-admin-heading" style={{ color: '#5d4037' }}>#{order.id}</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full font-admin-body ${getStatusStyle(order.status)}`}
                        style={order.status === 'completed' ? { backgroundColor: '#8b6f47' } : {}}
                      >
                        {getStatusDisplay(order.status)}
                      </span>
                    </div>
                    <p className="text-sm font-admin-body" style={{ color: '#8b6f47' }}>
                      {order.customer} ({order.customerPhone}) • {order.product} ({order.quantity}x)
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-semibold font-admin-heading" style={{ color: '#5d4037' }}>
                        Rp {order.amount.toLocaleString('id-ID')}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 font-admin-body">
                        <Clock className="w-3 h-3 mr-1" />
                        {timeAgo()}
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
            <div className="mt-4">
              <button className="w-full text-center py-2 text-sm font-medium transition-colors font-admin-body" style={{ color: '#8b6f47' }}>
                View All Orders
              </button>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border" style={{ borderColor: '#e0d5c7' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: '#e0d5c7' }}>
            <h2 className="text-lg font-semibold font-admin-heading" style={{ color: '#5d4037' }}>Top Products</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f9f7f4' }}>
                      <Package className="w-5 h-5" style={{ color: '#8b6f47' }} />
                    </div>
                    <div>
                      <p className="font-medium font-admin-heading" style={{ color: '#5d4037' }}>{product.nama}</p>
                      <p className="text-sm font-admin-body" style={{ color: '#8b6f47' }}>{product.sales} sales • Stok: {product.stok}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold font-admin-heading" style={{ color: '#5d4037' }}>
                      Rp {product.revenue.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6" style={{ borderColor: '#e0d5c7' }}>
        <h2 className="text-lg font-semibold mb-4 font-admin-heading" style={{ color: '#5d4037' }}>Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors" style={{ borderColor: '#e0d5c7' }}>
            <Package className="w-8 h-8 mb-2" style={{ color: '#8b6f47' }} />
            <span className="text-sm font-medium font-admin-body" style={{ color: '#5d4037' }}>Add Product</span>
          </button>
          <button className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors" style={{ borderColor: '#e0d5c7' }}>
            <ShoppingCart className="w-8 h-8 mb-2" style={{ color: '#8b6f47' }} />
            <span className="text-sm font-medium font-admin-body" style={{ color: '#5d4037' }}>View Kasir</span>
          </button>
          <button className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors" style={{ borderColor: '#e0d5c7' }}>
            <Users className="w-8 h-8 mb-2" style={{ color: '#8b6f47' }} />
            <span className="text-sm font-medium font-admin-body" style={{ color: '#5d4037' }}>Manage Users</span>
          </button>
          <button className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors" style={{ borderColor: '#e0d5c7' }}>
            <TrendingUp className="w-8 h-8 mb-2" style={{ color: '#8b6f47' }} />
            <span className="text-sm font-medium font-admin-body" style={{ color: '#5d4037' }}>View Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
}
