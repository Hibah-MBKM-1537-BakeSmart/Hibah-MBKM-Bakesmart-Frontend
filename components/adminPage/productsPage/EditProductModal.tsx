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
    daily_stock: 0,
    ref_sub_jenis_id: null as number | null,
    addons: [] as ProductAddon[],
    images: [] as File[],
    isBestSeller: false,
    isDaily: false,
    ingredients: [] as Array<{
      id?: number;
      nama_id: string;
      nama_en: string;
      jumlah: string;
    }>,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddonsManager, setShowAddonsManager] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<
    Array<{ id: number; file_path: string }>
  >([]);

  // Store initial IDs for change detection (hari removed - comes from sub_jenis)
  const [initialIds, setInitialIds] = useState<{
    sub_jenis: number[];
    attributes: number[];
    ingredients: number[];
  }>({ sub_jenis: [], attributes: [], ingredients: [] });

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

      // Initial IDs from props
      setInitialIds({
        sub_jenis: product.sub_jenis?.map((sj) => sj.id) || [],
        attributes: mappedAddons.map((a) => a.id),
        ingredients: product.bahans?.map((b) => b.id) || [],
      });

      setFormData({
        nama_id: product.nama_id || product.nama || "",
        nama_en: product.nama_en || product.nama || "",
        deskripsi_id: product.deskripsi_id || product.deskripsi || "",
        deskripsi_en: product.deskripsi_en || product.deskripsi || "",
        harga: product.harga,
        harga_diskon: product.harga_diskon || null,
        stok: product.stok || 0,
        daily_stock: product.daily_stock || 0,
        ref_sub_jenis_id: product.sub_jenis?.[0]?.id || null,
        addons: mappedAddons,
        images: [],
        isBestSeller: product.isBestSeller || false,
        isDaily: product.isDaily || false,
        ingredients:
          product.bahans?.map((b) => ({
            id: b.id,
            nama_id: b.nama_id || b.nama || "",
            nama_en: b.nama_en || b.nama || "",
            jumlah: (b.jumlah || 0).toString(),
          })) || [],
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

              // Update initial IDs with fresh data
              setInitialIds((prev) => ({
                sub_jenis:
                  detail.sub_jenis?.map((sj: any) => sj.id) || prev.sub_jenis,
                attributes:
                  detail.attributes?.map((a: any) => a.id) || prev.attributes,
                ingredients:
                  detail.bahans?.map((b: any) => b.id) || prev.ingredients,
              }));

              setFormData((prev) => ({
                ...prev,
                // Update arrays that might be truncated in list view
                ref_sub_jenis_id:
                  detail.sub_jenis?.[0]?.id || prev.ref_sub_jenis_id,
                ingredients:
                  detail.bahans?.map((b: any) => ({
                    id: b.id,
                    nama_id: b.nama_id || b.nama || "",
                    nama_en: b.nama_en || b.nama || "",
                    jumlah: (b.jumlah || 0).toString(),
                  })) || prev.ingredients,
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

    if (!product?.id) {
      alert("Produk tidak ditemukan");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Update Core Product Data
      const { addons, images, ...restFormData } = formData;
      const productData = {
        ...restFormData,
        nama: formData.nama_id, // Keep nama for backward compatibility
        deskripsi: formData.deskripsi_id, // Keep deskripsi for backward compatibility
        // stok removed - backend doesn't need it for update
        ...(formData.isDaily && { daily_stock: formData.daily_stock }),
        // Convert single ref_sub_jenis_id to array for backend
        sub_jenis_ids: formData.ref_sub_jenis_id
          ? [formData.ref_sub_jenis_id]
          : [],
        // hari_ids NOT sent - hari comes from sub_jenis configuration
        harga_diskon: formData.harga_diskon,
        isBestSeller: formData.isBestSeller,
        isDaily: formData.isDaily,
      };

      console.log("🚀 Sending core product data:", productData);
      await onEditProduct(productData);

      const pId = product.id;

      // 2. Sync Attributes (Add-ons) - hari sync removed, comes from sub_jenis
      const currentAttrIds = formData.addons.map((a) => a.id);
      const attrToAdd = currentAttrIds.filter(
        (id) => !initialIds.attributes.includes(id)
      );
      const attrToRemove = initialIds.attributes.filter(
        (id) => !currentAttrIds.includes(id)
      );

      for (const id of attrToAdd)
        await fetch(`/api/products/${pId}/attributes/${id}`, {
          method: "POST",
        });
      for (const id of attrToRemove)
        await fetch(`/api/products/${pId}/attributes/${id}`, {
          method: "DELETE",
        });

      // 5. Sync Ingredients (Bahans)
      const currentIngredientIds = formData.ingredients
        .map((i) => i.id)
        .filter((id) => id !== undefined) as number[];
      const ingredientsToRemove = initialIds.ingredients.filter(
        (id) => !currentIngredientIds.includes(id)
      );

      for (const id of ingredientsToRemove) {
        await fetch(`/api/products/${pId}/bahan/${id}`, { method: "DELETE" });
      }

      for (const ingredient of formData.ingredients) {
        const payload = {
          nama_id: ingredient.nama_id,
          nama_en: ingredient.nama_en,
          jumlah: parseFloat(ingredient.jumlah) || 0,
        };

        if (ingredient.id) {
          // Update
          await fetch(`/api/products/${pId}/bahan/${ingredient.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } else {
          // Add
          await fetch(`/api/products/${pId}/bahan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
      }

      // 6. Sync Images

      // Upload new images
      if (formData.images.length > 0) {
        console.log("🚀 Uploading new images...", formData.images);
        for (const file of formData.images) {
          const imageFormData = new FormData();
          imageFormData.append("file", file);

          try {
            const response = await fetch(`/api/products/${pId}/gambar`, {
              method: "POST",
              body: imageFormData,
            });

            if (!response.ok) {
              const text = await response.text();
              console.error(
                "Failed to upload image. Status:",
                response.status,
                "Response:",
                text
              );
              try {
                const errorData = JSON.parse(text);
                throw new Error(errorData.message || "Failed to upload image");
              } catch (e) {
                throw new Error(
                  `Failed to upload image (Status ${response.status})`
                );
              }
            }
          } catch (uploadError) {
            console.error("Error uploading specific image:", uploadError);
          }
        }
      }

      // Delete removed images
      // Find images that were present initially (or in product prop) but are not in existingImages state
      const currentExistingIds = new Set(existingImages.map((img) => img.id));
      const imagesToDelete = (product.gambars || []).filter(
        (img) => !currentExistingIds.has(img.id)
      );

      for (const img of imagesToDelete) {
        try {
          await fetch(`/api/products/${pId}/gambar/${img.id}`, {
            method: "DELETE",
          });
        } catch (delError) {
          console.error("Error deleting image:", delError);
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
      daily_stock: 0,
      ref_sub_jenis_id: null,
      addons: [],
      images: [],
      isBestSeller: false,
      isDaily: false,
      ingredients: [],
    });
    setImagePreviews([]);
    setExistingImages([]);
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const totalImages =
      existingImages.length + formData.images.length + files.length;
    if (totalImages > 1) {
      alert(
        "Maksimal 1 gambar total. Hapus gambar lama terlebih dahulu jika ingin mengganti."
      );
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

  const handleAddIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { nama_id: "", nama_en: "", jumlah: "" },
      ],
    }));
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleIngredientChange = (
    index: number,
    field: "nama_id" | "nama_en" | "jumlah",
    value: string
  ) => {
    setFormData((prev) => {
      const newIngredients = [...prev.ingredients];
      newIngredients[index] = { ...newIngredients[index], [field]: value };
      return { ...prev, ingredients: newIngredients };
    });
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
              Gambar Produk (Max 1 gambar)
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
                  existingImages.length + formData.images.length >= 1
                }
              />
              <label
                htmlFor="image-upload-edit"
                className={`cursor-pointer ${
                  isSubmitting ||
                  existingImages.length + formData.images.length >= 1
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
                  {existingImages.length + formData.images.length} / 1 gambar
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

          {/* Sub Jenis Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Layers className="w-4 h-4 inline mr-2 text-blue-500" />
              Sub Jenis (Kategori) *
            </label>
            <select
              name="ref_sub_jenis_id"
              value={formData.ref_sub_jenis_id || ""}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  ref_sub_jenis_id: e.target.value
                    ? Number(e.target.value)
                    : null,
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            >
              <option value="">Pilih Sub Jenis...</option>
              {jenisList.map((jenis) => (
                <optgroup key={jenis.id} label={jenis.nama_id}>
                  {getSubJenisByJenisId(jenis.id).map((subJenis) => (
                    <option key={subJenis.id} value={subJenis.id}>
                      {subJenis.nama_id} ({subJenis.nama_en})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Produk akan terkait dengan sub jenis yang dipilih
            </p>
          </div>

          {/* Ingredients (Bahan) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Layers className="w-4 h-4 mr-2 text-green-500" />
                Bahan (Ingredients)
              </label>
              <button
                type="button"
                onClick={handleAddIngredient}
                disabled={isSubmitting}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                + Tambah Bahan
              </button>
            </div>

            {formData.ingredients.length === 0 ? (
              <p className="text-sm text-gray-500 italic border rounded-lg p-3 text-center">
                Belum ada bahan ditambahkan
              </p>
            ) : (
              <div className="space-y-3">
                {formData.ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-2 p-3 border rounded-lg bg-gray-50"
                  >
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Nama Bahan (ID)"
                          value={ingredient.nama_id}
                          onChange={(e) =>
                            handleIngredientChange(
                              index,
                              "nama_id",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 text-sm border rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Ingredient Name (EN)"
                          value={ingredient.nama_en}
                          onChange={(e) =>
                            handleIngredientChange(
                              index,
                              "nama_en",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 text-sm border rounded"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="w-24">
                        <input
                          type="number"
                          placeholder="Jml"
                          value={ingredient.jumlah}
                          onChange={(e) =>
                            handleIngredientChange(
                              index,
                              "jumlah",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 text-sm border rounded"
                          min="0"
                          step="0.1"
                        />
                      </div>
                      <span className="text-xs text-gray-500 flex-1">
                        Unit/Jumlah
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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

          {/* Price and Daily Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {formData.isDaily && (
              <div>
                <label
                  htmlFor="daily_stock"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Daily Stock *
                </label>
                <input
                  type="number"
                  id="daily_stock"
                  value={formData.daily_stock || ""}
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                    setFormData((prev) => ({
                      ...prev,
                      daily_stock: isNaN(value) ? 0 : value,
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="50"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Stok harian yang akan di-reset setiap hari
                </p>
              </div>
            )}
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
