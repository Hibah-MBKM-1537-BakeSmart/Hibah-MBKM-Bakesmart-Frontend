"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  AlertTriangle,
  Globe,
  Search,
  Layers,
  ChevronDown,
  ChevronRight,
  Settings,
  Calendar,
  Package,
  Clock,
  Gift,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useJenis } from "@/app/contexts/JenisContext";
import { useSubJenis } from "@/app/contexts/SubJenisContext";
import { Jenis, SubJenis } from "@/lib/types";
import { useToast } from "../Toast";

// Attribute interface for dynamic add-ons
interface Attribute {
  id?: number;
  nama_id: string;
  nama_en: string;
  harga: number;
}

// Extended SubJenis interface with configuration
interface SubJenisConfig extends SubJenis {
  available_days?: number[];
  attributes?: Attribute[];
}

// Days options (matching backend /hari endpoint)
const DAYS_OPTIONS = [
  { id: 1, nama_id: "Senin", nama_en: "Monday" },
  { id: 2, nama_id: "Selasa", nama_en: "Tuesday" },
  { id: 3, nama_id: "Rabu", nama_en: "Wednesday" },
  { id: 4, nama_id: "Kamis", nama_en: "Thursday" },
  { id: 5, nama_id: "Jumat", nama_en: "Friday" },
  { id: 6, nama_id: "Sabtu", nama_en: "Saturday" },
  { id: 7, nama_id: "Minggu", nama_en: "Sunday" },
];

// Attribute interface
interface Attribute {
  id?: number;
  nama_id: string;
  nama_en: string;
  harga: number;
}

