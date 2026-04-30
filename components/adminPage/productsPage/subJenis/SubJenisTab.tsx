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
  Settings,
  Calendar,
  Package,
  Clock,
  Gift,
  X,
} from "lucide-react";
import { Jenis, useJenis } from "@/app/contexts/JenisContext";
import { useSubJenis } from "@/app/contexts/SubJenisContext";
import { useAppAlert } from "@/components/AppAlert";
import { Attribute, Hari, SubJenis } from "@/app/contexts/SubJenisCrud";

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
  onSubmit: (data: SubJenis) => Promise<void>;
  editingSubJenis?: SubJenis | null;
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
  const [activeSection, setActiveSection] = useState<"basic" | "config">("basic");

  // Attribute form state
  const [availableAttributes, setAvailableAttributes] = useState<Attribute[]>([]);
  const [showAttributeForm, setShowAttributeForm] = useState(false);
  const [attrInputMode, setAttrInputMode] = useState<"select" | "manual">("select");

  // Select mode
  const [selectedAttrId, setSelectedAttrId] = useState<number | "">("");
  const [selectedAttrPrice, setSelectedAttrPrice] = useState<number>(0);

  // Manual mode
  const [newAttrNameId, setNewAttrNameId] = useState("");
  const [newAttrNameEn, setNewAttrNameEn] = useState("");
  const [newAttrPrice, setNewAttrPrice] = useState<number>(0);

  // ─── Fetch available attributes ───────────────────────────────────────────
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const res = await fetch("/api/atribut");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setAvailableAttributes(data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAttributes();
  }, []);

  // ─── Reset form on open ────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setNamaId(editingSubJenis?.nama_id || "");
      setNamaEn(editingSubJenis?.nama_en || "");
      setJenisId(editingSubJenis?.jenis_id || jenisList[0]?.id || 0);
      // Saat edit: pakai nilai aktual dari backend (termasuk 0 dan null).
      // Saat tambah baru: pakai default yang masuk akal.
      setMinAmount(editingSubJenis != null ? (editingSubJenis.min_amount ?? 0) : 1);
      setMaxAmount(editingSubJenis != null ? (editingSubJenis.max_amount ?? 0) : 100);
      setPoClosed(editingSubJenis != null ? (editingSubJenis.po_closed ?? "") : "15:00:00");
      setSelectedDays(
        editingSubJenis?.hari != null
          ? editingSubJenis.hari.map((h: Hari) => h.id)
          : [1, 2, 3, 4, 5, 6, 7]
      );
      setAttributes(editingSubJenis?.attributes || []);
      setError("");
      setActiveSection("basic");
      resetAttrForm();

      if (editingSubJenis?.id) {
        loadExistingConfiguration(editingSubJenis.id);
      }
    }
  }, [isOpen, editingSubJenis, jenisList]);

  const resetAttrForm = () => {
    setShowAttributeForm(false);
    setAttrInputMode("select");
    setSelectedAttrId("");
    setSelectedAttrPrice(0);
    setNewAttrNameId("");
    setNewAttrNameEn("");
    setNewAttrPrice(0);
    setError("");
  };

  // ─── Load config from backend when editing ────────────────────────────────
  const loadExistingConfiguration = async (subJenisId: number) => {
    try {
      const hariRes = await fetch(`/api/sub_jenis/${subJenisId}/hari`);
      if (hariRes.ok) {
        const hariData = await hariRes.json();
        const hariIds = hariData.data?.map((h: any) => h.hari_id) ?? [];
        setSelectedDays(hariIds);
      }

      const attrRes = await fetch(`/api/sub_jenis/${subJenisId}/attribute`);
      if (attrRes.ok) {
        const attrData = await attrRes.json();
        const attrs: Attribute[] =
          attrData.data?.map((a: any) => ({
            id: a.attribute_id,       // real DB id — 0 means manual/new
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

  // ─── Submit ───────────────────────────────────────────────────────────────
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
        hari: selectedDays.map((dayId) => ({ id: dayId })),
        attributes,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // ─── Days ─────────────────────────────────────────────────────────────────
  const toggleDay = (dayId: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };
  const selectAllDays = () => setSelectedDays(DAYS_OPTIONS.map((d) => d.id));
  const clearAllDays = () => setSelectedDays([]);

  // ─── Attributes ───────────────────────────────────────────────────────────
  /**
   * Derive a stable list key. For existing attrs (id > 0) use the id.
   * For manual attrs (id === 0) we fall back to the index during render.
   */
  const addAttributeFromSelect = () => {
    if (!selectedAttrId) {
      setError("Pilih atribut terlebih dahulu");
      return;
    }
    // Prevent duplicate
    const alreadyAdded = attributes.some((a) => a.id === selectedAttrId);
    if (alreadyAdded) {
      setError("Atribut ini sudah ditambahkan");
      return;
    }
    const selected = availableAttributes.find((a) => a.id === selectedAttrId);
    if (!selected) return;

    setAttributes((prev) => [
      ...prev,
      {
        id: selected.id,
        nama_id: selected.nama_id,
        nama_en: selected.nama_en,
        harga: selectedAttrPrice,
      },
    ]);
    resetAttrForm();
  };

  const addAttributeManual = () => {
    if (!newAttrNameId.trim() || !newAttrNameEn.trim()) {
      setError("Nama atribut (ID dan EN) wajib diisi");
      return;
    }
    setAttributes((prev) => [
      ...prev,
      {
        id: 0, // 0 = brand-new, will be created on save
        nama_id: newAttrNameId.trim(),
        nama_en: newAttrNameEn.trim(),
        harga: newAttrPrice,
      },
    ]);
    resetAttrForm();
  };

  const removeAttribute = (index: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col">
          <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">

            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingSubJenis ? "Edit Sub Jenis" : "Tambah Sub Jenis"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Konfigurasi sub kategori beserta pengaturan jumlah, hari, dan atribut
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 flex-shrink-0">
              {(["basic", "config"] as const).map((section) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => setActiveSection(section)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeSection === section
                      ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {section === "basic" ? (
                    <><Layers className="w-4 h-4 inline mr-2" />Informasi Dasar</>
                  ) : (
                    <><Settings className="w-4 h-4 inline mr-2" />Konfigurasi</>
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* ── BASIC ─────────────────────────────────────────────── */}
              {activeSection === "basic" && (
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <Tag className="w-4 h-4 mr-1 text-orange-500" />
                      Jenis (Kategori Utama) <span className="text-red-500">*</span>
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
              )}

              {/* ── CONFIG ────────────────────────────────────────────── */}
              {activeSection === "config" && (
                <div className="space-y-6">

                  {/* Amount */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="flex items-center text-sm font-medium text-gray-900 mb-3">
                      <Package className="w-4 h-4 mr-2 text-blue-500" />
                      Pengaturan Jumlah Pesanan
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600 mb-1 block">Min Amount</label>
                        <input type="number" value={minAmount}
                          onChange={(e) => setMinAmount(Number(e.target.value))} min={0}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 mb-1 block">Max Amount</label>
                        <input type="number" value={maxAmount}
                          onChange={(e) => setMaxAmount(Number(e.target.value))} min={1}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                      </div>
                    </div>
                  </div>

                  {/* PO Closed */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="flex items-center text-sm font-medium text-gray-900 mb-3">
                      <Clock className="w-4 h-4 mr-2 text-purple-500" />
                      Waktu Tutup Pre-Order
                    </h4>
                    <label className="text-sm text-gray-600 mb-2 block">
                      Jam Tutup PO (Format: HH:mm:ss)
                    </label>
                    <input
                      type="time"
                      value={poClosed ? poClosed.substring(0, 5) : ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPoClosed(val ? (val.split(":").length === 2 ? val + ":00" : val) : "");
                      }}
                      step="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {poClosed
                        ? `Pre-order akan ditutup pada jam: ${poClosed}`
                        : "Belum dikonfigurasi (kosongkan jika tidak ada batas waktu)"}
                    </p>
                  </div>

                  {/* Days */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="flex items-center text-sm font-medium text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-green-500" />
                        Hari Tersedia
                      </h4>
                      <div className="flex space-x-2">
                        <button type="button" onClick={selectAllDays}
                          className="text-xs text-orange-600 hover:text-orange-700">Pilih Semua</button>
                        <span className="text-gray-300">|</span>
                        <button type="button" onClick={clearAllDays}
                          className="text-xs text-gray-500 hover:text-gray-700">Hapus Semua</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {DAYS_OPTIONS.map((day) => (
                        <button key={day.id} type="button" onClick={() => toggleDay(day.id)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedDays.includes(day.id)
                              ? "bg-orange-500 text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}>
                          {day.nama_id}
                        </button>
                      ))}
                    </div>
                    {selectedDays.length === 0 && (
                      <p className="text-xs text-red-500 mt-2">Pilih minimal satu hari</p>
                    )}
                  </div>

                  {/* ── Attributes ──────────────────────────────────────── */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="flex items-center text-sm font-medium text-gray-900">
                        <Gift className="w-4 h-4 mr-2 text-pink-500" />
                        Add-ons / Atribut Tambahan
                      </h4>
                      {!showAttributeForm && (
                        <button type="button"
                          onClick={() => setShowAttributeForm(true)}
                          className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors">
                          <Plus className="w-3 h-3 mr-1" /> Tambah Atribut
                        </button>
                      )}
                    </div>

                    {/* Attribute Form */}
                    {showAttributeForm && (
                      <div className="mb-4 bg-white rounded-lg border border-orange-200 overflow-hidden">

                        {/* Mode toggle */}
                        <div className="flex border-b border-gray-200">
                          <button
                            type="button"
                            onClick={() => { setAttrInputMode("select"); setError(""); }}
                            className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
                              attrInputMode === "select"
                                ? "bg-orange-50 text-orange-600 border-b-2 border-orange-500"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <Tag className="w-3 h-3 inline mr-1" />
                            Pilih dari Daftar
                          </button>
                          <button
                            type="button"
                            onClick={() => { setAttrInputMode("manual"); setError(""); }}
                            className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
                              attrInputMode === "manual"
                                ? "bg-orange-50 text-orange-600 border-b-2 border-orange-500"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <Plus className="w-3 h-3 inline mr-1" />
                            Input Manual
                          </button>
                        </div>

                        <div className="p-3 space-y-3">
                          {/* ── SELECT MODE ─────────────────────────────── */}
                          {attrInputMode === "select" && (
                            <>
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">
                                  Pilih Atribut
                                </label>
                                <select
                                  value={selectedAttrId}
                                  onChange={(e) => {
                                    const id = Number(e.target.value);
                                    setSelectedAttrId(id);
                                    const found = availableAttributes.find((a) => a.id === id);
                                    // Pre-fill price from master attribute
                                    setSelectedAttrPrice(found?.harga ?? 0);
                                  }}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                >
                                  <option value="">— Pilih Atribut —</option>
                                  {availableAttributes
                                    .filter((a) => !attributes.some((added) => added.id === a.id))
                                    .map((attr) => (
                                      <option key={attr.id} value={attr.id}>
                                        {attr.nama_id} ({attr.nama_en})
                                      </option>
                                    ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">
                                  Harga Tambahan (Rp)
                                </label>
                                <input
                                  type="number"
                                  value={selectedAttrPrice}
                                  onChange={(e) => setSelectedAttrPrice(Number(e.target.value))}
                                  min={0}
                                  placeholder="0"
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                              </div>
                            </>
                          )}

                          {/* ── MANUAL MODE ─────────────────────────────── */}
                          {attrInputMode === "manual" && (
                            <>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs font-medium text-gray-700 mb-1 block">
                                    Nama (Indonesia)
                                  </label>
                                  <input
                                    type="text"
                                    value={newAttrNameId}
                                    onChange={(e) => setNewAttrNameId(e.target.value)}
                                    placeholder="Contoh: Lilin"
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
                                    placeholder="Example: Candle"
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
                                  onChange={(e) => setNewAttrPrice(Number(e.target.value))}
                                  min={0}
                                  placeholder="15000"
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                              </div>
                            </>
                          )}

                          {/* Actions */}
                          <div className="flex justify-end gap-2 pt-1">
                            <button type="button" onClick={resetAttrForm}
                              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={attrInputMode === "select" ? addAttributeFromSelect : addAttributeManual}
                              className="px-3 py-1.5 text-xs font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600">
                              Simpan Atribut
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Attributes list */}
                    <div className="space-y-2">
                      {attributes.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <Gift className="w-12 h-12 mx-auto mb-2 opacity-20" />
                          <p className="text-sm">Belum ada atribut ditambahkan</p>
                          <p className="text-xs mt-1">Klik "Tambah Atribut" untuk menambahkan add-ons</p>
                        </div>
                      ) : (
                        attributes.map((attr, index) => (
                          <div key={attr.id > 0 ? attr.id : `manual-${index}`}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{attr.nama_id}</p>
                              <p className="text-xs text-gray-500">{attr.nama_en}</p>
                              {attr.id === 0 && (
                                <span className="text-[10px] text-blue-500 font-medium">• Input manual</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-orange-600">
                                +Rp {attr?.harga?.toLocaleString("id-ID") ?? "0"}
                              </span>
                              <button type="button" onClick={() => removeAttribute(index)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded">
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
                {activeSection === "basic"
                  ? <span>Langkah 1/2: Informasi Dasar</span>
                  : <span>Langkah 2/2: Konfigurasi</span>}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={onClose} disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  Batal
                </button>
                {activeSection === "basic" ? (
                  <button type="button" onClick={() => setActiveSection("config")}
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600">
                    Lanjut ke Konfigurasi
                  </button>
                ) : (
                  <>
                    <button type="button" onClick={() => setActiveSection("basic")} disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      Kembali
                    </button>
                    <button type="submit" disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50">
                      {loading ? "Menyimpan..." : editingSubJenis ? "Simpan Perubahan" : "Simpan"}
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
  subJenis: SubJenis;
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
  const {
    list : jenisList,
  } = useJenis();

  const {
    subJenisList,
    loading,
    errors,
    createSubJenis,
    updateSubJenis,
    deleteSubJenis,
    appendHariToSubJenis,
    removeHariFromSubJenis,
    createAttribute,
    appendAttributeToSubJenis,
    removeAttributeFromSubJenis,
  } = useSubJenis();
  // const { addToast } = useToast();
  const { success, error, confirm } =  useAppAlert();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJenisFilter, setSelectedJenisFilter] = useState<
    number | "all"
  >("all");
  const [showForm, setShowForm] = useState(false);
  const [editingSubJenis, setEditingSubJenis] = useState<SubJenis | null>(
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

  const handleAddSubJenis = async (data: SubJenis) => {
    try {
      // ── STEP 1: Create base SubJenis ─────────────────────────────────────
      const created = await createSubJenis({
        nama_id: data.nama_id,
        nama_en: data.nama_en,
        jenis_id: data.jenis_id,
        min_amount: data.min_amount,
        max_amount: data.max_amount,
        po_closed: data.po_closed,
      });

      if (!created) {
        await error("Gagal", "Gagal membuat sub jenis");
        return;
      }

      const subJenisId = created.id;

      // ── STEP 2: Append Hari ──────────────────────────────────────────────
      for (const hari of data.hari || []) {
        const res = await appendHariToSubJenis(subJenisId, hari.id);
        if (!res) {
          await error("Gagal", `Gagal menambahkan hari`);
          return;
        }
      }

      // ── STEP 3: Append Attributes ────────────────────────────────────────
      // attr.id > 0  → existing master attribute, attach directly
      // attr.id === 0 → manual input, create new attribute first then attach
      for (const attr of data.attributes || []) {
        let attributeId = attr.id;

        if (attributeId === 0) {
          // Create the attribute in master table first
          const newAttr = await createAttribute({
            nama_id: attr.nama_id,
            nama_en: attr.nama_en,
          });
          if (!newAttr) {
            await error("Gagal", `Gagal membuat atribut "${attr.nama_id}"`);
            return;
          }
          attributeId = newAttr.id;
        }

        const res = await appendAttributeToSubJenis(subJenisId, attributeId, {
          nama_id: attr.nama_id,
          nama_en: attr.nama_en,
          harga: attr.harga ?? 0,
        });

        if (!res) {
          await error("Gagal", `Gagal menambahkan atribut "${attr.nama_id}"`);
          return;
        }
      }

      // ── SUCCESS ──────────────────────────────────────────────────────────
      await success("Berhasil", `"${data.nama_id}" berhasil ditambahkan dengan konfigurasi.`);
    } catch (err) {
      console.error(err);
      await error(
        "Terjadi Kesalahan",
        err instanceof Error ? err.message : "Gagal menambahkan sub jenis"
      );
    }
  };

  const handleEditSubJenis = async (data: SubJenis) => {
    if (!editingSubJenis) return;

    try {
      // ── STEP 1: Update base fields ───────────────────────────────────────
      const updated = await updateSubJenis(editingSubJenis.id, {
        nama_id: data.nama_id,
        nama_en: data.nama_en,
        jenis_id: data.jenis_id,
        min_amount: data.min_amount,
        max_amount: data.max_amount,
        po_closed: data.po_closed,
      });

      if (!updated) {
        await error("Gagal", "Gagal mengupdate sub jenis");
        return;
      }

      // ── STEP 2: Sync Hari ────────────────────────────────────────────────
      try {
        const existingHariIds = editingSubJenis.hari?.map((h) => Number(h.id)) ?? [];
        const newHariIds = data.hari?.map((h) => Number(h.id)) ?? [];

        const toRemove = existingHariIds.filter((id) => !newHariIds.includes(id));
        const toAdd    = newHariIds.filter((id) => !existingHariIds.includes(id));

        await Promise.all(toRemove.map((hariId) => removeHariFromSubJenis(editingSubJenis.id, hariId)));
        await Promise.all(toAdd.map((hariId) => appendHariToSubJenis(editingSubJenis.id, hariId)));
      } catch (e) {
        console.error("Gagal sync hari:", e);
      }

      // ── STEP 3: Sync Attributes ──────────────────────────────────────────
      // Strategy:
      //   • Separate incoming attrs into "existing" (id > 0) and "manual/new" (id === 0)
      //   • For existing: diff against what was previously saved — remove dropped ones, add new ones
      //   • For manual (id === 0): always create + attach (they are brand new)
      try {
        const existingAttrIds = editingSubJenis.attributes?.map((a) => Number(a.id)) ?? [];

        const incomingExisting = data.attributes?.filter((a) => a.id > 0) ?? [];
        const incomingManual   = data.attributes?.filter((a) => a.id === 0) ?? [];

        const incomingExistingIds = incomingExisting.map((a) => Number(a.id));

        // Remove attributes that were present before but are no longer selected
        const toRemove = existingAttrIds.filter((id) => !incomingExistingIds.includes(id));
        await Promise.all(
          toRemove.map((attrId) => removeAttributeFromSubJenis(editingSubJenis.id, attrId))
        );

        // Add existing-master attributes that are newly added (weren't there before)
        const toAdd = incomingExisting.filter((a) => !existingAttrIds.includes(Number(a.id)));
        for (const attr of toAdd) {
          const res = await appendAttributeToSubJenis(editingSubJenis.id, attr.id, {
            nama_id: attr.nama_id,
            nama_en: attr.nama_en,
            harga: attr.harga ?? 0,
          });
          if (!res) {
            await error("Gagal", `Gagal menambahkan atribut "${attr.nama_id}"`);
            return;
          }
        }

        // Create & attach all manual attributes (always new)
        for (const attr of incomingManual) {
          const newAttr = await createAttribute({
            nama_id: attr.nama_id,
            nama_en: attr.nama_en,
          });
          console.log("newAttr:", newAttr);
          if (!newAttr) {
            await error("Gagal", `Gagal membuat atribut "${attr.nama_id}"`);
            return;
          }
          const res = await appendAttributeToSubJenis(editingSubJenis.id, newAttr.id, {
            nama_id: attr.nama_id,
            nama_en: attr.nama_en,
            harga: attr.harga ?? 0,
          });
          if (!res) {
            await error("Gagal", `Gagal menambahkan atribut "${attr.nama_id}"`);
            return;
          }
        }
      } catch (e) {
        console.error("Gagal sync atribut:", e);
      }


      setEditingSubJenis(null);
      await success("Berhasil", `"${data.nama_id}" berhasil diperbarui dengan konfigurasi.`);
    } catch (err) {
      console.error(err);
      await error(
        "Terjadi Kesalahan",
        err instanceof Error ? err.message : "Gagal mengupdate sub jenis"
      );
    }
  };

  const handleDeleteSubJenis = async () => {
    if (!deleteConfirm) return;

    const result = await deleteSubJenis(deleteConfirm.id);
    if (result) {
      await success(
        "Sub Jenis berhasil dihapus",
        `"${deleteConfirm.name}" telah dihapus.`
      );
    } else {
      await error(
        "Gagal menghapus sub jenis",
        `"${deleteConfirm.name}" gagal dihapus.`
      );
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
          {filteredSubJenis.map((sj) => {
            const foundJenis = jenisList.find((j) => j.id === sj.jenis_id);
            const jenisWithValidNama = foundJenis ? { ...foundJenis, nama_id: foundJenis.nama_id || "", nama_en: foundJenis.nama_en || "" } : undefined;
            return (
              <SubJenisCard
                key={sj.id}
                subJenis={sj as SubJenis}
                jenis={jenisWithValidNama}
                onEdit={() => {
                  setEditingSubJenis(sj as SubJenis);
                  setShowForm(true);
                }}
                onDelete={() => setDeleteConfirm({ id: sj.id, name: sj.nama_id })}
              />
            );
          })}
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
        jenisList={jenisList.map(j => ({ ...j, nama_id: j.nama_id || "", nama_en: j.nama_en || "" }))}
      />
    </div>
  );
}
