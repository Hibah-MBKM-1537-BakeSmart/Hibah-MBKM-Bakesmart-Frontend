"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, Settings, Trash2, Tag, Layers } from "lucide-react";
import { Product } from "@/app/contexts/ProductsContext";
import { useJenis } from "@/app/contexts/JenisContext";
import { useSubJenis } from "@/app/contexts/SubJenisContext";
import { ProductAddonsManager, ProductAddon } from "./ProductAddonsManager";

import { getImageUrl, BACKEND_URL } from "@/lib/utils";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditProduct: (productData: Partial<Product>) => Promise<void>;
  product: Product | null;
}

export function EditProductModal({
  isOpen,
  onClose,
  onEditProduct,
  product,
}: EditProductModalProps) {
  const { jenisList } = useJenis();
  const { subJenisList, getSubJenisByJenisId } = useSubJenis();
  const [formData, setFormData] = useState({
    nama_id: "",
    nama_en: "",
    deskripsi_id: "",
    deskripsi_en: "",
    harga: 0,
    harga_diskon: null as number | null,
    stok: 0,
    jenis_id: null as number | null,
    sub_jenis_ids: [] as number[],
    hari_ids: [] as number[],
    addons: [] as ProductAddon[],
    images: [] as File[],
    isBestSeller: false,
    isDaily: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddonsManager, setShowAddonsManager] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<
    Array<{ id: number; file_path: string }>
  >([]);
  const [availableHari, setAvailableHari] = useState<
    Array<{ id: number; nama_id: string; nama_en: string }>
  >([]);

  // Fetch available hari from backend (jenis/sub_jenis now from context)
  useEffect(() => {
    const fetchHari = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();

        if (data.data && Array.isArray(data.data)) {
          const hariMap = new Map<
            number,
            { id: number; nama_id: string; nama_en: string }
          >();

          data.data.forEach((prod: any) => {
            prod.hari?.forEach((h: any) => {
              if (h.id && h.nama_id) {
                hariMap.set(h.id, {
                  id: h.id,
                  nama_id: h.nama_id,
                  nama_en: h.nama_en || h.nama_id,
                });
              }
            });
          });

          setAvailableHari(
            Array.from(hariMap.values()).sort((a, b) => a.id - b.id)
          );
          console.log(
            "📅 Available Hari loaded:",
            Array.from(hariMap.values()).sort((a, b) => a.id - b.id)
          );
        }
      } catch (error) {
        console.error("Error fetching hari:", error);
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
      const validSubJenisIds = getSubJenisByJenisId(formData.jenis_id).map(
        (sj) => sj.id
      );
      setFormData((prev) => ({
        ...prev,
        sub_jenis_ids: prev.sub_jenis_ids.filter((id) =>
          validSubJenisIds.includes(id)
        ),
      }));
    }
  }, [formData.jenis_id, getSubJenisByJenisId]);

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      // Map attributes to ProductAddon format
      const mappedAddons: ProductAddon[] = (product.attributes || []).map(
        (attr) => ({
          id: attr.id,
          nama_id: attr.nama_id || attr.nama || "",
          nama_en: attr.nama_en || attr.nama || "",
          nama: attr.nama,
          harga: attr.harga || 0,
        })
      );

      setFormData({
        nama_id: product.nama_id || product.nama || "",
        nama_en: product.nama_en || product.nama || "",
        deskripsi_id: product.deskripsi_id || product.deskripsi || "",
        deskripsi_en: product.deskripsi_en || product.deskripsi || "",
        harga: product.harga,
        harga_diskon: product.harga_diskon || null,
        stok: product.stok,
        jenis_id: product.jenis?.[0]?.id || null,
        sub_jenis_ids: product.sub_jenis?.map((sj) => sj.id) || [],
        hari_ids: product.hari?.map((h) => h.id) || [],
        addons: mappedAddons,
        images: [],
        isBestSeller: product.isBestSeller || false,
        isDaily: product.isDaily || false,
      });
      setExistingImages(product.gambars || []);
      setImagePreviews([]);

      // Fetch fresh details from API to ensure we have complete data (especially many-to-many arrays like hari)
      const fetchProductDetails = async () => {
        try {
          const response = await fetch(`/api/products/${product.id}`);
          if (response.ok) {
            const result = await response.json();
            const detail = result.data || result;

            // If we got valid detail data, update the form
            if (detail) {
              console.log("📦 Fetched fresh product detail:", detail);
              setFormData((prev) => ({
                ...prev,
                // Update arrays that might be truncated in list view
                sub_jenis_ids:
                  detail.sub_jenis?.map((sj: any) => sj.id) ||
                  prev.sub_jenis_ids,
                hari_ids: detail.hari?.map((h: any) => h.id) || prev.hari_ids,
              }));
              // Also update images if needed
              if (detail.gambars) {
                setExistingImages(detail.gambars);
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch product details:", error);
        }
      };

      fetchProductDetails();
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.nama_id.trim() ||
      !formData.nama_en.trim() ||
      !formData.deskripsi_id.trim() ||
      !formData.deskripsi_en.trim() ||
      formData.harga <= 0
    ) {
      alert("Harap isi semua field yang wajib");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Prepare JSON Payload (Without new blob images)
      // Only send existing images to maintain state (deletions are handled by omitting removed images)
      const cleanImages = existingImages.map((img) => ({
        id: img.id,
        file_path: img.file_path,
        product_id: product?.id || 0,
      }));

      // Exclude addons from spread since we send attribute_ids instead
      const { addons, ...restFormData } = formData;

      const productData = {
        ...restFormData,
        nama: formData.nama_id, // Keep nama for backward compatibility
        deskripsi: formData.deskripsi_id, // Keep deskripsi for backward compatibility
        jenis_id: formData.jenis_id,
        sub_jenis_ids: formData.sub_jenis_ids,
        hari_ids: formData.hari_ids,
        harga_diskon: formData.harga_diskon,
        isBestSeller: formData.isBestSeller,
        isDaily: formData.isDaily,
        attribute_ids: addons.map((a) => a.id), // Send attribute IDs to backend
        gambars: cleanImages, // Only existing images
      };

      console.log("🚀 Sending product text data to backend:", productData);
      
      // Step 1: Update Text Data
      await onEditProduct(productData);

      // Step 2: Upload New Images
      if (formData.images.length > 0 && product?.id) {
        console.log("🚀 Uploading new images...", formData.images);
        // Upload each file individually
        for (const file of formData.images) {
          const imageFormData = new FormData();
          imageFormData.append('file', file);

          try {
            const response = await fetch(`${BACKEND_URL}/products/${product.id}/gambar`, {
              method: 'POST',
              body: imageFormData,
              // Content-Type header is automatically set by browser with boundary
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              console.error("Failed to upload image:", errorData);
              throw new Error(errorData.message || "Failed to upload image");
            }
            console.log("✅ Image uploaded successfully");
          } catch (uploadError) {
             console.error("Error uploading specific image:", uploadError);
          }
        }
      }

      handleClose();
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Gagal mengupdate produk. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nama_id: "",
      nama_en: "",
      deskripsi_id: "",
      deskripsi_en: "",
      harga: 0,
      harga_diskon: null,
      stok: 0,
      jenis_id: null,
      sub_jenis_ids: [],
      hari_ids: [],
      addons: [],
      images: [],
      isBestSeller: false,
      isDaily: false,
    });
    setImagePreviews([]);
    setExistingImages([]);
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const totalImages =
      existingImages.length + formData.images.length + files.length;
    if (totalImages > 5) {
      alert("Maksimal 5 gambar total");
      return;
    }

    const newPreviews: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newPreviews.push(event.target.result as string);
          if (newPreviews.length === files.length) {
            setImagePreviews((prev) => [...prev, ...newPreviews]);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeNewImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleHari = (hariId: number) => {
    console.log("🔵 toggleHari called with ID:", hariId);
    console.log("🔵 Current hari_ids:", formData.hari_ids);

    setFormData((prev) => {
      const newHariIds = prev.hari_ids.includes(hariId)
        ? prev.hari_ids.filter((id) => id !== hariId)
        : [...prev.hari_ids, hariId];

      console.log("🔵 New hari_ids:", newHariIds);

      return {
        ...prev,
        hari_ids: newHariIds,
      };
    });
  };

  const selectJenis = (jenisId: number) => {
    setFormData((prev) => ({
      ...prev,
      jenis_id: prev.jenis_id === jenisId ? null : jenisId,
    }));
  };

  const toggleSubJenis = (subJenisId: number) => {
    setFormData((prev) => ({
      ...prev,
      sub_jenis_ids: prev.sub_jenis_ids.includes(subJenisId)
        ? prev.sub_jenis_ids.filter((id) => id !== subJenisId)
        : [...prev.sub_jenis_ids, subJenisId],
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
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
                    <div
                      key={`existing-${image.id}`}
                      className="relative group"
                    >
                      <img
                        src={getImageUrl(image.file_path)}
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
                disabled={
                  isSubmitting ||
                  existingImages.length + formData.images.length >= 5
                }
              />
              <label
                htmlFor="image-upload-edit"
                className={`cursor-pointer ${
                  isSubmitting ||
                  existingImages.length + formData.images.length >= 5
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Klik untuk upload gambar baru atau drag & drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, JPEG up to 10MB
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  {existingImages.length + formData.images.length} / 5 gambar
                </p>
              </label>
            </div>

            {/* New Images Preview */}
            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-600 mb-2">
                  Gambar baru yang akan ditambahkan:
                </p>
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
            <label
              htmlFor="nama_id"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nama Produk (Bahasa Indonesia) *
            </label>
            <input
              type="text"
              id="nama_id"
              value={formData.nama_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nama_id: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Contoh: Roti Cokelat"
              required
            />
          </div>

          {/* Product Name - English */}
          <div>
            <label
              htmlFor="nama_en"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nama Produk (English) *
            </label>
            <input
              type="text"
              id="nama_en"
              value={formData.nama_en}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nama_en: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Example: Chocolate Bread"
              required
            />
          </div>

          {/* Description - Indonesian */}
          <div>
            <label
              htmlFor="deskripsi_id"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Deskripsi Produk (Bahasa Indonesia) *
            </label>
            <textarea
              id="deskripsi_id"
              value={formData.deskripsi_id}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  deskripsi_id: e.target.value,
                }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Masukkan deskripsi produk dalam Bahasa Indonesia"
              required
            />
          </div>

          {/* Description - English */}
          <div>
            <label
              htmlFor="deskripsi_en"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Deskripsi Produk (English) *
            </label>
            <textarea
              id="deskripsi_en"
              value={formData.deskripsi_en}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  deskripsi_en: e.target.value,
                }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Enter product description in English"
              required
            />
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    formData.jenis_id === jenis.id
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {jenis.nama_id}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {!formData.jenis_id
                ? "Belum ada jenis dipilih"
                : `1 jenis terpilih`}
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
                <p className="text-sm text-gray-500 italic">
                  Tidak ada sub jenis untuk kategori ini
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {getSubJenisByJenisId(formData.jenis_id).map((subJenis) => (
                    <button
                      key={subJenis.id}
                      type="button"
                      onClick={() => toggleSubJenis(subJenis.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        formData.sub_jenis_ids.includes(subJenis.id)
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {subJenis.nama_id}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {formData.sub_jenis_ids.length === 0
                  ? "Tidak ada sub jenis dipilih"
                  : `${formData.sub_jenis_ids.length} sub jenis terpilih`}
              </p>
            </div>
          )}

          {/* Best Seller & Daily Options */}
          <div className="flex gap-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isBestSeller}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isBestSeller: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-700">Best Seller</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isDaily}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isDaily: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-700">Produk Harian</span>
            </label>
          </div>

          {/* Harga Diskon */}
          <div>
            <label
              htmlFor="harga_diskon"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Harga Diskon (Opsional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                Rp
              </span>
              <input
                type="number"
                id="harga_diskon"
                value={formData.harga_diskon || ""}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? null : parseInt(e.target.value, 10);
                  setFormData((prev) => ({ ...prev, harga_diskon: value }));
                }}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="0"
                min="0"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Kosongkan jika tidak ada diskon
            </p>
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label
                htmlFor="harga"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Harga *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  Rp
                </span>
                <input
                  type="number"
                  id="harga"
                  value={formData.harga || ""}
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                    setFormData((prev) => ({
                      ...prev,
                      harga: isNaN(value) ? 0 : value,
                    }));
                  }}
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
              {availableHari.map((hari) => (
                <button
                  key={hari.id}
                  type="button"
                  onClick={() => toggleHari(hari.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    formData.hari_ids.includes(hari.id)
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {hari.nama_id}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {formData.hari_ids.length === 0
                ? "Tidak ada hari dipilih (produk tidak tersedia)"
                : `Tersedia di ${formData.hari_ids.length} hari`}
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
                      ? "No addons configured"
                      : `${formData.addons.length} addon(s)`}
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
                  {formData.addons.slice(0, 3).map((addon) => (
                    <div
                      key={addon.id}
                      className="text-xs text-gray-600 flex items-center justify-between bg-white px-2 py-1 rounded"
                    >
                      <span>{addon.nama_id || addon.nama || "Unnamed"}</span>
                      <span className="text-gray-500">
                        {addon.harga > 0
                          ? `+Rp ${addon.harga.toLocaleString("id-ID")}`
                          : "Gratis"}
                      </span>
                    </div>
                  ))}
                  {formData.addons.length > 3 && (
                    <p className="text-xs text-gray-500 italic px-2">
                      +{formData.addons.length - 3} more addon(s)
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
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>

        {/* Product Addons Manager Modal */}
        <ProductAddonsManager
          isOpen={showAddonsManager}
          onClose={() => setShowAddonsManager(false)}
          productName={product?.nama || ""}
          addons={formData.addons}
          onSave={(updatedAddons) => {
            setFormData((prev) => ({ ...prev, addons: updatedAddons }));
          }}
        />
      </div>
    </div>
  );
}
