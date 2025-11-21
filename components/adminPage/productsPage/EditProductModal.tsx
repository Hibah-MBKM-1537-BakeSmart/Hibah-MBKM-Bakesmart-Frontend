'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Package, Settings, Trash2 } from 'lucide-react';
import { Product } from '@/app/contexts/ProductsContext';
import { useCategories } from '@/app/contexts/CategoriesContext';
import { ProductAddonsManager, ProductAddon } from './ProductAddonsManager';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditProduct: (productData: Partial<Product>) => Promise<void>;
  product: Product | null;
}

export function EditProductModal({ isOpen, onClose, onEditProduct, product }: EditProductModalProps) {
  const { categories } = useCategories();
  const [formData, setFormData] = useState({
    nama_id: '',
    nama_en: '',
    deskripsi: '',
    harga: 0,
    stok: 0,
    jenis: [] as Array<{ id: number; nama: string }>,
    hari_tersedia: [] as string[],
    addons: [] as ProductAddon[],
    images: [] as File[],
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddonsManager, setShowAddonsManager] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{ id: number; file_path: string }>>([]);

  const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        nama_id: product.nama_id || product.nama || '',
        nama_en: product.nama_en || product.nama || '',
        deskripsi: product.deskripsi,
        harga: product.harga,
        stok: product.stok,
        jenis: product.jenis || [],
        hari_tersedia: product.hari_tersedia || [],
        addons: product.addons || [],
        images: [],
      });
      setSelectedCategoryId(product.jenis?.[0]?.id || null);
      setExistingImages(product.gambars || []);
      setImagePreviews([]);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama_id.trim() || !formData.nama_en.trim() || !formData.deskripsi.trim() || formData.harga <= 0) {
      alert('Harap isi semua field yang wajib');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
      
      // Combine existing images with new images
      const allImages = [
        ...existingImages.map(img => ({
          id: img.id,
          file_path: img.file_path,
          product_id: product?.id || 0
        })),
        ...formData.images.map((file, index) => ({
          id: Date.now() + index,
          file_path: URL.createObjectURL(file),
          product_id: product?.id || 0
        }))
      ];
      
      const productData = {
        ...formData,
        nama: formData.nama_id, // Keep nama for backward compatibility
        jenis: selectedCategory ? [{ id: selectedCategory.id, nama: selectedCategory.nama }] : [],
        gambars: allImages,
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
      nama_id: '',
      nama_en: '',
      deskripsi: '',
      harga: 0,
      stok: 0,
      jenis: [],
      hari_tersedia: [],
      addons: [],
      images: [],
    });
    setSelectedCategoryId(null);
    setImagePreviews([]);
    setExistingImages([]);
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const totalImages = existingImages.length + formData.images.length + files.length;
    if (totalImages > 5) {
      alert('Maksimal 5 gambar total');
      return;
    }

    const newPreviews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newPreviews.push(event.target.result as string);
          if (newPreviews.length === files.length) {
            setImagePreviews(prev => [...prev, ...newPreviews]);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeNewImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      hari_tersedia: prev.hari_tersedia.includes(day)
        ? prev.hari_tersedia.filter(d => d !== day)
        : [...prev.hari_tersedia, day]
    }));
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
          {/* Product Images Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gambar Produk (Max 5 gambar total)
            </label>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-2">Gambar saat ini:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={`existing-${image.id}`} className="relative group">
                      <img
                        src={image.file_path}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isSubmitting}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Images */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload-edit"
                disabled={isSubmitting || (existingImages.length + formData.images.length) >= 5}
              />
              <label
                htmlFor="image-upload-edit"
                className={`cursor-pointer ${
                  isSubmitting || (existingImages.length + formData.images.length) >= 5 ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Klik untuk upload gambar baru atau drag & drop</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG up to 10MB</p>
                <p className="text-xs text-orange-600 mt-1">
                  {existingImages.length + formData.images.length} / 5 gambar
                </p>
              </label>
            </div>

            {/* New Images Preview */}
            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-600 mb-2">Gambar baru yang akan ditambahkan:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <img
                        src={preview}
                        alt={`New ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-orange-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isSubmitting}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Name - Indonesian */}
          <div>
            <label htmlFor="nama_id" className="block text-sm font-medium text-gray-700 mb-2">
              Nama Produk (Bahasa Indonesia) *
            </label>
            <input
              type="text"
              id="nama_id"
              value={formData.nama_id}
              onChange={(e) => setFormData(prev => ({ ...prev, nama_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Contoh: Roti Cokelat"
              required
            />
          </div>

          {/* Product Name - English */}
          <div>
            <label htmlFor="nama_en" className="block text-sm font-medium text-gray-700 mb-2">
              Nama Produk (English) *
            </label>
            <input
              type="text"
              id="nama_en"
              value={formData.nama_en}
              onChange={(e) => setFormData(prev => ({ ...prev, nama_en: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Example: Chocolate Bread"
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
          <div className="grid grid-cols-1 gap-4">
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
          </div>

          {/* Hari Ketersediaan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Hari Ketersediaan
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    formData.hari_tersedia.includes(day)
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {formData.hari_tersedia.length === 0 
                ? 'Tidak ada hari dipilih (produk tidak tersedia)'
                : `Tersedia di: ${formData.hari_tersedia.join(', ')}`
              }
            </p>
          </div>

          {/* Manage Addons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Addons
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    {formData.addons.length === 0 
                      ? 'No addons configured' 
                      : `${formData.addons.length} addon(s) • ${formData.addons.filter(a => a.is_active).length} active`
                    }
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddonsManager(true)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Manage Addons
                </button>
              </div>
              {formData.addons.length > 0 && (
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {formData.addons.filter(a => a.is_active).slice(0, 3).map((addon) => (
                    <div key={addon.id} className="text-xs text-gray-600 flex items-center justify-between bg-white px-2 py-1 rounded">
                      <span>{addon.nama}</span>
                      <span className="text-gray-500">
                        {addon.harga_tambahan > 0 ? `+Rp ${addon.harga_tambahan.toLocaleString('id-ID')}` : 'Free'}
                      </span>
                    </div>
                  ))}
                  {formData.addons.filter(a => a.is_active).length > 3 && (
                    <p className="text-xs text-gray-500 italic px-2">
                      +{formData.addons.filter(a => a.is_active).length - 3} more active addon(s)
                    </p>
                  )}
                </div>
              )}
            </div>
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

        {/* Product Addons Manager Modal */}
        <ProductAddonsManager
          isOpen={showAddonsManager}
          onClose={() => setShowAddonsManager(false)}
          productName={product?.nama || ''}
          addons={formData.addons}
          onSave={(updatedAddons) => {
            setFormData(prev => ({ ...prev, addons: updatedAddons }));
          }}
        />
      </div>
    </div>
  );
}