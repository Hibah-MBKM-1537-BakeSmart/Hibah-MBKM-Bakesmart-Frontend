'use client';

import React, { useState } from 'react';
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
  MoreHorizontal,
  UserCheck,
  UserX
} from 'lucide-react';

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

const mockUsers: UserData[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+62 812-3456-7890',
    role: 'customer',
    status: 'active',
    joinDate: new Date('2023-06-15'),
    lastLogin: new Date('2024-01-15T10:30:00'),
    totalOrders: 12,
    totalSpent: 1250000
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+62 813-4567-8901',
    role: 'customer',
    status: 'active',
    joinDate: new Date('2023-08-22'),
    lastLogin: new Date('2024-01-14T15:45:00'),
    totalOrders: 8,
    totalSpent: 850000
  },
  {
    id: '3',
    name: 'Admin BakeSmart',
    email: 'admin@bakesmart.com',
    phone: '+62 814-5678-9012',
    role: 'admin',
    status: 'active',
    joinDate: new Date('2023-01-01'),
    lastLogin: new Date('2024-01-15T12:00:00'),
    totalOrders: 0,
    totalSpent: 0
  },
  {
    id: '4',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '+62 815-6789-0123',
    role: 'customer',
    status: 'inactive',
    joinDate: new Date('2023-12-10'),
    lastLogin: new Date('2023-12-25T09:15:00'),
    totalOrders: 3,
    totalSpent: 450000
  },
  {
    id: '5',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    phone: '+62 816-7890-1234',
    role: 'customer',
    status: 'suspended',
    joinDate: new Date('2023-09-05'),
    lastLogin: new Date('2024-01-10T14:20:00'),
    totalOrders: 15,
    totalSpent: 1800000
  },
  {
    id: '6',
    name: 'Super Admin',
    email: 'superadmin@bakesmart.com',
    phone: '+62 817-8901-2345',
    role: 'super_admin',
    status: 'active',
    joinDate: new Date('2023-01-01'),
    lastLogin: new Date('2024-01-15T11:30:00'),
    totalOrders: 0,
    totalSpent: 0
  }
];

const roleColors = {
  customer: 'bg-blue-100 text-blue-800',
  admin: 'bg-orange-100 text-orange-800',
  super_admin: 'bg-purple-100 text-purple-800'
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800'
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const roleOptions = ['all', 'customer', 'admin', 'super_admin'];
  const statusOptions = ['all', 'active', 'inactive', 'suspended'];

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const updateUserStatus = (userId: string, newStatus: UserData['status']) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage customer accounts and admin users</p>
        </div>
        <button className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
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
                placeholder="Search users..."
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
                    {role === 'all' ? 'All Roles' : role.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {filteredUsers.length} of {users.length} users
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
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <span className="text-orange-600 font-medium">
                            {user.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        {user.lastLogin && (
                          <div className="text-sm text-gray-500">
                            Last login: {formatDate(user.lastLogin)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center mb-1">
                        <Mail className="w-3 h-3 text-gray-400 mr-2" />
                        {user.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-3 h-3 text-gray-400 mr-2" />
                        {user.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                      {user.role === 'super_admin' && <Shield className="w-3 h-3 mr-1" />}
                      {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                      {user.role === 'customer' && <User className="w-3 h-3 mr-1" />}
                      {user.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[user.status]}`}>
                      {user.status === 'active' && <UserCheck className="w-3 h-3 mr-1" />}
                      {user.status === 'suspended' && <UserX className="w-3 h-3 mr-1" />}
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.totalOrders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatPrice(user.totalSpent)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 text-gray-400 mr-2" />
                      {formatDate(user.joinDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-gray-400 hover:text-gray-600 p-1">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-orange-600 p-1">
                        <Edit className="w-4 h-4" />
                      </button>
                      {user.status === 'active' ? (
                        <button 
                          onClick={() => updateUserStatus(user.id, 'suspended')}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => updateUserStatus(user.id, 'active')}
                          className="text-gray-400 hover:text-green-600 p-1"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button className="text-gray-400 hover:text-red-600 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 p-1">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'customer').length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <User className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
