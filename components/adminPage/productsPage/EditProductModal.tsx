'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Package } from 'lucide-react';
import { Product } from '@/app/contexts/ProductsContext';
import { useCategories } from '@/app/contexts/CategoriesContext';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditProduct: (productData: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  product: Product | null;
}

export function EditProductModal({ isOpen, onClose, onEditProduct, product }: EditProductModalProps) {
  const { categories } = useCategories();
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    harga: 0,
    stok: 0,
    status: 'active' as 'active' | 'inactive',
    jenis: [] as Array<{ id: number; nama: string }>,
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        nama: product.nama,
        deskripsi: product.deskripsi,
        harga: product.harga,
        stok: product.stok,
        status: product.status,
        jenis: product.jenis || [],
      });
      setSelectedCategoryId(product.jenis?.[0]?.id || null);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama.trim() || !formData.deskripsi.trim() || formData.harga <= 0) {
      alert('Harap isi semua field yang wajib');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
      
      const productData = {
        ...formData,
        jenis: selectedCategory ? [{ id: selectedCategory.id, nama: selectedCategory.nama }] : [],
      };

      await onEditProduct(productData);
      handleClose();
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nama: '',
      deskripsi: '',
      harga: 0,
      stok: 0,
      status: 'active',
      jenis: [],
    });
    setSelectedCategoryId(null);
    onClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <h3 className="text-xl font-semibold text-gray-900">Edit Produk</h3>
          <button
            onClick={handleClose}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Image Preview */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center flex-shrink-0">
              {product.gambars && product.gambars.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={product.gambars[0].file_path} 
                  alt={product.nama} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <Package className="w-6 h-6 text-orange-600" />
              )}
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium">Current Image</p>
              <p>Image upload akan ditambahkan nanti</p>
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-2">
              Nama Produk *
            </label>
            <input
              type="text"
              id="nama"
              value={formData.nama}
              onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Masukkan nama produk"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi *
            </label>
            <textarea
              id="deskripsi"
              value={formData.deskripsi}
              onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Masukkan deskripsi produk"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Kategori *
            </label>
            <select
              id="category"
              value={selectedCategoryId || ''}
              onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            >
              <option value="">Pilih kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="harga" className="block text-sm font-medium text-gray-700 mb-2">
                Harga *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                <input
                  type="number"
                  id="harga"
                  value={formData.harga}
                  onChange={(e) => setFormData(prev => ({ ...prev, harga: Number(e.target.value) }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
              {formData.harga > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatPrice(formData.harga)}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="stok" className="block text-sm font-medium text-gray-700 mb-2">
                Stok
              </label>
              <input
                type="number"
                id="stok"
                value={formData.stok}
                onChange={(e) => setFormData(prev => ({ ...prev, stok: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}