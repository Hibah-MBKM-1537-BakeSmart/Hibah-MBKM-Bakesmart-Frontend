'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Tag, AlertTriangle, Globe, Layers } from 'lucide-react';
import { useJenis } from '../../../app/contexts/JenisContext';
import { useSubJenis } from '../../../app/contexts/SubJenisContext';
import { Jenis, SubJenis } from '@/lib/types';
import { useToast } from '../Toast';

interface JenisManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

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
  const [namaId, setNamaId] = useState(editingJenis?.nama_id || '');
  const [namaEn, setNamaEn] = useState(editingJenis?.nama_en || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setNamaId(editingJenis?.nama_id || '');
      setNamaEn(editingJenis?.nama_en || '');
      setError('');
    }
  }, [isOpen, editingJenis]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!namaId.trim() || !namaEn.trim()) {
      setError('Nama Indonesia dan English wajib diisi');
      return;
    }

    // Check duplicate
    const isDuplicate = existingJenis.some(
      j => j.id !== editingJenis?.id && 
      (j.nama_id.toLowerCase() === namaId.toLowerCase() || 
       j.nama_en.toLowerCase() === namaEn.toLowerCase())
    );
    if (isDuplicate) {
      setError('Jenis dengan nama tersebut sudah ada');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ nama_id: namaId.trim(), nama_en: namaEn.trim() });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl">
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingJenis ? 'Edit Jenis (Kategori)' : 'Tambah Jenis (Kategori)'}
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
                {loading ? 'Menyimpan...' : editingJenis ? 'Update' : 'Tambah'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Add/Edit Sub Jenis Form Modal
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
  onSubmit: (data: { nama_id: string; nama_en: string; jenis_id: number }) => Promise<void>;
  editingSubJenis?: SubJenis | null;
  existingSubJenis: SubJenis[];
  jenisList: Jenis[];
}) {
  const [namaId, setNamaId] = useState(editingSubJenis?.nama_id || '');
  const [namaEn, setNamaEn] = useState(editingSubJenis?.nama_en || '');
  const [jenisId, setJenisId] = useState<number>(editingSubJenis?.jenis_id || (jenisList[0]?.id || 0));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setNamaId(editingSubJenis?.nama_id || '');
      setNamaEn(editingSubJenis?.nama_en || '');
      setJenisId(editingSubJenis?.jenis_id || (jenisList[0]?.id || 0));
      setError('');
    }
  }, [isOpen, editingSubJenis, jenisList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!namaId.trim() || !namaEn.trim()) {
      setError('Nama Indonesia dan English wajib diisi');
      return;
    }

    if (!jenisId) {
      setError('Pilih Jenis (Kategori Utama) terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ nama_id: namaId.trim(), nama_en: namaEn.trim(), jenis_id: jenisId });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl">
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingSubJenis ? 'Edit Sub Jenis' : 'Tambah Sub Jenis'}
              </h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Tag className="w-4 h-4 mr-1 text-orange-500" />
                    Jenis (Kategori Utama)
                  </label>
                  <select
                    value={jenisId}
                    onChange={(e) => setJenisId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  >
                    <option value="">Pilih Jenis...</option>
                    {jenisList.map(j => (
                      <option key={j.id} value={j.id}>{j.nama_id} ({j.nama_en})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Globe className="w-4 h-4 mr-1 text-red-500" />
                    Nama (Indonesia)
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
                    Nama (English)
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
                {loading ? 'Menyimpan...' : editingSubJenis ? 'Update' : 'Tambah'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function JenisManager({ isOpen, onClose }: JenisManagerProps) {
  const { jenisList, loading: loadingJenis, createJenis, updateJenis, deleteJenis } = useJenis();
  const { subJenisList, loading: loadingSubJenis, getSubJenisByJenisId, createSubJenis, updateSubJenis, deleteSubJenis } = useSubJenis();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'jenis' | 'sub_jenis'>('jenis');
  const [showJenisForm, setShowJenisForm] = useState(false);
  const [showSubJenisForm, setShowSubJenisForm] = useState(false);
  const [editingJenis, setEditingJenis] = useState<Jenis | null>(null);
  const [editingSubJenis, setEditingSubJenis] = useState<SubJenis | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'jenis' | 'sub_jenis'; id: number; name: string } | null>(null);
  const [expandedJenis, setExpandedJenis] = useState<number | null>(null);

  // Handlers for Jenis
  const handleAddJenis = async (data: { nama_id: string; nama_en: string }) => {
    const result = await createJenis(data);
    if (result) {
      addToast({
        type: 'success',
        title: 'Jenis berhasil ditambahkan!',
        message: `"${data.nama_id}" telah ditambahkan.`,
      });
    } else {
      throw new Error('Gagal menambahkan jenis');
    }
  };

  const handleEditJenis = async (data: { nama_id: string; nama_en: string }) => {
    if (!editingJenis) return;
    const result = await updateJenis(editingJenis.id, data);
    if (result) {
      addToast({
        type: 'success',
        title: 'Jenis berhasil diupdate!',
        message: `"${data.nama_id}" telah diperbarui.`,
      });
      setEditingJenis(null);
    } else {
      throw new Error('Gagal mengupdate jenis');
    }
  };

  const handleDeleteJenis = async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'jenis') return;
    
    // Check if jenis has sub_jenis
    const hasSubJenis = getSubJenisByJenisId(deleteConfirm.id).length > 0;
    if (hasSubJenis) {
      addToast({
        type: 'error',
        title: 'Tidak dapat menghapus',
        message: 'Jenis ini memiliki Sub Jenis. Hapus Sub Jenis terlebih dahulu.',
      });
      setDeleteConfirm(null);
      return;
    }

    const result = await deleteJenis(deleteConfirm.id);
    if (result) {
      addToast({
        type: 'success',
        title: 'Jenis berhasil dihapus!',
        message: `"${deleteConfirm.name}" telah dihapus.`,
      });
    } else {
      addToast({
        type: 'error',
        title: 'Gagal menghapus jenis',
        message: 'Terjadi kesalahan saat menghapus.',
      });
    }
    setDeleteConfirm(null);
  };

  // Handlers for Sub Jenis
  const handleAddSubJenis = async (data: { nama_id: string; nama_en: string; jenis_id: number }) => {
    const result = await createSubJenis(data);
    if (result) {
      addToast({
        type: 'success',
        title: 'Sub Jenis berhasil ditambahkan!',
        message: `"${data.nama_id}" telah ditambahkan.`,
      });
    } else {
      throw new Error('Gagal menambahkan sub jenis. Fitur ini sedang dalam perbaikan di backend.');
    }
  };

  const handleEditSubJenis = async (data: { nama_id: string; nama_en: string; jenis_id: number }) => {
    if (!editingSubJenis) return;
    const result = await updateSubJenis(editingSubJenis.id, data);
    if (result) {
      addToast({
        type: 'success',
        title: 'Sub Jenis berhasil diupdate!',
        message: `"${data.nama_id}" telah diperbarui.`,
      });
      setEditingSubJenis(null);
    } else {
      throw new Error('Gagal mengupdate sub jenis. Fitur ini sedang dalam perbaikan di backend.');
    }
  };

  const handleDeleteSubJenis = async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'sub_jenis') return;
    
    const result = await deleteSubJenis(deleteConfirm.id);
    if (result) {
      addToast({
        type: 'success',
        title: 'Sub Jenis berhasil dihapus!',
        message: `"${deleteConfirm.name}" telah dihapus.`,
      });
    } else {
      addToast({
        type: 'error',
        title: 'Gagal menghapus sub jenis',
        message: 'Fitur ini sedang dalam perbaikan di backend.',
      });
    }
    setDeleteConfirm(null);
  };

  if (!isOpen) return null;

  const loading = loadingJenis || loadingSubJenis;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black/30" onClick={onClose} />
        
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Manajemen Kategori Produk</h2>
                <p className="text-sm text-gray-600 mt-1">Kelola Jenis dan Sub Jenis produk</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
              >
                <span className="text-2xl leading-none">×</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('jenis')}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  activeTab === 'jenis'
                    ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Tag className="w-4 h-4 inline mr-2" />
                Jenis (Kategori Utama)
              </button>
              <button
                onClick={() => setActiveTab('sub_jenis')}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  activeTab === 'sub_jenis'
                    ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Layers className="w-4 h-4 inline mr-2" />
                Sub Jenis (Sub Kategori)
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-600">Memuat data...</span>
                </div>
              ) : activeTab === 'jenis' ? (
                /* Jenis Tab */
                <div className="space-y-3">
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => {
                        setEditingJenis(null);
                        setShowJenisForm(true);
                      }}
                      className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Jenis</span>
                    </button>
                  </div>

                  {jenisList.length === 0 ? (
                    <div className="text-center py-8">
                      <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada Jenis</h3>
                      <p className="text-gray-600">Mulai dengan menambahkan Jenis pertama</p>
                    </div>
                  ) : (
                    jenisList.map((jenis) => {
                      const subJenisCount = getSubJenisByJenisId(jenis.id).length;
                      return (
                        <div
                          key={jenis.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <Tag className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{jenis.nama_id}</h4>
                              <p className="text-sm text-gray-500">EN: {jenis.nama_en} • {subJenisCount} sub jenis</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingJenis(jenis);
                                setShowJenisForm(true);
                              }}
                              className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ type: 'jenis', id: jenis.id, name: jenis.nama_id })}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                /* Sub Jenis Tab */
                <div className="space-y-3">
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => {
                        setEditingSubJenis(null);
                        setShowSubJenisForm(true);
                      }}
                      className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
                      disabled={jenisList.length === 0}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Sub Jenis</span>
                    </button>
                  </div>

                  {jenisList.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Tambahkan Jenis Terlebih Dahulu</h3>
                      <p className="text-gray-600">Sub Jenis memerlukan Jenis sebagai parent</p>
                    </div>
                  ) : subJenisList.length === 0 ? (
                    <div className="text-center py-8">
                      <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada Sub Jenis</h3>
                      <p className="text-gray-600">Mulai dengan menambahkan Sub Jenis pertama</p>
                    </div>
                  ) : (
                    /* Show all sub_jenis - grouped by Jenis if jenis_id available, otherwise ungrouped */
                    <>
                      {/* Grouped sub_jenis by Jenis */}
                      {jenisList.map((jenis) => {
                        const subJenisForJenis = getSubJenisByJenisId(jenis.id);
                        if (subJenisForJenis.length === 0) return null;
                        
                        return (
                          <div key={jenis.id} className="border border-gray-200 rounded-lg overflow-hidden mb-3">
                            <button
                              onClick={() => setExpandedJenis(expandedJenis === jenis.id ? null : jenis.id)}
                              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <Tag className="w-5 h-5 text-orange-600" />
                                <span className="font-medium">{jenis.nama_id}</span>
                                <span className="text-sm text-gray-500">({subJenisForJenis.length})</span>
                              </div>
                              <span className="text-gray-400">{expandedJenis === jenis.id ? '▼' : '▶'}</span>
                            </button>
                            
                            {expandedJenis === jenis.id && (
                              <div className="p-3 space-y-2">
                                {subJenisForJenis.map((sj) => (
                                  <div
                                    key={sj.id}
                                    className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <Layers className="w-4 h-4 text-blue-500" />
                                      <div>
                                        <span className="font-medium text-gray-900">{sj.nama_id}</span>
                                        <span className="text-sm text-gray-500 ml-2">EN: {sj.nama_en}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => {
                                          setEditingSubJenis(sj);
                                          setShowSubJenisForm(true);
                                        }}
                                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirm({ type: 'sub_jenis', id: sj.id, name: sj.nama_id })}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Ungrouped sub_jenis (jenis_id = 0 or not matching any jenis) */}
                      {(() => {
                        const ungroupedSubJenis = subJenisList.filter(sj => 
                          !sj.jenis_id || sj.jenis_id === 0 || !jenisList.some(j => j.id === sj.jenis_id)
                        );
                        
                        if (ungroupedSubJenis.length === 0) return null;
                        
                        return (
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => setExpandedJenis(expandedJenis === -1 ? null : -1)}
                              className="w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <Layers className="w-5 h-5 text-gray-500" />
                                <span className="font-medium text-gray-700">Tanpa Kategori</span>
                                <span className="text-sm text-gray-500">({ungroupedSubJenis.length})</span>
                              </div>
                              <span className="text-gray-400">{expandedJenis === -1 ? '▼' : '▶'}</span>
                            </button>
                            
                            {expandedJenis === -1 && (
                              <div className="p-3 space-y-2">
                                {ungroupedSubJenis.map((sj) => (
                                  <div
                                    key={sj.id}
                                    className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <Layers className="w-4 h-4 text-blue-500" />
                                      <div>
                                        <span className="font-medium text-gray-900">{sj.nama_id}</span>
                                        <span className="text-sm text-gray-500 ml-2">EN: {sj.nama_en}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => {
                                          setEditingSubJenis(sj);
                                          setShowSubJenisForm(true);
                                        }}
                                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirm({ type: 'sub_jenis', id: sj.id, name: sj.nama_id })}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="fixed inset-0 bg-black/40" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Hapus</h3>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Apakah Anda yakin ingin menghapus {deleteConfirm.type === 'jenis' ? 'Jenis' : 'Sub Jenis'}{' '}
                  <strong>"{deleteConfirm.name}"</strong>? Tindakan ini tidak dapat dibatalkan.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={deleteConfirm.type === 'jenis' ? handleDeleteJenis : handleDeleteSubJenis}
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
        isOpen={showJenisForm}
        onClose={() => {
          setShowJenisForm(false);
          setEditingJenis(null);
        }}
        onSubmit={editingJenis ? handleEditJenis : handleAddJenis}
        editingJenis={editingJenis}
        existingJenis={jenisList}
      />

      {/* Sub Jenis Form Modal */}
      <SubJenisFormModal
        isOpen={showSubJenisForm}
        onClose={() => {
          setShowSubJenisForm(false);
          setEditingSubJenis(null);
        }}
        onSubmit={editingSubJenis ? handleEditSubJenis : handleAddSubJenis}
        editingSubJenis={editingSubJenis}
        existingSubJenis={subJenisList}
        jenisList={jenisList}
      />
    </>
  );
}

// Export with alias for backwards compatibility
export { JenisManager as CategoryManager };
