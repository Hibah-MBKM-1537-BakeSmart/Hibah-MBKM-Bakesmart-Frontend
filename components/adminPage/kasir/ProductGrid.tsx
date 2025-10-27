'use client';

import React, { useState } from 'react';
import { useKasir } from '@/app/contexts/KasirContext';
import { Package, Plus, Minus, ShoppingCart, Settings } from 'lucide-react';
import { ProductCustomizationModal } from './ProductCustomizationModal';

export function ProductGrid() {
  const { state, addToCart } = useKasir();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  
  const filteredProducts = state.products.filter(product => {
    if (state.selectedCategory === 'All') return true;
    return product.jenis?.[0]?.nama === state.selectedCategory;
  });

  const formatPrice = (price: number) => {
    if (typeof price !== 'number' || isNaN(price)) {
      return 'Rp 0';
    }
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const getCartQuantity = (productId: number) => {
    const cartItem = state.cart.find(item => item.product.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
  };

  const handleCustomize = (product: any) => {
    setSelectedProduct(product);
    setShowCustomizationModal(true);
  };

  const handleCloseCustomization = () => {
    setShowCustomizationModal(false);
    setSelectedProduct(null);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {filteredProducts.map((product) => {
        const cartQuantity = getCartQuantity(product.id);
        const isOutOfStock = product.stok === 0;
        
        return (
          <div
            key={product.id}
            className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-105 ${
              isOutOfStock ? 'opacity-50' : ''
            }`}
          >
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 relative">
              <img
                src={product.gambars?.[0]?.file_path || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjY2NjIiBmb250LXNpemU9IjE0Ij5Ob0ltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                alt={product.nama}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjY2NjIiBmb250LXNpemU9IjE0Ij5Ob0ltYWdlPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
              
              {/* Stock Badge */}
              <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium">
                {isOutOfStock ? (
                  <span className="text-red-600">Habis</span>
                ) : (
                  <span className="text-green-600">{product.stok} stok</span>
                )}
              </div>

              {/* Category Badge */}
              <div className="absolute top-2 left-2 bg-orange-500 text-white rounded-full px-2 py-1 text-xs font-medium">
                {product.jenis?.[0]?.nama || 'Umum'}
              </div>

              {/* Cart Quantity Indicator */}
              {cartQuantity > 0 && (
                <div className="absolute bottom-2 right-2 bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {cartQuantity}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                {product.nama}
              </h3>
              
              {product.deskripsi && (
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {product.deskripsi}
                </p>
              )}
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-orange-600">
                  {formatPrice(product.harga)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {/* Customize Button */}
                <button
                  onClick={() => handleCustomize(product)}
                  disabled={isOutOfStock}
                  className={`w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg font-medium transition-all duration-200 ${
                    isOutOfStock
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Kustomisasi</span>
                </button>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={isOutOfStock}
                  className={`w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg font-medium transition-all duration-200 ${
                    isOutOfStock
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : cartQuantity > 0
                      ? 'bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200'
                      : 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm hover:shadow-md'
                  }`}
                >
                  {isOutOfStock ? (
                    <>
                      <Package className="w-4 h-4" />
                      <span className="text-sm">Stok Habis</span>
                    </>
                  ) : cartQuantity > 0 ? (
                    <>
                      <Plus className="w-4 h-4" />
                      <span className="text-sm">Tambah Lagi</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span className="text-sm">Tambah</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
      
      {filteredProducts.length === 0 && (
        <div className="col-span-full text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada produk ditemukan
          </h3>
          <p className="text-gray-600">
            Coba pilih kategori lain atau ubah kata kunci pencarian
          </p>
        </div>
      )}
      
      {/* Product Customization Modal */}
      <ProductCustomizationModal
        product={selectedProduct}
        isOpen={showCustomizationModal}
        onClose={handleCloseCustomization}
      />
    </div>
  );
}
