'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Settings } from 'lucide-react';
import { useKasir } from '@/app/contexts/KasirContext';

interface ProductCustomizationModalProps {
  product: any | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ProductAttribute {
  id: number;
  nama: string;
  nama_id?: string;
  nama_en?: string;
  harga?: number;
  harga_tambahan: number;
}

export function ProductCustomizationModal({ product, isOpen, onClose }: ProductCustomizationModalProps) {
  const { addToCart } = useKasir();
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<number[]>([]);
  const [customNote, setCustomNote] = useState('');

  // Get attributes from backend product data
  const availableAttributes: ProductAttribute[] = React.useMemo(() => {
    if (!product?.attributes || product.attributes.length === 0) {
      return [];
    }
    
    // Transform backend attributes to our format
    return product.attributes
      .filter((attr: any) => attr && attr.id) // Filter out null/invalid attributes
      .map((attr: any) => ({
        id: attr.id,
        nama: attr.nama_id || attr.nama_en || 'Unnamed',
        nama_id: attr.nama_id,
        nama_en: attr.nama_en,
        harga: attr.harga,
        harga_tambahan: attr.harga || 0
      }));
  }, [product]);

  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setSelectedAttributes([]);
      setCustomNote('');
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleAttributeToggle = (attributeId: number) => {
    setSelectedAttributes(prev => 
      prev.includes(attributeId)
        ? prev.filter(id => id !== attributeId)
        : [...prev, attributeId]
    );
  };

  const calculateTotalPrice = () => {
    const basePrice = product.harga || 0;
    const attributePrice = selectedAttributes.reduce((total, attrId) => {
      const attr = availableAttributes.find(a => a.id === attrId);
      return total + (attr?.harga_tambahan || 0);
    }, 0);
    return (basePrice + attributePrice) * quantity;
  };

  const handleAddToCart = () => {
    const selectedAttrDetails = availableAttributes.filter(attr => 
      selectedAttributes.includes(attr.id)
    );

    const finalPrice = calculateTotalPrice() / quantity; // Price per item with customizations

    addToCart(
      product, 
      quantity, 
      customNote.trim() || undefined,
      selectedAttrDetails.length > 0 ? selectedAttrDetails : undefined,
      selectedAttrDetails.length > 0 ? finalPrice : undefined
    );
    
    onClose();
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ 
        backgroundColor: 'rgba(139, 111, 71, 0.1)',
        backdropFilter: 'blur(2px)'
      }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col"
        style={{ borderColor: '#e0d5c7' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0" style={{ borderColor: '#e0d5c7' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Settings className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold font-admin-heading" style={{ color: '#5d4037' }}>
                Kustomisasi Produk
              </h2>
              <p className="text-sm font-admin-body" style={{ color: '#8b6f47' }}>
                {product.nama_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" style={{ color: '#8b6f47' }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Product Info */}
            <div className="flex gap-4">
              <img
                src={product.gambars?.[0]?.file_path || '/placeholder.svg'}
                alt={product.nama_id}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-medium font-admin-heading" style={{ color: '#5d4037' }}>
                  {product.nama_id}
                </h3>
                <p className="text-sm font-admin-body" style={{ color: '#8b6f47' }}>
                  {product.deskripsi_id}
                </p>
                <p className="text-lg font-semibold mt-1" style={{ color: '#8b6f47' }}>
                  {formatPrice(product.harga || 0)}
                </p>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium mb-3 font-admin-body" style={{ color: '#5d4037' }}>
                Jumlah
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#8b6f47', color: '#8b6f47' }}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-semibold min-w-[3rem] text-center" style={{ color: '#5d4037' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#8b6f47', color: '#8b6f47' }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Customization Options */}
            <div>
              <label className="block text-sm font-medium mb-3 font-admin-body" style={{ color: '#5d4037' }}>
                Pilihan Kustomisasi
              </label>
              {availableAttributes.length === 0 ? (
                <div className="p-4 text-center border border-gray-200 rounded-lg" style={{ borderColor: '#e0d5c7' }}>
                  <p className="text-sm text-gray-500">Produk ini tidak memiliki opsi kustomisasi</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableAttributes.map((attribute) => (
                    <div
                      key={attribute.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedAttributes.includes(attribute.id)
                          ? 'border-orange-300 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-200'
                      }`}
                      style={{
                        borderColor: selectedAttributes.includes(attribute.id) ? '#fed7aa' : '#e0d5c7',
                        backgroundColor: selectedAttributes.includes(attribute.id) ? '#fff7ed' : 'white'
                      }}
                      onClick={() => handleAttributeToggle(attribute.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedAttributes.includes(attribute.id)}
                            onChange={() => handleAttributeToggle(attribute.id)}
                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                          />
                          <span className="font-medium font-admin-body" style={{ color: '#5d4037' }}>
                            {attribute.nama}
                          </span>
                        </div>
                        <span className="text-sm font-admin-body" style={{ color: '#8b6f47' }}>
                          {attribute.harga_tambahan > 0 ? `+${formatPrice(attribute.harga_tambahan)}` : 'Gratis'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Note */}
            <div>
              <label className="block text-sm font-medium mb-2 font-admin-body" style={{ color: '#5d4037' }}>
                Catatan Khusus
              </label>
              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Tambahkan catatan khusus untuk produk ini..."
                className="w-full p-3 border border-gray-200 rounded-lg resize-none font-admin-body"
                style={{ borderColor: '#e0d5c7', minHeight: '80px' }}
                rows={3}
              />
            </div>

            {/* Price Summary */}
            <div className="bg-gray-50 rounded-lg p-4" style={{ backgroundColor: '#fefdf8' }}>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-admin-body">
                  <span style={{ color: '#8b6f47' }}>Harga Dasar</span>
                  <span style={{ color: '#8b6f47' }}>{formatPrice((product.harga || 0) * quantity)}</span>
                </div>
                {selectedAttributes.length > 0 && (
                  <div className="flex justify-between text-sm font-admin-body">
                    <span style={{ color: '#8b6f47' }}>Kustomisasi</span>
                    <span style={{ color: '#8b6f47' }}>
                      +{formatPrice(selectedAttributes.reduce((total, attrId) => {
                        const attr = availableAttributes.find(a => a.id === attrId);
                        return total + (attr?.harga_tambahan || 0);
                      }, 0) * quantity)}
                    </span>
                  </div>
                )}
                <hr style={{ borderColor: '#e0d5c7' }} />
                <div className="flex justify-between text-lg font-semibold font-admin-heading">
                  <span style={{ color: '#5d4037' }}>Total</span>
                  <span style={{ color: '#5d4037' }}>{formatPrice(calculateTotalPrice())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 flex-shrink-0" style={{ borderColor: '#e0d5c7' }}>
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg font-admin-body hover:bg-gray-50 transition-colors"
            style={{ color: '#8b6f47', borderColor: '#e0d5c7' }}
          >
            Batal
          </button>
          <button
            onClick={handleAddToCart}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg font-admin-body hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah ke Keranjang
          </button>
        </div>
      </div>
    </div>
  );
}