'use client';

import React, { useState } from 'react';
import { useKasir } from '@/app/contexts/KasirContext';
import { Package, Plus, Minus, ShoppingCart, Settings } from 'lucide-react';
import { ProductCustomizationModal } from './ProductCustomizationModal';

export function ProductGrid() {
  const { state, addToCart } = useKasir();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);

  // Show loading state
  if (state.isLoadingProducts) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat produk...</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (state.products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Tidak ada produk tersedia</p>
          {!state.isApiConnected && (
            <p className="text-sm text-orange-500 mt-2">API tidak terhubung - pastikan server berjalan</p>
          )}
        </div>
      </div>
    );
  }
  
  const filteredProducts = state.products.filter(product => {
    if (state.selectedCategory === 'All') return true;
    // Check if any of the product's jenis matches the selected category
    return product.jenis?.some(j => j.nama_id === state.selectedCategory);
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3 md:gap-4 2xl:gap-2">
      {filteredProducts.map((product) => {
        const cartQuantity = getCartQuantity(product.id);
        const isOutOfStock = product.stok === 0;
        
        return (
          <div
            key={product.id}
            className={`bg-white rounded-xl 2xl:rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
              isOutOfStock ? 'opacity-50' : ''
            }`}
          >
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 relative">
              <img
                src={product.gambars?.[0]?.file_path || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjY2NjIiBmb250LXNpemU9IjE0Ij5Ob0ltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                alt={product.nama_id}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjY2NjIiBmb250LXNpemU9IjE0Ij5Ob0ltYWdlPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
              
              {/* Badges Container - Top Row */}
              <div className="absolute top-2 2xl:top-1.5 left-2 2xl:left-1.5 right-2 2xl:right-1.5 flex justify-between items-start gap-1">
                {/* Category Badge - More compact on large screens */}
                <div className="bg-orange-500 text-white rounded-full px-2.5 2xl:px-2 py-1 2xl:py-0.5 text-xs 2xl:text-[10px] font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[calc(100%-70px)] 2xl:max-w-[calc(100%-55px)]">
                  {product.jenis?.[0]?.nama_id || 'Umum'}
                </div>
                
                {/* Stock Badge - More compact on large screens */}
                <div className="bg-white rounded-full px-2.5 2xl:px-1.5 py-1 2xl:py-0.5 text-xs 2xl:text-[10px] font-medium whitespace-nowrap flex-shrink-0 shadow-sm">
                  {isOutOfStock ? (
                    <span className="text-red-600">0 stok</span>
                  ) : (
                    <span className="text-green-600">{product.stok} stok</span>
                  )}
                </div>
              </div>

              {/* Cart Quantity Indicator */}
              {cartQuantity > 0 && (
                <div className="absolute bottom-2 right-2 bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {cartQuantity}
                </div>
              )}
            </div>

            {/* Product Info - More compact on large screens */}
            <div className="p-3 md:p-4 2xl:p-2.5">
              <h3 className="font-semibold text-gray-900 text-sm md:text-base 2xl:text-sm mb-1 line-clamp-2 min-h-[2.5rem] 2xl:min-h-[2rem]">
                {product.nama_id}
              </h3>
              
              {product.deskripsi_id && (
                <p className="text-xs text-gray-600 mb-2 2xl:mb-1 line-clamp-1 2xl:hidden">
                  {product.deskripsi_id}
                </p>
              )}
              
              <div className="flex items-center justify-between mb-2 md:mb-3 2xl:mb-2">
                <span className="text-base md:text-lg 2xl:text-base font-bold text-orange-600">
                  {formatPrice(product.harga)}
                </span>
              </div>

              {/* Action Buttons - More compact on large screens */}
              <div className="space-y-2 2xl:space-y-1.5">
                {/* Customize Button */}
                <button
                  onClick={() => handleCustomize(product)}
                  disabled={isOutOfStock}
                  className={`w-full flex items-center justify-center space-x-2 2xl:space-x-1 py-2 2xl:py-1.5 px-3 2xl:px-2 rounded-lg font-medium transition-all duration-200 ${
                    isOutOfStock
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  <Settings className="w-4 h-4 2xl:w-3.5 2xl:h-3.5" />
                  <span className="text-sm 2xl:text-xs">Kustomisasi</span>
                </button>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={isOutOfStock}
                  className={`w-full flex items-center justify-center space-x-2 2xl:space-x-1 py-2 2xl:py-1.5 px-3 2xl:px-2 rounded-lg font-medium transition-all duration-200 ${
                    isOutOfStock
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : cartQuantity > 0
                      ? 'bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200'
                      : 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm hover:shadow-md'
                  }`}
                >
                  {isOutOfStock ? (
                    <>
                      <Package className="w-4 h-4 2xl:w-3.5 2xl:h-3.5" />
                      <span className="text-sm 2xl:text-xs">Stok Habis</span>
                    </>
                  ) : cartQuantity > 0 ? (
                    <>
                      <Plus className="w-4 h-4 2xl:w-3.5 2xl:h-3.5" />
                      <span className="text-sm 2xl:text-xs">Tambah Lagi</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 2xl:w-3.5 2xl:h-3.5" />
                      <span className="text-sm 2xl:text-xs">Tambah</span>
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
