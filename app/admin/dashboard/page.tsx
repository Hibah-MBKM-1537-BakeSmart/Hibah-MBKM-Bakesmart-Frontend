'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
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
    color: '#10B981'
  },
  {
    title: 'Total Orders',
    value: '1,234',
    change: '+8.2%',
    changeType: 'increase',
    icon: ShoppingCart,
    color: '#3B82F6'
  },
  {
    title: 'Total Products',
    value: '156',
    change: '+3.1%',
    changeType: 'increase',
    icon: Package,
    color: '#8B5CF6'
  },
  {
    title: 'Total Customers',
    value: '2,847',
    change: '-2.4%',
    changeType: 'decrease',
    icon: Users,
    color: '#F59E0B'
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
  const router = useRouter();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-product':
        router.push('/admin/products');
        break;
      case 'view-kasir':
        router.push('/admin/kasir');
        break;
      case 'manage-users':
        router.push('/admin/users');
        break;
      case 'view-reports':
        // Bisa diarahkan ke halaman reports jika sudah ada
        router.push('/admin/dashboard');
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl p-8 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-admin-heading text-white">Dashboard</h1>
            <p className="font-admin-body text-white/90 mt-2">Welcome back! Here's what's happening with your bakery.</p>
          </div>
          <div className="flex items-center space-x-2 text-sm font-admin-body bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-white">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const getBgColor = () => {
            if (stat.color === '#10B981') return 'bg-green-50/80';
            if (stat.color === '#3B82F6') return 'bg-blue-50/80';
            if (stat.color === '#8B5CF6') return 'bg-purple-50/80';
            return 'bg-orange-50/80';
          };
          const getBorderColor = () => {
            if (stat.color === '#10B981') return '#A7F3D0';
            if (stat.color === '#3B82F6') return '#BFDBFE';
            if (stat.color === '#8B5CF6') return '#DDD6FE';
            return '#FDE68A';
          };
          const getIconBg = () => {
            if (stat.color === '#10B981') return '#6EE7B7';
            if (stat.color === '#3B82F6') return '#93C5FD';
            if (stat.color === '#8B5CF6') return '#C4B5FD';
            return '#FCD34D';
          };
          return (
            <div key={index} className={`${getBgColor()} rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-300`} style={{ borderColor: getBorderColor() }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium font-admin-body text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2 font-admin-heading text-gray-900">{stat.value}</p>
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
                <div className="p-4 rounded-xl shadow-sm" style={{ backgroundColor: getIconBg() }}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-200/60 hover:shadow-md transition-all duration-300">
          <div className="px-6 py-4 border-b border-blue-100 bg-blue-50/50">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold font-admin-heading text-gray-900">Recent Orders</h2>
            </div>
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
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border-2 hover:shadow-sm transition-all duration-200" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }}>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium font-admin-heading text-gray-900">#{order.id}</p>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full font-admin-body shadow-sm ${getStatusStyle(order.status)}`}
                        style={order.status === 'completed' ? { backgroundColor: '#10B981', color: 'white' } : {}}
                      >
                        {getStatusDisplay(order.status)}
                      </span>
                    </div>
                    <p className="text-sm font-admin-body text-gray-600">
                      {order.customer} ({order.customerPhone}) • {order.product} ({order.quantity}x)
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-semibold font-admin-heading text-gray-900">
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
              <button className="w-full text-center py-2 px-4 text-sm font-medium transition-all duration-200 font-admin-body bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:shadow-sm">
                View All Orders
              </button>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-purple-200/60 hover:shadow-md transition-all duration-300">
          <div className="px-6 py-4 border-b border-purple-100 bg-purple-50/50">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold font-admin-heading text-gray-900">Top Products</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topProducts.map((product, index) => {
                const getRankBadge = () => {
                  const badges = [
                    { bg: '#FCD34D', text: '#78350F', label: '🥇' },
                    { bg: '#E5E7EB', text: '#374151', label: '🥈' },
                    { bg: '#FED7AA', text: '#7C2D12', label: '🥉' },
                    { bg: '#93C5FD', text: '#1E3A8A', label: '4th' },
                  ];
                  return badges[index] || badges[3];
                };
                const badge = getRankBadge();
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border-2 hover:shadow-sm transition-all duration-200" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }}>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold shadow-sm" style={{ backgroundColor: badge.bg, color: badge.text }}>
                        {badge.label}
                      </div>
                      <div>
                        <p className="font-medium font-admin-heading text-gray-900">{product.nama}</p>
                        <p className="text-sm font-admin-body text-gray-600">{product.sales} sales • Stok: {product.stok}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold font-admin-heading text-gray-900">
                        Rp {product.revenue.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-green-200/60 p-6 hover:shadow-md transition-all duration-300">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-green-400 flex items-center justify-center">
            <span className="text-white font-bold text-lg">⚡</span>
          </div>
          <h2 className="text-lg font-semibold font-admin-heading text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => handleQuickAction('add-product')}
            className="flex flex-col items-center p-6 rounded-xl bg-purple-400 hover:bg-purple-500 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
          >
            <Package className="w-8 h-8 mb-2 text-white" />
            <span className="text-sm font-medium font-admin-body text-white">Add Product</span>
          </button>
          <button 
            onClick={() => handleQuickAction('view-kasir')}
            className="flex flex-col items-center p-6 rounded-xl bg-blue-400 hover:bg-blue-500 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
          >
            <ShoppingCart className="w-8 h-8 mb-2 text-white" />
            <span className="text-sm font-medium font-admin-body text-white">View Kasir</span>
          </button>
          <button 
            onClick={() => handleQuickAction('manage-users')}
            className="flex flex-col items-center p-6 rounded-xl bg-orange-400 hover:bg-orange-500 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
          >
            <Users className="w-8 h-8 mb-2 text-white" />
            <span className="text-sm font-medium font-admin-body text-white">Manage Users</span>
          </button>
          <button 
            onClick={() => handleQuickAction('view-reports')}
            className="flex flex-col items-center p-6 rounded-xl bg-green-400 hover:bg-green-500 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
          >
            <TrendingUp className="w-8 h-8 mb-2 text-white" />
            <span className="text-sm font-medium font-admin-body text-white">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
}
