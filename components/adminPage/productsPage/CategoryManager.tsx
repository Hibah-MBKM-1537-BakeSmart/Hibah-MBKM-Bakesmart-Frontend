'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Tag, AlertTriangle } from 'lucide-react';
import { useCategories, Category } from '../../../app/contexts/CategoriesContext';
import { AddCategoryModal } from './AddCategoryModal';
import { EditCategoryModal } from './EditCategoryModal';
import { useToast } from '../Toast';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryManager({ isOpen, onClose }: CategoryManagerProps) {
  const { categories, addCategory, updateCategory, deleteCategory, loading } = useCategories();
  const { addToast } = useToast();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);

  const handleAddCategory = async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await addCategory(categoryData);
      addToast({
        type: 'success',
        title: 'Kategori berhasil ditambahkan!',
        message: `Kategori "${categoryData.nama}" telah ditambahkan.`,
      });
      setShowAddModal(false);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Gagal menambahkan kategori',
        message: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui',
      });
    }
  };

  const handleEditCategory = async (id: number, categoryData: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      await updateCategory(id, categoryData);
      addToast({
        type: 'success',
        title: 'Kategori berhasil diupdate!',
        message: `Kategori "${categoryData.nama}" telah diperbarui.`,
      });
      setShowEditModal(false);
      setEditingCategory(null);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Gagal mengupdate kategori',
        message: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui',
      });
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    try {
      await deleteCategory(id);
      addToast({
        type: 'success',
        title: 'Kategori berhasil dihapus!',
        message: `Kategori "${name}" telah dihapus.`,
      });
      setDeleteConfirm(null);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Gagal menghapus kategori',
        message: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui',
      });
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setShowEditModal(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Manajemen Kategori</h2>
                <p className="text-sm text-gray-600 mt-1">Kelola kategori produk toko roti Anda</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Kategori</span>
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                  <span className="text-2xl leading-none">×</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Categories List */}
              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2 text-gray-600">Memuat kategori...</span>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-8">
                    <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada kategori</h3>
                    <p className="text-gray-600">Mulai dengan menambahkan kategori pertama Anda</p>
                  </div>
                ) : (
                  categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Tag className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{category.nama}</h4>
                          <p className="text-sm text-gray-500">
                            Dibuat: {new Date(category.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit kategori"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ id: category.id, name: category.nama })}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus kategori"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-60 overflow-y-auto">
          <div className="fixed inset-0 transition-opacity" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Hapus</h3>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Apakah Anda yakin ingin menghapus kategori <strong>"{deleteConfirm.name}"</strong>? 
                  Tindakan ini tidak dapat dibatalkan.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(deleteConfirm.id, deleteConfirm.name)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddCategory={handleAddCategory}
        existingCategories={categories}
      />

      {/* Edit Category Modal */}
      <EditCategoryModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCategory(null);
        }}
        onEditCategory={handleEditCategory}
        category={editingCategory}
        existingCategories={categories}
      />
    </>
  );
}