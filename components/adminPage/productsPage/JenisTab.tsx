"use client";

import React, { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  AlertTriangle,
  Globe,
  Search,
} from "lucide-react";
import { useJenis } from "@/app/contexts/JenisContext";
import { useSubJenis } from "@/app/contexts/SubJenisContext";
import { Jenis } from "@/lib/types";
import { useToast } from "../Toast";

// Add/Edit Jenis Form Modal
function JenisFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingJenis,
  existingJenis,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { nama_id: string; nama_en: string }) => Promise<void>;
  editingJenis?: Jenis | null;
  existingJenis: Jenis[];
}) {
  const [namaId, setNamaId] = useState(editingJenis?.nama_id || "");
  const [namaEn, setNamaEn] = useState(editingJenis?.nama_en || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (isOpen) {
      setNamaId(editingJenis?.nama_id || "");
      setNamaEn(editingJenis?.nama_en || "");
      setError("");
    }
  }, [isOpen, editingJenis]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!namaId.trim() || !namaEn.trim()) {
      setError("Nama Indonesia dan English wajib diisi");
      return;
    }

    // Check duplicate
    const isDuplicate = existingJenis.some(
      (j) =>
        j.id !== editingJenis?.id &&
        (j.nama_id.toLowerCase() === namaId.toLowerCase() ||
          j.nama_en.toLowerCase() === namaEn.toLowerCase())
    );
    if (isDuplicate) {
      setError("Jenis dengan nama tersebut sudah ada");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ nama_id: namaId.trim(), nama_en: namaEn.trim() });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl">
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingJenis
                  ? "Edit Jenis (Kategori)"
                  : "Tambah Jenis (Kategori)"}
              </h3>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Globe className="w-4 h-4 mr-1 text-red-500" />
                    Nama (Indonesia)
                  </label>
                  <input
                    type="text"
                    value={namaId}
                    onChange={(e) => setNamaId(e.target.value)}
                    placeholder="Contoh: Kue, Roti, Pastry"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Globe className="w-4 h-4 mr-1 text-blue-500" />
                    Nama (English)
                  </label>
                  <input
                    type="text"
                    value={namaEn}
                    onChange={(e) => setNamaEn(e.target.value)}
                    placeholder="Example: Cake, Bread, Pastry"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : editingJenis ? "Update" : "Tambah"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function JenisTab() {
  const { jenisList, loading, createJenis, updateJenis, deleteJenis } =
    useJenis();
  const { getSubJenisByJenisId } = useSubJenis();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingJenis, setEditingJenis] = useState<Jenis | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Filter jenis based on search
  const filteredJenis = jenisList.filter(
    (jenis) =>
      jenis.nama_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jenis.nama_en.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddJenis = async (data: { nama_id: string; nama_en: string }) => {
    const result = await createJenis(data);
    if (result) {
      addToast({
        type: "success",
        title: "Jenis berhasil ditambahkan!",
        message: `"${data.nama_id}" telah ditambahkan.`,
      });
    } else {
      throw new Error("Gagal menambahkan jenis");
    }
  };

  const handleEditJenis = async (data: {
    nama_id: string;
    nama_en: string;
  }) => {
    if (!editingJenis) return;
    const result = await updateJenis(editingJenis.id, data);
    if (result) {
      addToast({
        type: "success",
        title: "Jenis berhasil diupdate!",
        message: `"${data.nama_id}" telah diperbarui.`,
      });
      setEditingJenis(null);
    } else {
      throw new Error("Gagal mengupdate jenis");
    }
  };

  const handleDeleteJenis = async () => {
    if (!deleteConfirm) return;

    // Check if jenis has sub_jenis
    const hasSubJenis = getSubJenisByJenisId(deleteConfirm.id).length > 0;
    if (hasSubJenis) {
      addToast({
        type: "error",
        title: "Tidak dapat menghapus",
        message:
          "Jenis ini memiliki Sub Jenis. Hapus Sub Jenis terlebih dahulu.",
      });
      setDeleteConfirm(null);
      return;
    }

    const result = await deleteJenis(deleteConfirm.id);
    if (result) {
      addToast({
        type: "success",
        title: "Jenis berhasil dihapus!",
        message: `"${deleteConfirm.name}" telah dihapus.`,
      });
    } else {
      addToast({
        type: "error",
        title: "Gagal menghapus jenis",
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
            Manajemen Jenis (Kategori)
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Kelola kategori utama produk seperti Roti, Kue, Pastry, dll.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingJenis(null);
            setShowForm(true);
          }}
          className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jenis</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari jenis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {jenisList.length}
              </p>
              <p className="text-sm text-gray-600">Total Jenis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Memuat data...</span>
        </div>
      ) : filteredJenis.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? "Tidak ditemukan" : "Belum ada Jenis"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? "Coba ubah kata kunci pencarian"
              : "Mulai dengan menambahkan Jenis pertama untuk mengkategorikan produk Anda"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Jenis Pertama</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama (ID)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama (EN)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sub Jenis
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJenis.map((jenis) => {
                const subJenisCount = getSubJenisByJenisId(jenis.id).length;
                return (
                  <tr key={jenis.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                          <Tag className="w-4 h-4 text-orange-600" />
                        </div>
                        <span className="font-medium text-gray-900">
                          {jenis.nama_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {jenis.nama_en}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          subJenisCount > 0
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {subJenisCount} sub jenis
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingJenis(jenis);
                            setShowForm(true);
                          }}
                          className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm({
                              id: jenis.id,
                              name: jenis.nama_id,
                            })
                          }
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
                  Apakah Anda yakin ingin menghapus Jenis{" "}
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
                    onClick={handleDeleteJenis}
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

      {/* Jenis Form Modal */}
      <JenisFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingJenis(null);
        }}
        onSubmit={editingJenis ? handleEditJenis : handleAddJenis}
        editingJenis={editingJenis}
        existingJenis={jenisList}
      />
    </div>
  );
}
