'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit } from 'lucide-react';
import { Category } from '../../../app/contexts/CategoriesContext';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditCategory: (id: number, categoryData: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  category: Category | null;
  existingCategories: Category[];
}

export function EditCategoryModal({
  isOpen,
  onClose,
  onEditCategory,
  category,
  existingCategories
}: EditCategoryModalProps) {
  const [formData, setFormData] = useState({
    nama: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (isOpen && category) {
      setFormData({ 
        nama: category.nama 
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, category]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate name
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama kategori wajib diisi';
    } else if (formData.nama.trim().length < 2) {
      newErrors.nama = 'Nama kategori minimal 2 karakter';
    } else if (formData.nama.trim().length > 50) {
      newErrors.nama = 'Nama kategori maksimal 50 karakter';
    } else {
      // Check for duplicate names (excluding current category)
      const isDuplicate = existingCategories.some(
        cat => cat.id !== category?.id && cat.nama.toLowerCase() === formData.nama.trim().toLowerCase()
      );
      if (isDuplicate) {
        newErrors.nama = 'Nama kategori sudah ada';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !category) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onEditCategory(category.id, {
        nama: formData.nama.trim(),
      });
      onClose();
    } catch (error) {
      // Error is handled in the context
      console.error('Error editing category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 transition-opacity"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Edit Kategori</h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 p-2"
            >
              <span className="text-2xl leading-none">×</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* Category Name */}
              <div>
                <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => handleInputChange('nama', e.target.value)}
                  placeholder="Masukkan nama kategori"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.nama ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.nama && (
                  <p className="text-sm text-red-600 mt-1">{errors.nama}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || Object.keys(errors).length > 0}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}