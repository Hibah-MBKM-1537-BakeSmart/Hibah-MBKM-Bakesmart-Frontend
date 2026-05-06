"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, Plus, Trash2, Layers, Save, Tag, Package } from "lucide-react";
import { useJenis } from "../../../../app/contexts/JenisContext";
import { useSubJenis } from "../../../../app/contexts/SubJenisContext";
import { Bahan, FormProduct, Product } from "@/app/contexts/ProductCrud";
import { useProducts } from "@/app/contexts/ProductsContext";
import { useAppAlert } from "@/components/AppAlert";
import { getImageUrl } from "@/lib/utils";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onEditProduct: (data: FormProduct) => Promise<Product | null>;
}

export interface FormData {
  nama_id: string;
  nama_en: string;
  deskripsi_id: string;
  deskripsi_en: string;
  calc_count: number;
  harga: string;
  harga_diskon: string;
  daily_stock: string;
  ref_sub_jenis_id: number;
  gambars: File[];
  isBestSeller: boolean;
  isDaily: boolean;
  bahans: Partial<Bahan>[];
}

export function EditProductModal({ isOpen, onClose, product, onEditProduct }: EditProductModalProps) {
  const { list: jenisList } = useJenis();
  const { getSubJenisByJenisId } = useSubJenis();
  const {
    fetchProduct,
    appendBahanToProduct,
    removeBahanFromProduct,
    appendGambarToProduct,
    removeGambarFromProduct,
  } = useProducts();
  const { error } = useAppAlert();

  const [formData, setFormData] = useState<FormData>({
    nama_id: "", nama_en: "", deskripsi_id: "", deskripsi_en: "",
    calc_count: 0, harga: "", harga_diskon: "", daily_stock: "",
    ref_sub_jenis_id: 0, gambars: [], isBestSeller: false, isDaily: false, bahans: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{ id: number; file_path: string }>>([]);
  const [removedExistingImageIds, setRemovedExistingImageIds] = useState<number[]>([]);

  // ── Bahan master list ────────────────────────────────────────────────────
  const [availableBahans, setAvailableBahans] = useState<Bahan[]>([]);

  // ── Bahan form state ─────────────────────────────────────────────────────
  const [showBahanForm, setShowBahanForm] = useState(false);
  const [bahanInputMode, setBahanInputMode] = useState<"select" | "manual">("select");

  // Select mode
  const [selectedBahanId, setSelectedBahanId] = useState<number | "">("");
  const [selectedBahanJumlah, setSelectedBahanJumlah] = useState<string>("");

  // Manual mode
  const [newBahanNameId, setNewBahanNameId] = useState("");
  const [newBahanNameEn, setNewBahanNameEn] = useState("");
  const [newBahanJumlah, setNewBahanJumlah] = useState<string>("");

  const normalizeNumericInput = (raw: string): string => {
    const value = raw.replace(/,/g, ".");
    if (value === "") return "";
    if (value === ".") return "0.";

    const parts = value.split(".");
    const intPart = parts[0] ?? "";
    const fracPart = parts.length > 1 ? parts.slice(1).join(".") : undefined;

    const normalizedInt = intPart.replace(/^0+(?=\d)/, "");

    if (fracPart !== undefined) {
      const intFinal = normalizedInt === "" ? "0" : normalizedInt;
      return `${intFinal}.${fracPart}`;
    }

    return normalizedInt === "" ? "0" : normalizedInt;
  };

  // ── Fetch bahan master ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchBahans = async () => {
      try {
        const res = await fetch("/api/bahan");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setAvailableBahans(data.data ?? []);
      } catch (err) {
        console.error("Failed to fetch bahans:", err);
      }
    };
    fetchBahans();
  }, []);

  // ── Populate form when product changes ───────────────────────────────────
  useEffect(() => {
    if (product && isOpen) {
      // console.log("Populating form for product:", product);
      setFormData({
        nama_id: product.nama_id ?? "",
        nama_en: product.nama_en ?? "",
        deskripsi_id: product.deskripsi_id ?? "",
        deskripsi_en: product.deskripsi_en ?? "",
        calc_count: product.calc_count ?? 0,
        harga: product.harga != null ? String(product.harga) : "",
        harga_diskon: product.harga_diskon != null ? String(product.harga_diskon) : "",
        daily_stock: product.daily_stock != null ? String(product.daily_stock) : "",
        ref_sub_jenis_id: typeof product.sub_jenis === "number" ? product.sub_jenis : product.sub_jenis?.id ?? 0,
        gambars: [],
        isBestSeller: product.isBestSeller ?? false,
        isDaily: product.isDaily ?? false,
        // Preserve existing bahan ids for diff on submit
        bahans: (product.bahans ?? []).map((b) => ({ ...b })),
      });
      setExistingImages(
        (product.gambars ?? [])
          .filter((g: any) => g !== null)
          .map((g: any) => ({ id: g.id, file_path: g.file_path }))
      );
      setRemovedExistingImageIds([]);
      setNewImagePreviews([]);
      setErrors({});
      resetBahanForm();
    }
  }, [product, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length - removedExistingImageIds.length + formData.gambars.length + files.length;
    if (totalImages > 1) {
      setErrors((prev) => ({ ...prev, images: "Maksimal 1 gambar. Hapus gambar lama jika ingin mengganti." }));
      return;
    }
    const newPreviews: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newPreviews.push(event.target.result as string);
          if (newPreviews.length === files.length) setNewImagePreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
    setFormData((prev) => ({ ...prev, gambars: [...prev.gambars, ...files] }));
    setErrors((prev) => ({ ...prev, images: "" }));
  };

  const removeNewImage = (index: number) => {
    setFormData((prev) => ({ ...prev, gambars: prev.gambars.filter((_, i) => i !== index) }));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (id: number) => setRemovedExistingImageIds((prev) => [...prev, id]);

  // ── Bahan helpers ────────────────────────────────────────────────────────
  const resetBahanForm = () => {
    setShowBahanForm(false);
    setBahanInputMode("select");
    setSelectedBahanId("");
    setSelectedBahanJumlah("");
    setNewBahanNameId("");
    setNewBahanNameEn("");
    setNewBahanJumlah("");
    setErrors((prev) => ({ ...prev, bahan: "" }));
  };

  const addBahanFromSelect = () => {
    if (!selectedBahanId) {
      setErrors((prev) => ({ ...prev, bahan: "Pilih bahan terlebih dahulu" }));
      return;
    }
    const alreadyAdded = formData.bahans.some((b) => (b as any).id === selectedBahanId);
    if (alreadyAdded) {
      setErrors((prev) => ({ ...prev, bahan: "Bahan ini sudah ditambahkan" }));
      return;
    }
    const selected = availableBahans.find((b) => b.id === selectedBahanId);
    if (!selected) return;
    setFormData((prev) => ({
      ...prev,
      bahans: [
        ...prev.bahans,
        {
          id: selected.id,
          nama_id: selected.nama_id,
          nama_en: selected.nama_en,
          jumlah: selectedBahanJumlah ? Number(selectedBahanJumlah) : 0,
        },
      ],
    }));
    resetBahanForm();
  };

  const addBahanManual = () => {
    if (!newBahanNameId.trim() || !newBahanNameEn.trim()) {
      setErrors((prev) => ({ ...prev, bahan: "Nama bahan (ID dan EN) wajib diisi" }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      bahans: [
        ...prev.bahans,
        {
          id: 0,
          nama_id: newBahanNameId.trim(),
          nama_en: newBahanNameEn.trim(),
          jumlah: newBahanJumlah ? Number(newBahanJumlah) : 0,
        },
      ],
    }));
    resetBahanForm();
  };

  const handleRemoveBahan = (index: number) => {
    setFormData((prev) => ({ ...prev, bahans: prev.bahans.filter((_, i) => i !== index) }));
  };

  const handleBahanJumlahChange = (index: number, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.bahans];
      updated[index] = { ...updated[index], jumlah: Number(value) };
      return { ...prev, bahans: updated };
    });
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nama_id.trim()) newErrors.nama_id = "Nama produk (ID) harus diisi";
    if (!formData.nama_en.trim()) newErrors.nama_en = "Nama produk (EN) harus diisi";
    if (!formData.deskripsi_id.trim()) newErrors.deskripsi_id = "Deskripsi (ID) harus diisi";
    if (!formData.deskripsi_en.trim()) newErrors.deskripsi_en = "Deskripsi (EN) harus diisi";
    if (!formData.calc_count || parseFloat(String(formData.calc_count)) <= 0) newErrors.calc_count = "Hitungan Kalkulasi harus lebih dari 0";
    if (!formData.harga || parseFloat(formData.harga) <= 0) newErrors.harga = "Harga harus lebih dari 0";
    if (formData.isDaily && (!formData.daily_stock || parseInt(formData.daily_stock) < 0))
      newErrors.daily_stock = "Daily Stock tidak boleh negatif";
    if (!formData.ref_sub_jenis_id) newErrors.ref_sub_jenis_id = "Sub Jenis harus dipilih";
    const remainingImages = existingImages.length - removedExistingImageIds.length;
    if (remainingImages + formData.gambars.length === 0) newErrors.gambars = "Minimal 1 gambar produk";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !product?.id) return;
    setIsSubmitting(true);
    try {
      const updatedProduct: FormProduct = {
        nama_id: formData.nama_id, nama_en: formData.nama_en,
        deskripsi_id: formData.deskripsi_id, deskripsi_en: formData.deskripsi_en,
        calc_count: Number(formData.calc_count),
        harga: Number(formData.harga),
        harga_diskon: formData.harga_diskon ? Number(formData.harga_diskon) : null,
        daily_stock: formData.daily_stock ? Number(formData.daily_stock) : null,
        isBestSeller: formData.isBestSeller, isDaily: formData.isDaily,
        ref_sub_jenis_id: formData.ref_sub_jenis_id,
      };

      await onEditProduct(updatedProduct);

      // Remove deleted images
      for (const imgId of removedExistingImageIds) {
        await removeGambarFromProduct(product.id, imgId);
      }

      // Upload new image
      if (formData.gambars[0]) {
        await appendGambarToProduct(product.id, formData.gambars[0]);
      }

      // Sync bahans:
      // - Remove old bahans that are no longer in the list (by bahan.id > 0)
      // - Keep existing ones that weren't removed
      // - Add newly selected (id > 0) or newly manual (id === 0)
      const existingBahanIds = (product.bahans ?? []).map((b) => b.id).filter(Boolean) as number[];
      const incomingExisting = formData.bahans.filter((b) => (b as any).id > 0);
      const incomingManual   = formData.bahans.filter((b) => (b as any).id === 0);
      const incomingExistingIds = incomingExisting.map((b) => (b as any).id as number);

      console.log("Existing bahan IDs:", existingBahanIds);
      console.log("Incoming existing bahan IDs:", incomingExistingIds);

      // Remove dropped ones
      const toRemove = existingBahanIds.filter((id) => !incomingExistingIds.includes(id));
      console.log("To remove:", toRemove);
      for (const bahanId of toRemove) {
        await removeBahanFromProduct(product.id, bahanId);
      }

      // Append newly selected existing bahans
      const toAdd = incomingExisting.filter((b) => !existingBahanIds.includes((b as any).id));
      console.log("To add:", toAdd);
      for (const bahan of toAdd) {
        await appendBahanToProduct(product.id, (bahan as any).id, {
          nama_id: bahan.nama_id || "",
          nama_en: bahan.nama_en || "",
          jumlah: Number(bahan.jumlah) || 0,
        });
      }
      
      // Append all manual bahans (always new)
      for (const bahan of incomingManual) {
        console.log("Adding manual bahan:", bahan);
        await appendBahanToProduct(product.id, 0, {
          nama_id: bahan.nama_id || "",
          nama_en: bahan.nama_en || "",
          jumlah: Number(bahan.jumlah) || 0,
        });
      }
      await fetchProduct();

      onClose();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Terjadi kesalahan";
      await error("Gagal", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => { if (!isSubmitting) onClose(); };
  if (!isOpen || !product) return null;

  const visibleExistingImages = existingImages.filter((img) => !removedExistingImageIds.includes(img.id));

  return (
    <div className="fixed inset-0 z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl border border-gray-300" style={{ maxHeight: "80vh" }}>

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white rounded-t-lg">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Produk</h2>
              <p className="text-sm text-gray-600 mt-1">
                Perbarui informasi produk: <span className="font-medium text-orange-600">{product.nama_id}</span>
              </p>
            </div>
            <button onClick={handleClose} disabled={isSubmitting} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" type="button">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 overflow-y-auto bg-white" style={{ maxHeight: "calc(80vh - 160px)" }}>
              <div className="space-y-6">

                {/* Nama ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Produk (Bahasa Indonesia) *</label>
                  <input type="text" name="nama_id" value={formData.nama_id} onChange={handleInputChange}
                    placeholder="Contoh: Roti Cokelat" disabled={isSubmitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${errors.nama_id ? "border-red-500" : "border-gray-300"}`} />
                  {errors.nama_id && <p className="mt-1 text-sm text-red-600">{errors.nama_id}</p>}
                </div>

                {/* Nama EN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Produk (English) *</label>
                  <input type="text" name="nama_en" value={formData.nama_en} onChange={handleInputChange}
                    placeholder="Example: Chocolate Bread" disabled={isSubmitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${errors.nama_en ? "border-red-500" : "border-gray-300"}`} />
                  {errors.nama_en && <p className="mt-1 text-sm text-red-600">{errors.nama_en}</p>}
                </div>

                {/* Deskripsi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Produk (Bahasa Indonesia) *</label>
                    <textarea name="deskripsi_id" value={formData.deskripsi_id} onChange={handleInputChange}
                      rows={3} placeholder="Masukkan deskripsi produk dalam Bahasa Indonesia" disabled={isSubmitting}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${errors.deskripsi_id ? "border-red-500" : "border-gray-300"}`} />
                    {errors.deskripsi_id && <p className="mt-1 text-sm text-red-600">{errors.deskripsi_id}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Produk (English) *</label>
                    <textarea name="deskripsi_en" value={formData.deskripsi_en} onChange={handleInputChange}
                      rows={3} placeholder="Enter product description in English" disabled={isSubmitting}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${errors.deskripsi_en ? "border-red-500" : "border-gray-300"}`} />
                    {errors.deskripsi_en && <p className="mt-1 text-sm text-red-600">{errors.deskripsi_en}</p>}
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.isBestSeller}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isBestSeller: e.target.checked }))}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" disabled={isSubmitting} />
                    <span className="ml-2 text-sm text-gray-700">Best Seller</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.isDaily}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isDaily: e.target.checked }))}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" disabled={isSubmitting} />
                    <span className="ml-2 text-sm text-gray-700">Produk Harian</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hitungan Kalkulasi*</label>
                    <input type="number" name="calc_count" value={formData.calc_count} onChange={handleInputChange}
                      placeholder="1" min="0" step="any" disabled={isSubmitting}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${errors.harga ? "border-red-500" : "border-gray-300"}`} />
                    {errors.calc_count && <p className="mt-1 text-sm text-red-600">{errors.calc_count}</p>}
                  </div>
                </div>
                {/* Harga */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Harga (IDR) *</label>
                    <input type="number" name="harga" value={formData.harga} onChange={handleInputChange}
                      placeholder="125000" min="0" disabled={isSubmitting}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${errors.harga ? "border-red-500" : "border-gray-300"}`} />
                    {errors.harga && <p className="mt-1 text-sm text-red-600">{errors.harga}</p>}
                  </div>
                  {formData.isDaily && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Daily Stock *</label>
                      <input type="number" name="daily_stock" value={formData.daily_stock} onChange={handleInputChange}
                        placeholder="50" min="0" disabled={isSubmitting}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${errors.daily_stock ? "border-red-500" : "border-gray-300"}`} />
                      {errors.daily_stock && <p className="mt-1 text-sm text-red-600">{errors.daily_stock}</p>}
                      <p className="mt-1 text-xs text-gray-500">Stok harian yang akan di-reset setiap hari</p>
                    </div>
                  )}
                </div>

                {/* Sub Jenis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Layers className="w-4 h-4 inline mr-2 text-blue-500" />Sub Jenis (Kategori) *
                  </label>
                  <select name="ref_sub_jenis_id" value={formData.ref_sub_jenis_id?.toString() || ""} disabled={isSubmitting} required
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, ref_sub_jenis_id: e.target.value ? Number(e.target.value) : 0 }));
                      if (errors.ref_sub_jenis_id) setErrors((prev) => ({ ...prev, ref_sub_jenis_id: "" }));
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${errors.ref_sub_jenis_id ? "border-red-500" : "border-gray-300"}`}>
                    <option value="">Pilih Sub Jenis...</option>
                    {jenisList.map((jenis) => (
                      <optgroup key={jenis.id} label={jenis.nama_id}>
                        {getSubJenisByJenisId(jenis.id).map((subJenis) => (
                          <option key={subJenis.id} value={subJenis.id}>{subJenis.nama_id} ({subJenis.nama_en})</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {errors.ref_sub_jenis_id && <p className="mt-2 text-sm text-red-600">{errors.ref_sub_jenis_id}</p>}
                  <p className="text-xs text-gray-500 mt-1">Sub jenis sudah termasuk konfigurasi hari tersedia, jumlah pesanan, dan add-ons</p>
                </div>

                {/* ── Bahan ──────────────────────────────────────────────────────── */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Package className="w-4 h-4 mr-2 text-green-500" />Bahan (Ingredients)
                    </label>
                    {!showBahanForm && (
                      <button type="button" onClick={() => setShowBahanForm(true)} disabled={isSubmitting}
                        className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors">
                        <Plus className="w-3 h-3 mr-1" /> Tambah Bahan
                      </button>
                    )}
                  </div>

                  {/* Bahan form */}
                  {showBahanForm && (
                    <div className="mb-4 bg-white rounded-lg border border-orange-200 overflow-hidden">
                      {/* Mode tabs */}
                      <div className="flex border-b border-gray-200">
                        <button type="button" onClick={() => { setBahanInputMode("select"); setErrors((p) => ({ ...p, bahan: "" })); }}
                          className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${bahanInputMode === "select" ? "bg-orange-50 text-orange-600 border-b-2 border-orange-500" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
                          <Tag className="w-3 h-3 inline mr-1" /> Pilih dari Daftar
                        </button>
                        <button type="button" onClick={() => { setBahanInputMode("manual"); setErrors((p) => ({ ...p, bahan: "" })); }}
                          className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${bahanInputMode === "manual" ? "bg-orange-50 text-orange-600 border-b-2 border-orange-500" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
                          <Plus className="w-3 h-3 inline mr-1" /> Input Manual
                        </button>
                      </div>

                      <div className="p-3 space-y-3">
                        {errors.bahan && <p className="text-xs text-red-600">{errors.bahan}</p>}

                        {bahanInputMode === "select" && (
                          <>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Pilih Bahan</label>
                              <select value={selectedBahanId}
                                onChange={(e) => setSelectedBahanId(Number(e.target.value))}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                                <option value="">— Pilih Bahan —</option>
                                {availableBahans
                                  .filter((b) => !formData.bahans.some((added) => (added as any).id === b.id))
                                  .map((b) => (
                                    <option key={b.id} value={b.id}>{b.nama_id} ({b.nama_en})</option>
                                  ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Jumlah</label>
                              <input
                                type="number"
                                value={selectedBahanJumlah}
                                onChange={(e) => setSelectedBahanJumlah(normalizeNumericInput(e.target.value))}
                                min={0} step="0.1" placeholder="0"
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                            </div>
                          </>
                        )}

                        {bahanInputMode === "manual" && (
                          <>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Nama (Indonesia)</label>
                                <input type="text" value={newBahanNameId} onChange={(e) => setNewBahanNameId(e.target.value)}
                                  placeholder="Contoh: Tepung"
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Nama (English)</label>
                                <input type="text" value={newBahanNameEn} onChange={(e) => setNewBahanNameEn(e.target.value)}
                                  placeholder="Example: Flour"
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Jumlah</label>
                              <input
                                type="number"
                                value={newBahanJumlah}
                                onChange={(e) => setNewBahanJumlah(normalizeNumericInput(e.target.value))}
                                min={0} step="0.1" placeholder="0"
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                            </div>
                          </>
                        )}

                        <div className="flex justify-end gap-2 pt-1">
                          <button type="button" onClick={resetBahanForm}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            Batal
                          </button>
                          <button type="button" onClick={bahanInputMode === "select" ? addBahanFromSelect : addBahanManual}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600">
                            Simpan Bahan
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bahan list */}
                  <div className="space-y-2">
                    {formData.bahans.length === 0 ? (
                      <p className="text-sm text-gray-400 italic text-center py-4">Belum ada bahan ditambahkan</p>
                    ) : (
                      formData.bahans.map((bahan, index) => (
                        <div key={(bahan as any).id > 0 ? (bahan as any).id : `manual-${index}`}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{bahan.nama_id}</p>
                            <p className="text-xs text-gray-500">{bahan.nama_en}</p>
                            {(bahan as any).id === 0 && (
                              <span className="text-[10px] text-blue-500 font-medium">• Input manual</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <input type="number" value={bahan.jumlah} min={0} step="0.1"
                                onChange={(e) => handleBahanJumlahChange(index, e.target.value)}
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 text-right" />
                              <span className="text-xs text-gray-500">unit</span>
                            </div>
                            <button type="button" onClick={() => handleRemoveBahan(index)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Harga Diskon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Harga Diskon (Opsional)</label>
                  <input type="number" name="harga_diskon" value={formData.harga_diskon} onChange={handleInputChange}
                    placeholder="100000" min="0" disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                  <p className="text-xs text-gray-500 mt-1">Kosongkan jika tidak ada diskon</p>
                </div>

                {/* Gambar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Produk * (Max 1 gambar)</label>
                  {visibleExistingImages.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-2">Gambar saat ini:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {visibleExistingImages.map((img) => (
                          <div key={img.id} className="relative group">
                            <img
                              src={getImageUrl(img.file_path)}
                              alt="Existing product"
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = "none";
                                const fallback =
                                  target.parentElement?.querySelector(
                                    "[data-fallback='true']"
                                  ) as HTMLElement | null;
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                            <div
                              data-fallback="true"
                              className="absolute inset-0 w-full h-24 bg-orange-100 rounded-lg items-center justify-center"
                              style={{ display: "none" }}
                            >
                              <Package className="w-6 h-6 text-orange-600" />
                            </div>
                            <button type="button" onClick={() => removeExistingImage(img.id)} disabled={isSubmitting}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {visibleExistingImages.length + formData.gambars.length < 1 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload}
                        className="hidden" id="image-upload-edit" disabled={isSubmitting} />
                      <label htmlFor="image-upload-edit" className={`cursor-pointer ${isSubmitting ? "cursor-not-allowed opacity-50" : ""}`}>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Klik untuk upload gambar baru atau drag & drop</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG up to 10MB</p>
                      </label>
                    </div>
                  )}
                  {newImagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {newImagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img src={preview} alt={`New preview ${index + 1}`} className="w-full h-24 object-cover rounded-lg border border-orange-300" />
                          <span className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1 rounded">Baru</span>
                          <button type="button" onClick={() => removeNewImage(index)} disabled={isSubmitting}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.gambars && <p className="mt-1 text-sm text-red-600">{errors.gambars}</p>}
                  {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
                </div>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button type="button" onClick={handleClose} disabled={isSubmitting}
                className="px-8 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-colors">
                Batal
              </button>
              <button type="submit" disabled={isSubmitting}
                className="px-8 py-3 text-sm font-medium text-white bg-orange-500 border-2 border-orange-500 rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-600 disabled:opacity-50 flex items-center gap-2 transition-colors">
                {isSubmitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Menyimpan...</span></>
                ) : (
                  <><Save className="w-4 h-4" /><span>Simpan Perubahan</span></>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}