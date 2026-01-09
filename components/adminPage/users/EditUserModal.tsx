'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Shield, Eye, EyeOff } from 'lucide-react';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData | null;
  onUpdateUser: (userId: string, userData: EditUserData) => void;
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

interface EditUserData {
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended';
  password?: string;
}

export function EditUserModal({ isOpen, onClose, user, onUpdateUser }: EditUserModalProps) {
  const [formData, setFormData] = useState<EditUserData>({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    status: 'active',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<EditUserData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        password: ''
      });
      setChangePassword(false);
      setErrors({});
    }
  }, [user]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const validateForm = (): boolean => {
    const newErrors: Partial<EditUserData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama wajib diisi';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon wajib diisi';
    } else if (!/^(\+62|0)[0-9]{8,13}$/.test(formData.phone.replace(/\s|-/g, ''))) {
      newErrors.phone = 'Format nomor telepon tidak valid';
    }

    // Password validation for admins and when changing password
    if ((formData.role !== 'customer' || changePassword) && changePassword) {
      if (!formData.password?.trim()) {
        newErrors.password = 'Password wajib diisi';
      } else if (formData.password && formData.password.length < 6) {
        newErrors.password = 'Password minimal 6 karakter';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updateData = { ...formData };
      if (!changePassword || formData.role === 'customer') {
        delete updateData.password;
      }
      
      onUpdateUser(user.id, updateData);
      
      onClose();
      
      // Show success message
      alert('User berhasil diperbarui!');
      
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Gagal memperbarui user. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof EditUserData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear password when switching to customer role
    if (field === 'role' && value === 'customer') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        password: ''
      }));
      setChangePassword(false);
      setErrors(prev => ({
        ...prev,
        password: undefined
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      return '+62 ' + cleaned.slice(1).replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (cleaned.startsWith('62')) {
      return '+' + cleaned.replace(/(\d{2})(\d{3})(\d{4})(\d{4})/, '$1 $2-$3-$4');
    }
    return phone;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-xl border border-gray-200 m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-orange-600" />
            <h3 className="text-xl font-semibold text-gray-900">Edit User</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100" aria-label="Close">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan nama lengkap"
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                id="edit-email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="contoh@email.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 mb-1">
              Nomor Telepon *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  handleInputChange('phone', formatted);
                }}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+62 812-3456-7890"
              />
            </div>
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>

          {/* Role Field */}
          <div>
            <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                id="edit-role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value as 'customer' | 'admin' | 'super_admin')}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
          </div>

          {/* Status Field */}
          <div>
            <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              id="edit-status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive' | 'suspended')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
              <option value="suspended">Ditangguhkan</option>
            </select>
          </div>

          {/* Change Password Checkbox for non-customers */}
          {formData.role !== 'customer' && (
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={changePassword}
                  onChange={(e) => {
                    setChangePassword(e.target.checked);
                    if (!e.target.checked) {
                      setFormData(prev => ({ ...prev, password: '' }));
                      setErrors(prev => ({ ...prev, password: undefined }));
                    }
                  }}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">Ubah password</span>
              </label>
            </div>
          )}

          {/* Password Field - Only when changing password */}
          {((formData.role !== 'customer' && changePassword) || (formData.role === 'customer' && changePassword)) && (
            <div>
              <label htmlFor="edit-password" className="block text-sm font-medium text-gray-700 mb-1">
                Password Baru *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="edit-password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-3 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Minimal 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
          )}

          {/* Customer Info */}
          {formData.role === 'customer' && !changePassword && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Info Login Customer</h4>
                  <p className="text-xs text-blue-700">
                    Customer login menggunakan <strong>nomor HP</strong> dengan OTP.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  Perbarui User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}