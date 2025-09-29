"use client";

import { X, ShoppingCart, Plus, Eye, Edit2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/app/contexts/CartContext";
import { useTranslation } from "@/app/contexts/TranslationContext";
import { EditCustomizationModal } from "./EditCustomizationModal";
import type { MenuItem, ProductAttribute } from "@/lib/api/mockData";

interface ExistingCustomizationModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddNewCustomization: () => void;
}

export function ExistingCustomizationModal({
  item,
  isOpen,
  onClose,
  onAddNewCustomization,
}: ExistingCustomizationModalProps) {
  const { t, language } = useTranslation();
  const { cartItems, addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCartItem, setEditingCartItem] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    // Reset selected variant when modal opens
    if (isOpen) {
      setSelectedVariant(null);
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  // Get all cart items for this product
  const productCartItems = cartItems.filter(
    (cartItem) => cartItem.id === item.id
  );

  if (productCartItems.length === 0) {
    onClose();
    return null;
  }

  // Group cart items by their customization
  const cartVariants = productCartItems.map((cartItem, index) => {
    const attributesKey = (cartItem.selectedAttributes || [])
      .map(
        (attr) =>
          `${attr.id}-${language === "en" ? attr.nama_en : attr.nama_id}`
      )
      .sort()
      .join("|");

    return {
      id: `variant-${index}`,
      cartId: cartItem.cartId,
      cartItem,
      attributes: cartItem.selectedAttributes || [],
      quantity: cartItem.quantity,
      orderDay: cartItem.orderDay,
      displayName:
        cartItem.selectedAttributes && cartItem.selectedAttributes.length > 0
          ? `Dengan ${cartItem.selectedAttributes
              .map((attr) => (language === "en" ? attr.nama_en : attr.nama_id))
              .join(", ")}`
          : "Tanpa pilihan tambahan",
      attributesKey,
    };
  });

  const handleAddSameCustomization = (cartItem: any) => {
    // Create new item with same customization
    const itemToAdd = {
      id: item.id,
      nama_id: item.nama_id,
      nama_en: item.nama_en,
      harga: item.harga,
      harga_diskon: item.harga_diskon,
      gambars: item.gambars,
      jenis: item.jenis,
      stok: item.stok,
      hari: item.hari,
      orderDay: cartItem.orderDay,
      selectedAttributes: cartItem.selectedAttributes || [],
    };

    const success = addToCart(itemToAdd);
    if (success) {
      onClose();
    }
  };

  const handleEditCustomization = (cartItem: any) => {
    setEditingCartItem(cartItem);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingCartItem(null);
  };

  const handleAddNewCustomization = () => {
    onAddNewCustomization();
  };

  const getDayLabel = (day: string) => {
    const dayLabels: { [key: string]: string } = {
      senin: t("day.monday"),
      selasa: t("day.tuesday"),
      rabu: t("day.wednesday"),
      kamis: t("day.thursday"),
      jumat: t("day.friday"),
      sabtu: t("day.saturday"),
      minggu: t("day.sunday"),
    };
    return dayLabels[day] || day;
  };

  // Calculate price including attributes
  const calculatePrice = (attributes: ProductAttribute[]) => {
    const basePrice = item!.harga_diskon || item!.harga;
    const attributesPrice = attributes.reduce(
      (total, attr) => total + (attr?.harga || 0),
      0
    );
    return basePrice + attributesPrice;
  };

  const shouldShowDiscount =
    item.harga_diskon && item.harga_diskon < item.harga;
  const isOutOfStock = item.stok <= 0;
  const totalQuantityInCart = cartVariants.reduce(
    (sum, variant) => sum + variant.quantity,
    0
  );
  const itemName = language === "en" ? item.nama_en : item.nama_id;
  const itemImage = item.gambars?.[0]?.file_path || "/placeholder.svg";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-hidden"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl transform transition-all duration-200 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Pilih Varian yang Ingin Ditambahkan
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Item sudah ada di keranjang - pilih varian yang ingin
                ditambahkan
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[65vh]">
            <div className="p-6">
              {/* Item Info */}
              <div className="flex gap-4 mb-6">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={itemImage || "/placeholder.svg"}
                    alt={itemName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{itemName}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      Total di keranjang: {totalQuantityInCart}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {cartVariants.length} varian
                    </span>
                  </div>
                </div>
              </div>

              {/* Existing Variants */}
              <div className="space-y-3 mb-6">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Eye size={16} />
                  Varian yang Sudah Ada di Keranjang:
                </h4>

                {cartVariants.map((variant, index) => {
                  const totalPrice = calculatePrice(variant.attributes);
                  const formattedTotalPrice = `Rp${totalPrice.toLocaleString(
                    "id-ID"
                  )}`;
                  const isSelected = selectedVariant === variant.id;

                  return (
                    <div
                      key={variant.id}
                      className={`border rounded-lg p-4 transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#8B6F47] bg-[#8B6F47]/5 ring-2 ring-[#8B6F47]/20"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedVariant(variant.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              #{index + 1} - {variant.displayName}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                              {getDayLabel(variant.orderDay)}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              Qty: {variant.quantity}
                            </span>
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-2 mb-3">
                            {shouldShowDiscount && (
                              <span className="text-sm text-gray-400 line-through">
                                Rp{item.harga.toLocaleString("id-ID")}
                              </span>
                            )}
                            <span className="text-lg font-semibold text-gray-900">
                              {formattedTotalPrice}
                            </span>
                            {shouldShowDiscount && (
                              <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded">
                                Promo
                              </span>
                            )}
                          </div>

                          {/* Attributes Details */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            {variant.attributes.length > 0 ? (
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-700 mb-2">
                                  Detail Kustomisasi:
                                </p>
                                {variant.attributes.map((attr) => {
                                  const attrName =
                                    language === "en"
                                      ? attr.nama_en
                                      : attr.nama_id;
                                  return (
                                    <div
                                      key={attr.id}
                                      className="flex justify-between items-center text-sm"
                                    >
                                      <span className="text-gray-700">
                                        ✓ {attrName}
                                      </span>
                                      <span className="text-gray-600">
                                        +Rp{attr.harga.toLocaleString("id-ID")}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600">
                                Tanpa pilihan tambahan
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCustomization(variant.cartItem);
                          }}
                          className="ml-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                          title="Edit kustomisasi"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>

                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-[#8B6F47] font-medium flex items-center gap-2">
                            <ShoppingCart size={14} />
                            Klik "Tambah Varian Ini" untuk menambah 1 lagi
                            dengan kustomisasi yang sama
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 border-t pt-4">
                {selectedVariant && (
                  <button
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      isOutOfStock
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                        : "bg-[#5D4037] text-white hover:bg-[#8B6F47] hover:scale-105 active:scale-95"
                    }`}
                    onClick={() => {
                      const selected = cartVariants.find(
                        (v) => v.id === selectedVariant
                      );
                      if (selected) {
                        handleAddSameCustomization(selected.cartItem);
                      }
                    }}
                    disabled={isOutOfStock}
                  >
                    <ShoppingCart size={18} />
                    {isOutOfStock
                      ? "Stok Habis"
                      : `Tambah Varian Terpilih (+1)`}
                  </button>
                )}

                <button
                  className="w-full px-4 py-3 rounded-lg font-medium border-2 border-[#8B6F47] text-[#8B6F47] hover:bg-[#8B6F47] hover:text-white transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                  onClick={handleAddNewCustomization}
                >
                  <Plus size={18} />
                  Buat Kustomisasi Baru
                </button>

                {!selectedVariant && (
                  <p className="text-center text-sm text-gray-500 mt-2">
                    👆 Pilih varian di atas untuk menambahkannya, atau buat
                    kustomisasi baru
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Customization Modal */}
      <EditCustomizationModal
        item={item}
        cartItem={editingCartItem}
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
      />
    </>
  );
}
