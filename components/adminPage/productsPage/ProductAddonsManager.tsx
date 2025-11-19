'use client';

import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export interface ProductAddon {
  id: number;
  nama: string;
  harga_tambahan: number;
  is_active: boolean;
}

interface ProductAddonsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  addons: ProductAddon[];
  onSave: (addons: ProductAddon[]) => void;
}

export function ProductAddonsManager({
  isOpen,
  onClose,
  productName,
  addons: initialAddons,
  onSave
}: ProductAddonsManagerProps) {
  const [addons, setAddons] = useState<ProductAddon[]>(initialAddons);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nama: '', harga_tambahan: 0 });

  if (!isOpen) return null;

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({ nama: '', harga_tambahan: 0 });
  };

  const handleEdit = (addon: ProductAddon) => {
    setEditingId(addon.id);
    setFormData({ nama: addon.nama, harga_tambahan: addon.harga_tambahan });
  };

  const handleSaveNew = () => {
    if (!formData.nama.trim()) return;
    
    const newAddon: ProductAddon = {
      id: Date.now(), // Temporary ID, will be replaced by API
      nama: formData.nama.trim(),
      harga_tambahan: formData.harga_tambahan,
      is_active: true
    };
    
    setAddons([...addons, newAddon]);
    setIsAdding(false);
    setFormData({ nama: '', harga_tambahan: 0 });
  };

  const handleSaveEdit = () => {
    if (!formData.nama.trim()) return;
    
    setAddons(addons.map(addon => 
      addon.id === editingId
        ? { ...addon, nama: formData.nama.trim(), harga_tambahan: formData.harga_tambahan }
        : addon
    ));
    
    setEditingId(null);
    setFormData({ nama: '', harga_tambahan: 0 });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ nama: '', harga_tambahan: 0 });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this addon?')) {
      setAddons(addons.filter(addon => addon.id !== id));
    }
  };

  const handleToggleActive = (id: number) => {
    setAddons(addons.map(addon =>
      addon.id === id ? { ...addon, is_active: !addon.is_active } : addon
    ));
  };

  const handleSaveAll = () => {
    onSave(addons);
    onClose();
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      
      {/* Modal */}
      <div 
        className="relative z-10 bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Manage Product Addons
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {productName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Add New Button */}
          {!isAdding && !editingId && (
            <button
              onClick={handleAdd}
              className="w-full mb-4 p-3 border-2 border-dashed border-orange-300 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add New Addon</span>
            </button>
          )}

          {/* Add/Edit Form */}
          {(isAdding || editingId !== null) && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {isAdding ? 'New Addon' : 'Edit Addon'}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Addon Name
                  </label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="e.g., Extra Cheese"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Price
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.harga_tambahan || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                      const numValue = value === '' ? 0 : parseInt(value, 10);
                      setFormData({ ...formData, harga_tambahan: numValue });
                    }}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={isAdding ? handleSaveNew : handleSaveEdit}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Addons List */}
          <div className="space-y-2">
            {addons.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-sm">No addons yet</p>
                <p className="text-xs mt-1">Click "Add New Addon" to create one</p>
              </div>
            ) : (
              addons.map((addon) => (
                <div
                  key={addon.id}
                  className={`p-4 rounded-lg border transition-all ${
                    addon.is_active
                      ? 'bg-white border-gray-200'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-gray-900">
                          {addon.nama}
                        </h4>
                        {!addon.is_active && (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {addon.harga_tambahan > 0 
                          ? `+${formatPrice(addon.harga_tambahan)}`
                          : 'Free'
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Toggle Active */}
                      <button
                        onClick={() => handleToggleActive(addon.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title={addon.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {addon.is_active ? (
                          <ToggleRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEdit(addon)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                        title="Edit"
                        disabled={editingId !== null || isAdding}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(addon.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                        title="Delete"
                        disabled={editingId !== null || isAdding}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {addons.length} addon(s) • {addons.filter(a => a.is_active).length} active
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
