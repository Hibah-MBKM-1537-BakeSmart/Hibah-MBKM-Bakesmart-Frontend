'use client';

import React, { useState } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { useCategories } from '../../../app/contexts/CategoriesContext';

interface Product {
  id: number;
  nama: string;
  deskripsi: string;
  harga: number;
  stok: number;
  created_at: string;
  updated_at: string;
  gambars?: Array<{
    id: number;
    file_path: string;
    product_id: number;
  }>;
  jenis?: Array<{
    id: number;
    nama: string;
  }>;
  sales?: number;
  rating?: number;
  status: 'active' | 'inactive';
  hari_tersedia?: string[];
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'sales' | 'rating'>) => void;
}

interface FormData {
  nama: string;
  deskripsi: string;
  harga: string;
  stok: string;
  kategori: string;
  status: 'active' | 'inactive';
  images: File[];
  hari_tersedia: string[];
}

export function AddProductModal({ isOpen, onClose, onAddProduct }: AddProductModalProps) {
  const { categories: contextCategories } = useCategories();
  const [formData, setFormData] = useState<FormData>({
    nama: '',
    deskripsi: '',
    harga: '',
    stok: '',
    kategori: '',
    status: 'active',
    images: [],
    hari_tersedia: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + formData.images.length > 5) {
      setErrors(prev => ({ ...prev, images: 'Maksimal 5 gambar' }));
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
    setErrors(prev => ({ ...prev, images: '' }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      hari_tersedia: prev.hari_tersedia.includes(day)
        ? prev.hari_tersedia.filter(d => d !== day)
        : [...prev.hari_tersedia, day]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama produk harus diisi';
    }
    if (!formData.deskripsi.trim()) {
      newErrors.deskripsi = 'Deskripsi harus diisi';
    }
    if (!formData.harga || parseFloat(formData.harga) <= 0) {
      newErrors.harga = 'Harga harus lebih dari 0';
    }
    if (!formData.stok || parseInt(formData.stok) < 0) {
      newErrors.stok = 'Stok tidak boleh negatif';
    }
    if (!formData.kategori) {
      newErrors.kategori = 'Kategori harus dipilih';
    }
    if (formData.images.length === 0) {
      newErrors.images = 'Minimal 1 gambar produk';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const selectedCategory = contextCategories.find(cat => cat.nama === formData.kategori);
      
      const newProduct = {
        nama: formData.nama,
        deskripsi: formData.deskripsi,
        harga: parseFloat(formData.harga),
        stok: parseInt(formData.stok),
        status: formData.status,
        jenis: selectedCategory ? [selectedCategory] : [],
        hari_tersedia: formData.hari_tersedia,
        gambars: formData.images.map((file, index) => ({
          id: Date.now() + index,
          file_path: URL.createObjectURL(file),
          product_id: Date.now()
        }))
      };

      onAddProduct(newProduct);
      resetForm();
      
    } catch (error) {
      console.error('Error adding product:', error);
      setErrors({ submit: 'Gagal menambah produk. Silakan coba lagi.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nama: '',
      deskripsi: '',
      harga: '',
      stok: '',
      kategori: '',
      status: 'active',
      images: [],
      hari_tersedia: []
    });
    setImagePreviews([]);
    setErrors({});
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      {/* Modal positioned in center */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl border border-gray-300" style={{ maxHeight: '80vh' }}>
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white rounded-t-lg">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Tambah Produk Baru</h2>
              <p className="text-sm text-gray-600 mt-1">Lengkapi informasi produk yang ingin ditambahkan</p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              type="button"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Scrollable content */}
            <div className="p-6 overflow-y-auto bg-white" style={{ maxHeight: 'calc(80vh - 160px)' }}>
              <div className="space-y-6">
                
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Produk *</label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    placeholder="Contoh: Chocolate Cake"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.nama ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.nama && <p className="mt-1 text-sm text-red-600">{errors.nama}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi *</label>
                  <textarea
                    name="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Deskripsikan produk Anda..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.deskripsi ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.deskripsi && <p className="mt-1 text-sm text-red-600">{errors.deskripsi}</p>}
                </div>

                {/* Price and Stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Harga (IDR) *</label>
                    <input
                      type="number"
                      name="harga"
                      value={formData.harga}
                      onChange={handleInputChange}
                      placeholder="125000"
                      min="0"
                      step="1000"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.harga ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.harga && <p className="mt-1 text-sm text-red-600">{errors.harga}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stok *</label>
                    <input
                      type="number"
                      name="stok"
                      value={formData.stok}
                      onChange={handleInputChange}
                      placeholder="15"
                      min="0"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.stok ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.stok && <p className="mt-1 text-sm text-red-600">{errors.stok}</p>}
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
                        disabled={isSubmitting}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                          formData.hari_tersedia.includes(day)
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
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

                {/* Category and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kategori *</label>
                    <select
                      name="kategori"
                      value={formData.kategori}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.kategori ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting}
                    >
                      <option value="">Pilih Kategori</option>
                      {contextCategories.map(category => (
                        <option key={category.id} value={category.nama}>{category.nama}</option>
                      ))}
                    </select>
                    {errors.kategori && <p className="mt-1 text-sm text-red-600">{errors.kategori}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      disabled={isSubmitting}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Images Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Produk * (Max 5 gambar)</label>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={isSubmitting || formData.images.length >= 5}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`cursor-pointer ${
                        isSubmitting || formData.images.length >= 5 ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Klik untuk upload gambar atau drag & drop</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG up to 10MB</p>
                    </label>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={isSubmitting}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
                </div>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Footer dengan tombol yang jelas terlihat */}
            <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-8 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 text-sm font-medium text-white bg-orange-500 border-2 border-orange-500 rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-600 disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Tambah Produk</span>
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