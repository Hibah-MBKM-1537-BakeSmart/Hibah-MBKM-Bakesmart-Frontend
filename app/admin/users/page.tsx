'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Shield,
  User,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  UserX,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { AddUserModal } from '@/components/adminPage/users/AddUserModal';
import { ViewUserModal } from '@/components/adminPage/users/ViewUserModal';
import { EditUserModal } from '@/components/adminPage/users/EditUserModal';
import { ToastNotification, useToast } from '@/components/adminPage/users/Toast';
import { ConfirmDialog } from '@/components/adminPage/users/ConfirmDialog';

// Backend admin structure (from users table joined with roles)
interface AdminData {
  id: number;
  nama: string;
  no_hp: string;
  role: string; // role name from roles table
}

// Backend role structure
interface Role {
  id: number;
  name: string;
}

// Dynamic role colors generator
const getRoleColor = (roleName: string): string => {
  const colors: Record<string, string> = {
    owner: 'bg-purple-100 text-purple-800',
    baker: 'bg-orange-100 text-orange-800',
    cashier: 'bg-blue-100 text-blue-800',
    packager: 'bg-green-100 text-green-800',
    admin: 'bg-orange-100 text-orange-800',
    kasir: 'bg-blue-100 text-blue-800',
    produksi: 'bg-green-100 text-green-800',
    super_admin: 'bg-purple-100 text-purple-800',
  };
  return colors[roleName.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

export default function UsersPage() {
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminData | null>(null);
  
  // Toast and confirm dialog state
  const { toasts, showSuccess, showError, showWarning, removeToast } = useToast();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Fetch admins from backend
  useEffect(() => {
    fetchAdmins();
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        console.warn('Failed to fetch roles, using fallback');
        // Use fallback roles for development
        setRoles([
          { id: 1, name: 'owner' },
          { id: 2, name: 'baker' },
          { id: 3, name: 'cashier' },
          { id: 4, name: 'packager' },
        ]);
        return;
      }

      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        setRoles(result.data);
      } else {
        console.warn('No roles data returned, using fallback');
        // Use fallback roles
        setRoles([
          { id: 1, name: 'owner' },
          { id: 2, name: 'baker' },
          { id: 3, name: 'cashier' },
          { id: 4, name: 'packager' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      // Use fallback roles on error
      setRoles([
        { id: 1, name: 'owner' },
        { id: 2, name: 'baker' },
        { id: 3, name: 'cashier' },
        { id: 4, name: 'packager' },
      ]);
    }
  };

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admins', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        console.warn('Failed to fetch admins, showing empty state');
        setAdmins([]);
        setIsLoading(false);
        return;
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setAdmins(result.data);
      } else {
        console.warn('Invalid response format:', result);
        setAdmins([]);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      setAdmins([]);
      showWarning(
        'Tidak dapat memuat data admin', 
        'Pastikan backend server berjalan dan endpoint /admins tersedia'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique roles from backend roles data
  const roleOptions = ['all', ...roles.map(r => r.name)];

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = 
      admin.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.no_hp.includes(searchTerm) ||
      admin.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || admin.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleUpdateRole = async (adminId: number, newRoleId: number) => {
    try {
      const response = await fetch(`/api/admins/${adminId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role_id: newRoleId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      const result = await response.json();
      
      if (result.success) {
        showSuccess('Role berhasil diperbarui!', 'Perubahan role telah disimpan.');
        fetchAdmins(); // Refresh data
      } else {
        showError('Gagal memperbarui role', result.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      showError('Gagal memperbarui role', 'Tidak dapat menyimpan perubahan');
    }
  };

  const handleAddUser = (userData: {
    name: string;
    email: string;
    phone: string;
    role: string;
    password: string;
  }) => {
    // TODO: Implement add user API call
    showWarning('Fitur belum tersedia', 'Penambahan user akan diimplementasikan nanti');
  };

  const handleViewUser = (admin: AdminData) => {
    setSelectedAdmin(admin);
    setShowViewModal(true);
  };

  const handleEditUser = (admin: AdminData) => {
    setSelectedAdmin(admin);
    setShowEditModal(true);
  };

  const handleUpdateUser = (userId: number, userData: any) => {
    // TODO: Implement update user API call
    showWarning('Fitur belum tersedia', 'Edit user akan diimplementasikan nanti');
  };

  const handleDeleteUser = (userId: number, userName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus User',
      message: `Apakah Anda yakin ingin menghapus user ${userName}?\n\nTindakan ini tidak dapat dibatalkan.`,
      onConfirm: () => {
        // TODO: Implement delete user API call
        showWarning('Fitur belum tersedia', 'Penghapusan user akan diimplementasikan nanti');
      },
      type: 'danger',
      confirmText: 'Hapus'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-lg text-gray-600">Memuat data admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Users</h1>
          <p className="text-gray-600">Kelola akun admin dan staff yang bekerja</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchAdmins}
            className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Admin</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari nama, no HP, atau role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              >
                {roleOptions.map(role => (
                  <option key={role} value={role}>
                    {role === 'all' ? 'Semua Role' : role.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {filteredAdmins.length} dari {admins.length} admin
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No HP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-orange-600 font-medium">
                          {admin.nama.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {admin.nama}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {admin.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Phone className="w-3 h-3 text-gray-400 mr-2" />
                      {admin.no_hp}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(admin.role)}`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {admin.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleViewUser(admin)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditUser(admin)}
                        className="text-gray-400 hover:text-orange-600 p-1"
                        title="Edit Admin"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(admin.id, admin.nama)}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Hapus Admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAdmins.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada admin ditemukan</h3>
            <p className="text-gray-600">Coba ubah kriteria pencarian atau filter</p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Admin</p>
              <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Dynamic role counts from backend roles */}
        {roles.map(role => {
          const roleCount = admins.filter(a => a.role === role.name).length;
          const colorClass = getRoleColor(role.name);
          const bgColor = colorClass.split(' ')[0].replace('bg-', '');
          const textColor = colorClass.split(' ')[1].replace('text-', '');
          
          return (
            <div key={role.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 capitalize">{role.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{roleCount}</p>
                </div>
                <div className={`p-3 rounded-lg ${bgColor}`}>
                  <Shield className={`w-6 h-6 ${textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add User Modal - TODO: Update for backend */}
      {/* <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddUser={handleAddUser}
      /> */}

      {/* View User Modal - TODO: Update for backend */}
      {selectedAdmin && showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Detail Admin</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Nama</label>
                <p className="text-gray-900">{selectedAdmin.nama}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">No HP</label>
                <p className="text-gray-900">{selectedAdmin.no_hp}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Role</label>
                <p className="text-gray-900">{selectedAdmin.role}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowViewModal(false);
                setSelectedAdmin(null);
              }}
              className="mt-6 w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Edit User Modal - TODO: Update for backend */}
      {/* <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAdmin(null);
        }}
        user={selectedAdmin}
        onUpdateUser={handleUpdateUser}
      /> */}

      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onClose={removeToast} />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText={confirmDialog.confirmText}
      />
    </div>
  );
}
