'use client';

import React from 'react';
import { X, Package, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { Product } from '@/app/contexts/ProductsContext';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function ProductDetailModal({ isOpen, onClose, product }: ProductDetailModalProps) {
  if (!isOpen || !product) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  // TEMPORARY: Preview data untuk hari ketersediaan
  // TODO: Nanti akan diganti dengan data dari backend
  const previewHariTersedia = product.hari_tersedia && product.hari_tersedia.length > 0 
    ? product.hari_tersedia 
    : ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']; // Data preview/dummy

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl bg-white shadow-xl border border-gray-200">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">Detail Produk</h3>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100" aria-label="Close">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center flex-shrink-0">
              {product.gambars && product.gambars.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.gambars[0].file_path} alt={product.nama} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-8 h-8 text-orange-600" />
              )}
            </div>

            <div className="min-w-0">
              <h4 className="text-xl font-semibold text-gray-900 truncate mb-1">{product.nama}</h4>
              {product.jenis?.[0]?.nama && (
                <p className="text-sm text-gray-600">Kategori: {product.jenis[0].nama}</p>
              )}
              <p className="mt-2 text-gray-700 whitespace-pre-line">{product.deskripsi}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-600">Harga</p>
              <p className="text-lg font-semibold">{formatPrice(product.harga)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-600">Stok</p>
              <p className="text-lg font-semibold">{product.stok} unit</p>
            </div>
            <div className="rounded-lg border p-4 sm:col-span-2">
              <p className="text-sm text-gray-600">Penjualan</p>
              <p className="text-lg font-semibold">{product.sales ?? 0}</p>
            </div>
          </div>

          {/* Hari Ketersediaan Section - PREVIEW MODE */}
          <div className="rounded-lg border border-gray-200">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <h4 className="text-sm font-semibold text-gray-900">Hari Ketersediaan</h4>
                <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                  Preview Mode
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Produk tersedia pada {previewHariTersedia.length} hari (data preview)
              </p>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {previewHariTersedia.map((hari, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {hari}
                  </span>
                ))}
              </div>
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>⚠️ Preview:</strong> Ini adalah data contoh. Setelah backend siap, data akan diambil dari <code className="bg-yellow-100 px-1 py-0.5 rounded">product.hari</code> atau <code className="bg-yellow-100 px-1 py-0.5 rounded">product.hari_tersedia</code>
                </p>
              </div>
            </div>
          </div>

          {/* Hari Ketersediaan Section - ORIGINAL (akan aktif saat backend siap)
          {product.hari_tersedia && product.hari_tersedia.length > 0 && (
            <div className="rounded-lg border border-gray-200">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <h4 className="text-sm font-semibold text-gray-900">Hari Ketersediaan</h4>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  Produk tersedia pada {product.hari_tersedia.length} hari
                </p>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {product.hari_tersedia.map((hari, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {hari}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          */}

          {/* Attributes/Add-ons from Backend */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="rounded-lg border border-gray-200">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                <h4 className="text-sm font-semibold text-gray-900">Add-ons Tersedia</h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  {product.attributes.length} add-on(s) tersedia
                </p>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {product.attributes.map((attribute) => (
                    <div 
                      key={attribute.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-200"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {attribute.nama}
                          </p>
                          {(attribute.nama_id || attribute.nama_en) && (
                            <p className="text-xs text-gray-600">
                              {attribute.nama_id && `ID: ${attribute.nama_id}`}
                              {attribute.nama_id && attribute.nama_en && ' • '}
                              {attribute.nama_en && `EN: ${attribute.nama_en}`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {attribute.harga && attribute.harga > 0
                            ? `+${formatPrice(attribute.harga)}`
                            : 'Gratis'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Product Addons Section (Frontend managed) */}
          {product.addons && product.addons.length > 0 && (
            <div className="rounded-lg border border-gray-200">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                <h4 className="text-sm font-semibold text-gray-900">Product Addons</h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  {product.addons.length} addon(s) • {product.addons.filter(a => a.is_active).length} active
                </p>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {product.addons.map((addon) => (
                    <div 
                      key={addon.id} 
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        addon.is_active ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {addon.is_active ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                        <div>
                          <p className={`font-medium ${addon.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                            {addon.nama}
                          </p>
                          <p className="text-xs text-gray-600">
                            {addon.is_active ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${addon.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                          {addon.harga_tambahan > 0 
                            ? `+${formatPrice(addon.harga_tambahan)}`
                            : 'Free'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t flex-shrink-0 bg-white">
          <button onClick={onClose} className="px-4 py-2 rounded-md border hover:bg-gray-50">Tutup</button>
        </div>
      </div>
    </div>
  );
}
