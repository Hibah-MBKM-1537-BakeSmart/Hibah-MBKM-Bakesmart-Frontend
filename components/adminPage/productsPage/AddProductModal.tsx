'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Tag, Layers } from 'lucide-react';
import { useJenis } from '../../../app/contexts/JenisContext';
import { useSubJenis } from '../../../app/contexts/SubJenisContext';

interface Product {
  id: number;
  nama: string;
  nama_id?: string;
  nama_en?: string;
  deskripsi: string;
  deskripsi_id?: string;
  deskripsi_en?: string;
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
  onAddProduct: (product: Partial<Product>) => void;
}

interface FormData {
  nama_id: string;
  nama_en: string;
  deskripsi_id: string;
  deskripsi_en: string;
  harga: string;
  harga_diskon: string;
  stok: string;
  jenis_id: number | null; // Single kategori roti selection
  sub_jenis_ids: number[]; // Sub jenis multi-select
  images: File[];
  hari_ids: number[]; // Changed from hari_tersedia to hari_ids array
  isBestSeller: boolean;
  isDaily: boolean;
}

export function AddProductModal({ isOpen, onClose, onAddProduct }: AddProductModalProps) {
  const { jenisList } = useJenis();
  const { subJenisList, getSubJenisByJenisId } = useSubJenis();
  const [formData, setFormData] = useState<FormData>({
    nama_id: '',
    nama_en: '',
    deskripsi_id: '',
    deskripsi_en: '',
    harga: '',
    harga_diskon: '',
    stok: '',
    jenis_id: null,
    sub_jenis_ids: [],
    images: [],
    hari_ids: [],
    isBestSeller: false,
    isDaily: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [availableHari, setAvailableHari] = useState<Array<{id: number, nama_id: string, nama_en: string}>>([]);

  // Fetch available hari from backend (jenis/sub_jenis now from context)
  useEffect(() => {
    const fetchHari = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        
        if (data.data && Array.isArray(data.data)) {
          const hariMap = new Map<number, {id: number, nama_id: string, nama_en: string}>();
          
          data.data.forEach((product: any) => {
            product.hari?.forEach((h: any) => {
              if (h.id && h.nama_id) {
                hariMap.set(h.id, {id: h.id, nama_id: h.nama_id, nama_en: h.nama_en || h.nama_id});
              }
            });
          });
          
          setAvailableHari(Array.from(hariMap.values()).sort((a, b) => a.id - b.id));
        }
      } catch (error) {
        console.error('Error fetching hari:', error);
      }
    };
    
    if (isOpen) {
      fetchHari();
    }
  }, [isOpen]);

  // Reset sub_jenis when jenis changes
  useEffect(() => {
    if (formData.jenis_id) {
      // Keep only sub_jenis that belong to selected jenis
      const validSubJenisIds = getSubJenisByJenisId(formData.jenis_id).map(sj => sj.id);
      setFormData(prev => ({
        ...prev,
        sub_jenis_ids: prev.sub_jenis_ids.filter(id => validSubJenisIds.includes(id))
      }));
    } else {
      setFormData(prev => ({ ...prev, sub_jenis_ids: [] }));
    }
  }, [formData.jenis_id, getSubJenisByJenisId]);

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

  const toggleHari = (hariId: number) => {
    setFormData(prev => ({
      ...prev,
      hari_ids: prev.hari_ids.includes(hariId)
        ? prev.hari_ids.filter(id => id !== hariId)
        : [...prev.hari_ids, hariId]
    }));
  };

  const selectJenis = (jenisId: number) => {
    setFormData(prev => ({
      ...prev,
      jenis_id: prev.jenis_id === jenisId ? null : jenisId // Toggle or select single
    }));
  };

  const toggleSubJenis = (subJenisId: number) => {
    setFormData(prev => ({
      ...prev,
      sub_jenis_ids: prev.sub_jenis_ids.includes(subJenisId)
        ? prev.sub_jenis_ids.filter(id => id !== subJenisId)
        : [...prev.sub_jenis_ids, subJenisId]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama_id.trim()) {
      newErrors.nama_id = 'Nama produk (ID) harus diisi';
    }
    if (!formData.nama_en.trim()) {
      newErrors.nama_en = 'Nama produk (EN) harus diisi';
    }
    if (!formData.deskripsi_id.trim()) {
      newErrors.deskripsi_id = 'Deskripsi (ID) harus diisi';
    }
    if (!formData.deskripsi_en.trim()) {
      newErrors.deskripsi_en = 'Deskripsi (EN) harus diisi';
    }
    if (!formData.harga || parseFloat(formData.harga) <= 0) {
      newErrors.harga = 'Harga harus lebih dari 0';
    }
    if (!formData.stok || parseInt(formData.stok) < 0) {
      newErrors.stok = 'Stok tidak boleh negatif';
    }
    if (!formData.jenis_id) {
      newErrors.jenis_id = 'Kategori roti harus dipilih';
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

      const newProduct = {
        nama_id: formData.nama_id,
        nama_en: formData.nama_en,
        nama: formData.nama_id, // Keep nama for backward compatibility
        deskripsi_id: formData.deskripsi_id,
        deskripsi_en: formData.deskripsi_en,
        deskripsi: formData.deskripsi_id, // Keep deskripsi for backward compatibility
        harga: parseFloat(formData.harga),
        harga_diskon: formData.harga_diskon ? parseFloat(formData.harga_diskon) : null,
        stok: parseInt(formData.stok),
        jenis_id: formData.jenis_id, // Send single jenis_id
        sub_jenis_ids: formData.sub_jenis_ids, // Send sub_jenis_ids array
        hari_ids: formData.hari_ids, // Send hari_ids array
        isBestSeller: formData.isBestSeller,
        isDaily: formData.isDaily,
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
      nama_id: '',
      nama_en: '',
      deskripsi_id: '',
      deskripsi_en: '',
      harga: '',
      harga_diskon: '',
      stok: '',
      jenis_id: null,
      sub_jenis_ids: [],
      images: [],
      hari_ids: [],
      isBestSeller: false,
      isDaily: false
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
                
                {/* Product Name - Indonesian */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Produk (Bahasa Indonesia) *</label>
                  <input
                    type="text"
                    name="nama_id"
                    value={formData.nama_id}
                    onChange={handleInputChange}
                    placeholder="Contoh: Roti Cokelat"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.nama_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.nama_id && <p className="mt-1 text-sm text-red-600">{errors.nama_id}</p>}
                </div>

                {/* Product Name - English */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Produk (English) *</label>
                  <input
                    type="text"
                    name="nama_en"
                    value={formData.nama_en}
                    onChange={handleInputChange}
                    placeholder="Example: Chocolate Bread"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.nama_en ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.nama_en && <p className="mt-1 text-sm text-red-600">{errors.nama_en}</p>}
                </div>

                {/* Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Produk (Bahasa Indonesia) *</label>
                    <textarea
                      name="deskripsi_id"
                      value={formData.deskripsi_id}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Masukkan deskripsi produk dalam Bahasa Indonesia"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.deskripsi_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.deskripsi_id && <p className="mt-1 text-sm text-red-600">{errors.deskripsi_id}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Produk (English) *</label>
                    <textarea
                      name="deskripsi_en"
                      value={formData.deskripsi_en}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Enter product description in English"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.deskripsi_en ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.deskripsi_en && <p className="mt-1 text-sm text-red-600">{errors.deskripsi_en}</p>}
                  </div>
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
                    {availableHari.map((hari) => (
                      <button
                        key={hari.id}
                        type="button"
                        onClick={() => toggleHari(hari.id)}
                        disabled={isSubmitting}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                          formData.hari_ids.includes(hari.id)
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {hari.nama_id}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.hari_ids.length === 0 
                      ? 'Tidak ada hari dipilih (produk tidak tersedia)'
                      : `Tersedia di ${formData.hari_ids.length} hari`
                    }
                  </p>
                </div>

                {/* Kategori Roti (Jenis) */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                    <Tag className="w-4 h-4 mr-2 text-orange-500" />
                    Jenis (Kategori) * (Pilih 1)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {jenisList.map((jenis) => (
                      <button
                        key={jenis.id}
                        type="button"
                        onClick={() => selectJenis(jenis.id)}
                        disabled={isSubmitting}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                          formData.jenis_id === jenis.id
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {jenis.nama_id}
                      </button>
                    ))}
                  </div>
                  {errors.jenis_id && <p className="mt-2 text-sm text-red-600">{errors.jenis_id}</p>}
                  <p className="text-xs text-gray-500 mt-2">
                    {!formData.jenis_id
                      ? 'Belum ada jenis dipilih'
                      : `1 jenis terpilih`
                    }
                  </p>
                </div>

                {/* Sub Jenis */}
                {formData.jenis_id && (
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                      <Layers className="w-4 h-4 mr-2 text-blue-500" />
                      Sub Jenis (Opsional)
                    </label>
                    {getSubJenisByJenisId(formData.jenis_id).length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Tidak ada sub jenis untuk kategori ini</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {getSubJenisByJenisId(formData.jenis_id).map((subJenis) => (
                          <button
                            key={subJenis.id}
                            type="button"
                            onClick={() => toggleSubJenis(subJenis.id)}
                            disabled={isSubmitting}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                              formData.sub_jenis_ids.includes(subJenis.id)
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {subJenis.nama_id}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {formData.sub_jenis_ids.length === 0
                        ? 'Tidak ada sub jenis dipilih'
                        : `${formData.sub_jenis_ids.length} sub jenis terpilih`
                      }
                    </p>
                  </div>
                )}

                {/* Best Seller & Daily Options */}
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isBestSeller}
                      onChange={(e) => setFormData(prev => ({ ...prev, isBestSeller: e.target.checked }))}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                      disabled={isSubmitting}
                    />
                    <span className="ml-2 text-sm text-gray-700">Best Seller</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDaily}
                      onChange={(e) => setFormData(prev => ({ ...prev, isDaily: e.target.checked }))}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                      disabled={isSubmitting}
                    />
                    <span className="ml-2 text-sm text-gray-700">Produk Harian</span>
                  </label>
                </div>

                {/* Harga Diskon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Harga Diskon (Opsional)</label>
                  <input
                    type="number"
                    name="harga_diskon"
                    value={formData.harga_diskon}
                    onChange={handleInputChange}
                    placeholder="100000"
                    min="0"
                    step="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">Kosongkan jika tidak ada diskon</p>
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