// Add/Edit Sub Jenis Form Modal with Configuration
function SubJenisFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingSubJenis,
  existingSubJenis,
  jenisList,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubJenisConfig) => Promise<void>;
  editingSubJenis?: SubJenisConfig | null;
  existingSubJenis: SubJenis[];
  jenisList: Jenis[];
}) {
  const [namaId, setNamaId] = useState("");
  const [namaEn, setNamaEn] = useState("");
  const [jenisId, setJenisId] = useState<number>(0);
  const [minAmount, setMinAmount] = useState<number>(1);
  const [maxAmount, setMaxAmount] = useState<number>(100);
  const [poClosed, setPoClosed] = useState<string>("15:00:00");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<"basic" | "config">(
    "basic"
  );

  // Form for adding new attribute
  const [showAttributeForm, setShowAttributeForm] = useState(false);
  const [newAttrNameId, setNewAttrNameId] = useState("");
  const [newAttrNameEn, setNewAttrNameEn] = useState("");
  const [newAttrPrice, setNewAttrPrice] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setNamaId(editingSubJenis?.nama_id || "");
      setNamaEn(editingSubJenis?.nama_en || "");
      setJenisId(editingSubJenis?.jenis_id || jenisList[0]?.id || 0);
      setMinAmount(editingSubJenis?.min_amount || 1);
      setMaxAmount(editingSubJenis?.max_amount || 100);
      setPoClosed(editingSubJenis?.po_closed || "15:00:00");
      setSelectedDays(editingSubJenis?.available_days || [1, 2, 3, 4, 5, 6, 7]);
      setAttributes(editingSubJenis?.attributes || []);
      setError("");
      setActiveSection("basic");
      setShowAttributeForm(false);

      // Load existing hari and attributes from backend when editing
      if (editingSubJenis?.id) {
        loadExistingConfiguration(editingSubJenis.id);
      }
    }
  }, [isOpen, editingSubJenis, jenisList]);

  const loadExistingConfiguration = async (subJenisId: number) => {
    try {
      // Fetch detail sub_jenis untuk mendapatkan min_amount, max_amount, PO_closed
      const detailRes = await fetch(`/api/sub_jenis/${subJenisId}`);
      if (detailRes.ok) {
        const detailData = await detailRes.json();
        const detail = detailData.data;

        // Update form dengan data lengkap dari backend
        setMinAmount(detail.min_amount || 1);
        setMaxAmount(detail.max_amount || 100);
        setPoClosed(detail.PO_closed || "15:00:00");
        setNamaId(detail.nama_id || "");
        setNamaEn(detail.nama_en || "");
        setJenisId(detail.ref_jenis_id || jenisList[0]?.id || 0);
      }

      // Fetch existing hari
      const hariRes = await fetch(`/api/sub_jenis/${subJenisId}/hari`);
      if (hariRes.ok) {
        const hariData = await hariRes.json();
        const hariIds = hariData.data?.map((h: any) => h.hari_id) || [];
        setSelectedDays(hariIds.length > 0 ? hariIds : [1, 2, 3, 4, 5, 6, 7]);
      }

      // Fetch existing attributes
      const attrRes = await fetch(`/api/sub_jenis/${subJenisId}/attribute`);
      if (attrRes.ok) {
        const attrData = await attrRes.json();
        const attrs =
          attrData.data?.map((a: any) => ({
            id: a.attribute_id,
            nama_id: a.attribute_nama_id,
            nama_en: a.attribute_nama_en,
            harga: a.harga_attribute || 0,
          })) || [];
        setAttributes(attrs);
      }
    } catch (error) {
      console.error("Failed to load existing configuration:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!namaId.trim() || !namaEn.trim()) {
      setError("Nama Indonesia dan English wajib diisi");
      return;
    }

    if (!jenisId) {
      setError("Pilih Jenis (Kategori Utama) terlebih dahulu");
      return;
    }

    if (minAmount > maxAmount) {
      setError("Min Amount tidak boleh lebih besar dari Max Amount");
      return;
    }

    if (selectedDays.length === 0) {
      setError("Pilih minimal satu hari tersedia");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        id: editingSubJenis?.id || 0,
        nama_id: namaId.trim(),
        nama_en: namaEn.trim(),
        jenis_id: jenisId,
        min_amount: minAmount,
        max_amount: maxAmount,
        po_closed: poClosed,
        available_days: selectedDays,
        attributes: attributes,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (dayId: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

  const addAttribute = () => {
    if (!newAttrNameId.trim() || !newAttrNameEn.trim()) {
      setError("Nama atribut (ID dan EN) wajib diisi");
      return;
    }

    setAttributes((prev) => [
      ...prev,
      {
        nama_id: newAttrNameId.trim(),
        nama_en: newAttrNameEn.trim(),
        harga: newAttrPrice,
      },
    ]);

    setNewAttrNameId("");
    setNewAttrNameEn("");
    setNewAttrPrice(0);
    setShowAttributeForm(false);
    setError("");
  };

  const removeAttribute = (index: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const editAttribute = (index: number, updatedAttr: Attribute) => {
    setAttributes((prev) =>
      prev.map((attr, i) => (i === index ? updatedAttr : attr))
    );
  };

  const selectAllDays = () => {
    setSelectedDays(DAYS_OPTIONS.map((d) => d.id));
  };

  const clearAllDays = () => {
    setSelectedDays([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col h-full max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingSubJenis ? "Edit Sub Jenis" : "Tambah Sub Jenis"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Konfigurasi sub kategori beserta pengaturan jumlah, hari, dan
                atribut
              </p>
            </div>

            {/* Section Tabs */}
            <div className="flex border-b border-gray-200 flex-shrink-0">
              <button
                type="button"
                onClick={() => setActiveSection("basic")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeSection === "basic"
                    ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Layers className="w-4 h-4 inline mr-2" />
                Informasi Dasar
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("config")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeSection === "config"
                    ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Konfigurasi
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {activeSection === "basic" ? (
                <div className="space-y-4">
                  {/* Jenis Selection */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <Tag className="w-4 h-4 mr-1 text-orange-500" />
                      Jenis (Kategori Utama){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={jenisId}
                      onChange={(e) => setJenisId(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    >
                      <option value="">Pilih Jenis...</option>
                      {jenisList.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.nama_id} ({j.nama_en})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Name ID */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <Globe className="w-4 h-4 mr-1 text-red-500" />
                      Nama (Indonesia) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={namaId}
                      onChange={(e) => setNamaId(e.target.value)}
                      placeholder="Contoh: Kue Ulang Tahun, Roti Tawar"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>

                  {/* Name EN */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <Globe className="w-4 h-4 mr-1 text-blue-500" />
                      Nama (English) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={namaEn}
                      onChange={(e) => setNamaEn(e.target.value)}
                      placeholder="Example: Birthday Cake, White Bread"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Amount Settings */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="flex items-center text-sm font-medium text-gray-900 mb-3">
                      <Package className="w-4 h-4 mr-2 text-blue-500" />
                      Pengaturan Jumlah Pesanan
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600 mb-1 block">
                          Min Amount
                        </label>
                        <input
                          type="number"
                          value={minAmount}
                          onChange={(e) => setMinAmount(Number(e.target.value))}
                          min={1}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 mb-1 block">
                          Max Amount
                        </label>
                        <input
                          type="number"
                          value={maxAmount}
                          onChange={(e) => setMaxAmount(Number(e.target.value))}
                          min={1}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PO Closed Time */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="flex items-center text-sm font-medium text-gray-900 mb-3">
                      <Clock className="w-4 h-4 mr-2 text-purple-500" />
                      Waktu Tutup Pre-Order
                    </h4>
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        Jam Tutup PO (Format: HH:mm:ss)
                      </label>
                      <input
                        type="time"
                        value={poClosed.substring(0, 5)} // Display as HH:mm
                        onChange={(e) => setPoClosed(e.target.value + ":00")} // Store as HH:mm:ss
                        step="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Pre-order akan ditutup pada jam: {poClosed}
                      </p>
                    </div>
                  </div>

                  {/* Available Days */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="flex items-center text-sm font-medium text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-green-500" />
                        Hari Tersedia
                      </h4>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={selectAllDays}
                          className="text-xs text-orange-600 hover:text-orange-700"
                        >
                          Pilih Semua
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={clearAllDays}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Hapus Semua
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {DAYS_OPTIONS.map((day) => (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => toggleDay(day.id)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedDays.includes(day.id)
                              ? "bg-orange-500 text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {day.nama_id}
                        </button>
                      ))}
                    </div>
                    {selectedDays.length === 0 && (
                      <p className="text-xs text-red-500 mt-2">
                        Pilih minimal satu hari
                      </p>
                    )}
                  </div>

                  {/* Attributes / Add-ons */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="flex items-center text-sm font-medium text-gray-900">
                        <Gift className="w-4 h-4 mr-2 text-pink-500" />
                        Add-ons / Atribut Tambahan
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowAttributeForm(!showAttributeForm)}
                        className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Tambah Atribut
                      </button>
                    </div>

                    {/* Add Attribute Form */}
                    {showAttributeForm && (
                      <div className="mb-4 p-3 bg-white rounded-lg border border-orange-200 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-gray-700 mb-1 block">
                              Nama (Indonesia)
                            </label>
                            <input
                              type="text"
                              value={newAttrNameId}
                              onChange={(e) => setNewAttrNameId(e.target.value)}
                              placeholder="Kartu Ucapan"
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700 mb-1 block">
                              Nama (English)
                            </label>
                            <input
                              type="text"
                              value={newAttrNameEn}
                              onChange={(e) => setNewAttrNameEn(e.target.value)}
                              placeholder="Greeting Card"
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Harga Tambahan (Rp)
                          </label>
                          <input
                            type="number"
                            value={newAttrPrice}
                            onChange={(e) =>
                              setNewAttrPrice(Number(e.target.value))
                            }
                            min={0}
                            placeholder="15000"
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowAttributeForm(false);
                              setNewAttrNameId("");
                              setNewAttrNameEn("");
                              setNewAttrPrice(0);
                              setError("");
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={addAttribute}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600"
                          >
                            Simpan Atribut
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Attributes List */}
                    <div className="space-y-2">
                      {attributes.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <Gift className="w-12 h-12 mx-auto mb-2 opacity-20" />
                          <p className="text-sm">
                            Belum ada atribut ditambahkan
                          </p>
                          <p className="text-xs mt-1">
                            Klik "Tambah Atribut" untuk menambahkan add-ons
                          </p>
                        </div>
                      ) : (
                        attributes.map((attr, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {attr.nama_id}
                              </p>
                              <p className="text-xs text-gray-500">
                                {attr.nama_en}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-orange-600">
                                +Rp {attr.harga.toLocaleString("id-ID")}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeAttribute(index)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="text-sm text-gray-500">
                {activeSection === "basic" ? (
                  <span>Langkah 1/2: Informasi Dasar</span>
                ) : (
                  <span>Langkah 2/2: Konfigurasi</span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Batal
                </button>
                {activeSection === "basic" ? (
                  <button
                    type="button"
                    onClick={() => setActiveSection("config")}
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600"
                  >
                    Lanjut ke Konfigurasi
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveSection("basic")}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      disabled={loading}
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                      {loading
                        ? "Menyimpan..."
                        : editingSubJenis
                        ? "Simpan Perubahan"
                        : "Simpan"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Sub Jenis Card Component
function SubJenisCard({
  subJenis,
  jenis,
  onEdit,
  onDelete,
}: {
  subJenis: SubJenisConfig;
  jenis: Jenis | undefined;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Header - Simple view */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{subJenis.nama_id}</h4>
            <p className="text-sm text-gray-500">
              {jenis?.nama_id || "Tanpa Kategori"} • {subJenis.nama_en}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Klik "Edit" untuk melihat dan mengubah konfigurasi lengkap
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function SubJenisTab() {
  const { jenisList } = useJenis();
  const {
    subJenisList,
    loading,
    createSubJenis,
    updateSubJenis,
    deleteSubJenis,
  } = useSubJenis();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJenisFilter, setSelectedJenisFilter] = useState<
    number | "all"
  >("all");
  const [showForm, setShowForm] = useState(false);
  const [editingSubJenis, setEditingSubJenis] = useState<SubJenisConfig | null>(
    null
  );
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Filter sub jenis
  const filteredSubJenis = subJenisList.filter((sj) => {
    const matchesSearch =
      sj.nama_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sj.nama_en.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJenis =
      selectedJenisFilter === "all" || sj.jenis_id === selectedJenisFilter;
    return matchesSearch && matchesJenis;
  });

  const handleAddSubJenis = async (data: SubJenisConfig) => {
    try {
      // Step 1: Create sub jenis with basic info + config
      const response = await fetch("/api/sub_jenis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama_id: data.nama_id,
          nama_en: data.nama_en,
          ref_jenis_id: data.jenis_id,
          min_amount: data.min_amount,
          max_amount: data.max_amount,
          PO_closed: data.po_closed, // Time string in HH:mm:ss format
        }),
      });

      if (!response.ok) throw new Error("Gagal membuat sub jenis");
      const result = await response.json();
      const subJenisId = result.id;

      // Step 2: Append hari (available days)
      for (const hariId of data.available_days || []) {
        await fetch(`/api/sub_jenis/${subJenisId}/hari/${hariId}`, {
          method: "POST",
        });
      }

      // Step 3: Create and append attributes
      for (const attr of data.attributes || []) {
        let attributeId = attr.id;

        // If attribute doesn't have ID, create it first (TANPA HARGA!)
        if (!attributeId) {
          const attrResponse = await fetch("/api/atribut", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nama_id: attr.nama_id,
              nama_en: attr.nama_en,
              // ❌ JANGAN kirim harga di sini!
            }),
          });

          if (attrResponse.ok) {
            const attrResult = await attrResponse.json();
            attributeId = attrResult.id;
          }
        }

        // Append attribute to sub_jenis (DENGAN HARGA!)
        if (attributeId) {
          await fetch(`/api/sub_jenis/${subJenisId}/attribute/${attributeId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              harga: attr.harga || 0, // ✅ Kirim harga di sini!
            }),
          });
        }
      }

      // Refresh sub jenis list
      await createSubJenis({
        nama_id: data.nama_id,
        nama_en: data.nama_en,
        jenis_id: data.jenis_id,
      });

      addToast({
        type: "success",
        title: "Sub Jenis berhasil ditambahkan!",
        message: `"${data.nama_id}" telah ditambahkan dengan konfigurasi.`,
      });
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Gagal menambahkan sub jenis"
      );
    }
  };

  const handleEditSubJenis = async (data: SubJenisConfig) => {
    if (!editingSubJenis) return;

    try {
      // Step 1: Update basic info + config (ref_sub_jenis table)
      const response = await fetch(`/api/sub_jenis/${editingSubJenis.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama_id: data.nama_id,
          nama_en: data.nama_en,
          ref_jenis_id: data.jenis_id,
          min_amount: data.min_amount,
          max_amount: data.max_amount,
          PO_closed: data.po_closed, // Time string in HH:mm:ss format
        }),
      });

      if (!response.ok) throw new Error("Gagal update sub jenis");

      // Step 2: Get existing hari and delete them
      try {
        const existingHariRes = await fetch(
          `/api/sub_jenis/${editingSubJenis.id}/hari`
        );
        if (existingHariRes.ok) {
          const existingHari = await existingHariRes.json();
          // Delete each existing hari
          for (const hari of existingHari.data || []) {
            await fetch(
              `/api/sub_jenis/${editingSubJenis.id}/hari/${hari.hari_id}`,
              {
                method: "DELETE",
              }
            );
          }
        }
      } catch (e) {
        // If no hari exists, continue
      }

      // Step 3: Add new hari
      for (const hariId of data.available_days || []) {
        try {
          await fetch(`/api/sub_jenis/${editingSubJenis.id}/hari/${hariId}`, {
            method: "POST",
          });
        } catch (e) {
          // Continue if already exists
        }
      }

      // Step 4: Get existing attributes and delete them
      try {
        const existingAttrRes = await fetch(
          `/api/sub_jenis/${editingSubJenis.id}/attribute`
        );
        if (existingAttrRes.ok) {
          const existingAttr = await existingAttrRes.json();
          // Delete each existing attribute
          for (const attr of existingAttr.data || []) {
            await fetch(
              `/api/sub_jenis/${editingSubJenis.id}/attribute/${attr.attribute_id}`,
              {
                method: "DELETE",
              }
            );
          }
        }
      } catch (e) {
        // If no attributes exist, continue
      }

      // Step 5: Create and add new attributes
      for (const attr of data.attributes || []) {
        let attributeId = attr.id;

        // If attribute doesn't have ID, create it first (TANPA HARGA!)
        if (!attributeId) {
          try {
            const attrResponse = await fetch("/api/atribut", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                nama_id: attr.nama_id,
                nama_en: attr.nama_en,
                // ❌ JANGAN kirim harga di sini!
              }),
            });

            if (attrResponse.ok) {
              const attrResult = await attrResponse.json();
              attributeId = attrResult.id;
            }
          } catch (e) {
            console.error("Failed to create attribute:", e);
          }
        }

        // Append attribute to sub_jenis (DENGAN HARGA!)
        if (attributeId) {
          try {
            await fetch(
              `/api/sub_jenis/${editingSubJenis.id}/attribute/${attributeId}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  harga: attr.harga || 0, // ✅ Kirim harga di sini!
                }),
              }
            );
          } catch (e) {
            // Continue if already exists
          }
        }
      }

      // Refresh list
      await updateSubJenis(editingSubJenis.id, {
        nama_id: data.nama_id,
        nama_en: data.nama_en,
        jenis_id: data.jenis_id,
      });

      addToast({
        type: "success",
        title: "Sub Jenis berhasil diupdate!",
        message: `"${data.nama_id}" telah diperbarui dengan konfigurasi lengkap.`,
      });
      setEditingSubJenis(null);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Gagal mengupdate sub jenis"
      );
    }
  };

  const handleDeleteSubJenis = async () => {
    if (!deleteConfirm) return;

    const result = await deleteSubJenis(deleteConfirm.id);
    if (result) {
      addToast({
        type: "success",
        title: "Sub Jenis berhasil dihapus!",
        message: `"${deleteConfirm.name}" telah dihapus.`,
      });
    } else {
      addToast({
        type: "error",
        title: "Gagal menghapus sub jenis",
        message: "Terjadi kesalahan saat menghapus.",
      });
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Manajemen Sub Jenis (Konfigurasi)
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Kelola sub kategori dengan pengaturan jumlah, hari, dan add-ons
          </p>
        </div>
        <button
          onClick={() => {
            setEditingSubJenis(null);
            setShowForm(true);
          }}
          disabled={jenisList.length === 0}
          className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Sub Jenis</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari sub jenis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <select
          value={selectedJenisFilter === "all" ? "all" : selectedJenisFilter}
          onChange={(e) =>
            setSelectedJenisFilter(
              e.target.value === "all" ? "all" : Number(e.target.value)
            )
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="all">Semua Jenis</option>
          {jenisList.map((j) => (
            <option key={j.id} value={j.id}>
              {j.nama_id}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {subJenisList.length}
              </p>
              <p className="text-sm text-gray-600">Total Sub Jenis</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {jenisList.length}
              </p>
              <p className="text-sm text-gray-600">Kategori Jenis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {jenisList.length === 0 ? (
        <div className="text-center py-12 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tambahkan Jenis Terlebih Dahulu
          </h3>
          <p className="text-gray-600">
            Sub Jenis memerlukan Jenis sebagai parent. Silakan buat Jenis
            terlebih dahulu di tab Jenis.
          </p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Memuat data...</span>
        </div>
      ) : filteredSubJenis.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || selectedJenisFilter !== "all"
              ? "Tidak ditemukan"
              : "Belum ada Sub Jenis"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedJenisFilter !== "all"
              ? "Coba ubah filter pencarian"
              : "Mulai dengan menambahkan Sub Jenis untuk mengkonfigurasi produk"}
          </p>
          {!searchTerm && selectedJenisFilter === "all" && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Sub Jenis Pertama</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredSubJenis.map((sj) => (
            <SubJenisCard
              key={sj.id}
              subJenis={sj as SubJenisConfig}
              jenis={jenisList.find((j) => j.id === sj.jenis_id)}
              onEdit={() => {
                setEditingSubJenis(sj as SubJenisConfig);
                setShowForm(true);
              }}
              onDelete={() => setDeleteConfirm({ id: sj.id, name: sj.nama_id })}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Konfirmasi Hapus
                  </h3>
                </div>

                <p className="text-gray-600 mb-6">
                  Apakah Anda yakin ingin menghapus Sub Jenis{" "}
                  <strong>"{deleteConfirm.name}"</strong>? Tindakan ini tidak
                  dapat dibatalkan.
                </p>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDeleteSubJenis}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub Jenis Form Modal */}
      <SubJenisFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingSubJenis(null);
        }}
        onSubmit={editingSubJenis ? handleEditSubJenis : handleAddSubJenis}
        editingSubJenis={editingSubJenis}
        existingSubJenis={subJenisList}
        jenisList={jenisList}
      />
    </div>
  );
}
