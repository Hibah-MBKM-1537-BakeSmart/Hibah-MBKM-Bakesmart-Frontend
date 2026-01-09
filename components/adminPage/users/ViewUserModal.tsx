'use client';

import React from 'react';
import { X, User, Mail, Phone, Shield, Calendar, ShoppingBag, DollarSign } from 'lucide-react';

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData | null;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  joinDate: Date;
  lastLogin?: Date;
  totalOrders: number;
  totalSpent: number;
}

export function ViewUserModal({ isOpen, onClose, user }: ViewUserModalProps) {
  if (!isOpen || !user) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      customer: 'bg-blue-100 text-blue-800',
      admin: 'bg-orange-100 text-orange-800',
      super_admin: 'bg-purple-100 text-purple-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white shadow-xl border border-gray-200 m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <User className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Detail User</h3>
              <p className="text-sm text-gray-500">Informasi lengkap pengguna</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100" aria-label="Close">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Personal Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Informasi Personal</h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Nama Lengkap</p>
                    <p className="font-medium text-gray-900">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Nomor Telepon</p>
                    <p className="font-medium text-gray-900">{user.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                      {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Customer'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Informasi Akun</h4>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Status Akun</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                    {user.status === 'active' ? 'Aktif' : user.status === 'inactive' ? 'Tidak Aktif' : 'Ditangguhkan'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Bergabung</p>
                    <p className="font-medium text-gray-900">{formatDate(user.joinDate)}</p>
                  </div>
                </div>

                {user.lastLogin && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Login Terakhir</p>
                      <p className="font-medium text-gray-900">{formatDate(user.lastLogin)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statistics (Only for customers) */}
          {user.role === 'customer' && (
            <div className="border-t pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Statistik Customer</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600">Total Pesanan</p>
                      <p className="text-2xl font-bold text-blue-900">{user.totalOrders}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600">Total Pembelian</p>
                      <p className="text-2xl font-bold text-green-900">{formatPrice(user.totalSpent)}</p>
                    </div>
                  </div>
                </div>
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
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}