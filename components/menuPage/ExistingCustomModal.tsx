"use client";

import { X, ShoppingCart, Plus, Eye, Save, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/app/contexts/CartContext";
import { useTranslation } from "@/app/contexts/TranslationContext";
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
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(1);
  const [editAttributes, setEditAttributes] = useState<ProductAttribute[]>([]);

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
      setEditingVariantId(null);
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
      name: language === "id" ? item.nama_id : item.nama_en,
      discountPrice: cartItem.discountPrice,
      originalPrice: cartItem.originalPrice,
      isDiscount: cartItem.isDiscount,
      image: cartItem.image,
      category: cartItem.category,
      stock: item.stok,
      availableDays: item.hari.map((h) => h.nama_id),
      orderDay: cartItem.orderDay,
      selectedAttributes: cartItem.selectedAttributes || [],
    };

    const success = addToCart(itemToAdd);
    if (success) {
      onClose();
    }
  };

  const handleStartEdit = (variant: any) => {
    setEditingVariantId(variant.id);
    setEditQuantity(variant.quantity);
    setEditAttributes(variant.attributes || []);
    setSelectedVariant(null); // Deselect when editing
  };

  const handleCancelEdit = () => {
    setEditingVariantId(null);
    setEditQuantity(1);
    setEditAttributes([]);
  };

  const handleSaveEdit = (variant: any) => {
    const originalCartItem = variant.cartItem;

    // Check if attributes changed
    const originalAttrIds = (originalCartItem.selectedAttributes || [])
      .map((attr: any) => attr.id)
      .sort();
    const newAttrIds = editAttributes.map((attr) => attr.id).sort();
    const attributesChanged =
      JSON.stringify(originalAttrIds) !== JSON.stringify(newAttrIds);

    // Check if quantity changed
    const quantityChanged = editQuantity !== originalCartItem.quantity;

    if (!attributesChanged && !quantityChanged) {
      // No changes, just cancel edit mode
      handleCancelEdit();
      return;
    }

    // If only quantity changed, update it
    if (!attributesChanged && quantityChanged) {
      const success = updateQuantity(originalCartItem.cartId, editQuantity);
      if (success) {
        handleCancelEdit();
      }
      return;
    }

    // If attributes changed, check if there's already an item with the same customization
    if (attributesChanged) {
      const existingItemWithSameCustomization = cartItems.find(
        (ci) =>
          ci.id === item.id &&
          ci.cartId !== originalCartItem.cartId &&
          ci.orderDay === originalCartItem.orderDay &&
          JSON.stringify(
            (ci.selectedAttributes || []).map((attr) => attr.id).sort()
          ) === JSON.stringify(newAttrIds)
      );

      if (existingItemWithSameCustomization) {
        // Gabungkan quantity dengan item yang sudah ada
        const newTotalQuantity =
          existingItemWithSameCustomization.quantity + editQuantity;

        // Check stock
        if (newTotalQuantity > item.stok) {
          alert(`Stok tidak mencukupi. Maksimal ${item.stok} item`);
          return;
        }

        const quantityUpdated = updateQuantity(
          existingItemWithSameCustomization.cartId,
          newTotalQuantity
        );

        if (!quantityUpdated) {
          alert("Gagal mengupdate jumlah item");
          return;
        }

        // Remove old item
        removeFromCart(originalCartItem.cartId);
        handleCancelEdit();
      } else {
        // Tidak ada item dengan kustomisasi yang sama, buat item baru
        // Check stock
        if (editQuantity > item.stok) {
          alert(`Stok tidak mencukupi. Maksimal ${item.stok} item`);
          return;
        }

        const updatedItem = {
          id: item.id,
          name: language === "id" ? item.nama_id : item.nama_en,
          discountPrice: originalCartItem.discountPrice,
          originalPrice: originalCartItem.originalPrice,
          isDiscount: originalCartItem.isDiscount,
          image: originalCartItem.image,
          category: originalCartItem.category,
          stock: item.stok,
          availableDays: item.hari.map((h) => h.nama_id),
          orderDay: originalCartItem.orderDay,
          selectedAttributes: editAttributes,
        };

        const added = addToCart(updatedItem);
        if (!added) {
          alert("Tidak dapat menambahkan produk dengan kustomisasi ini");
          return;
        }

        // Update quantity if needed
        if (editQuantity > 1) {
          const newCartItems = [...cartItems];
          const lastCartItem = newCartItems[newCartItems.length - 1];
          if (lastCartItem) {
            const quantityUpdated = updateQuantity(
              lastCartItem.cartId,
              editQuantity
            );
            if (!quantityUpdated) {
              removeFromCart(lastCartItem.cartId);
              alert("Gagal mengupdate jumlah item");
              return;
            }
          }
        }

        // Remove old item
        removeFromCart(originalCartItem.cartId);
        handleCancelEdit();
      }
    }
  };

  const handleToggleAttribute = (attribute: ProductAttribute) => {
    setEditAttributes((prev) => {
      const exists = prev.find((attr) => attr.id === attribute.id);
      if (exists) {
        return prev.filter((attr) => attr.id !== attribute.id);
      } else {
        return [...prev, attribute];
      }
    });
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, editQuantity + delta);
    if (newQuantity <= item.stok) {
      setEditQuantity(newQuantity);
    }
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
  const calculatePrice = (attributes: ProductAttribute[], quantity = 1) => {
    const basePrice = item!.harga_diskon || item!.harga;
    const attributesPrice = attributes.reduce(
      (total, attr) => total + (attr?.harga || 0),
      0
    );
    return (basePrice + attributesPrice) * quantity;
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
              Item sudah ada di keranjang - pilih varian yang ingin ditambahkan
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
                const isEditing = editingVariantId === variant.id;
                const isSelected = selectedVariant === variant.id;

                const displayQuantity = isEditing
                  ? editQuantity
                  : variant.quantity;
                const displayAttributes = isEditing
                  ? editAttributes
                  : variant.attributes;
                const totalPrice = calculatePrice(
                  displayAttributes,
                  displayQuantity
                );
                const formattedTotalPrice = `Rp${totalPrice.toLocaleString(
                  "id-ID"
                )}`;

                return (
                  <div
                    key={variant.id}
                    className={`border rounded-lg p-4 transition-all ${
                      isEditing
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
                        : isSelected
                        ? "border-[#8B6F47] bg-[#8B6F47]/5 ring-2 ring-[#8B6F47]/20 cursor-pointer"
                        : "border-gray-200 hover:border-gray-300 cursor-pointer"
                    }`}
                    onClick={() => !isEditing && setSelectedVariant(variant.id)}
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
                          {!isEditing && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              Qty: {variant.quantity}
                            </span>
                          )}
                        </div>

                        {isEditing && (
                          <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Jumlah:
                            </label>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="w-7 h-7 rounded-full bg-[#5D4037] text-white hover:bg-[#8B6F47] transition-colors flex items-center justify-center disabled:opacity-50"
                                onClick={() => handleQuantityChange(-1)}
                                disabled={editQuantity <= 1}
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
                                {editQuantity}
                              </span>
                              <button
                                type="button"
                                className="w-7 h-7 rounded-full bg-[#5D4037] text-white hover:bg-[#8B6F47] transition-colors flex items-center justify-center disabled:opacity-50"
                                onClick={() => handleQuantityChange(1)}
                                disabled={editQuantity >= item.stok}
                              >
                                <Plus size={14} />
                              </button>
                              <span className="text-xs text-gray-500 ml-1">
                                (Stok: {item.stok})
                              </span>
                            </div>
                          </div>
                        )}

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

                        {isEditing ? (
                          <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                              Pilihan Tambahan:
                            </label>
                            <div className="space-y-2">
                              {item.attributes && item.attributes.length > 0 ? (
                                item.attributes.map((attribute) => {
                                  const isAttrSelected = editAttributes.some(
                                    (attr) => attr.id === attribute.id
                                  );
                                  const attributeName =
                                    language === "en"
                                      ? attribute.nama_en
                                      : attribute.nama_id;
                                  return (
                                    <div
                                      key={attribute.id}
                                      className={`border rounded-lg p-2 cursor-pointer transition-all ${
                                        isAttrSelected
                                          ? "border-[#8B6F47] bg-[#8B6F47]/5"
                                          : "border-gray-200 hover:border-gray-300"
                                      }`}
                                      onClick={() =>
                                        handleToggleAttribute(attribute)
                                      }
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div
                                            className={`w-3 h-3 rounded border-2 flex items-center justify-center ${
                                              isAttrSelected
                                                ? "border-[#8B6F47] bg-[#8B6F47]"
                                                : "border-gray-300"
                                            }`}
                                          >
                                            {isAttrSelected && (
                                              <svg
                                                className="w-2 h-2 text-white"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                              >
                                                <path
                                                  fillRule="evenodd"
                                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                  clipRule="evenodd"
                                                />
                                              </svg>
                                            )}
                                          </div>
                                          <span className="text-sm font-medium text-gray-900">
                                            {attributeName}
                                          </span>
                                        </div>
                                        <span className="text-xs text-gray-600">
                                          +Rp
                                          {attribute.harga.toLocaleString(
                                            "id-ID"
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-sm text-gray-600">
                                  Tidak ada pilihan tambahan
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-3">
                            {displayAttributes.length > 0 ? (
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-700 mb-2">
                                  Detail Kustomisasi:
                                </p>
                                {displayAttributes.map((attr) => {
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
                        )}
                      </div>

                      {!isEditing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(variant);
                          }}
                          className="ml-2 px-3 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors border border-blue-200"
                        >
                          Edit
                        </button>
                      )}
                    </div>

                    {isEditing && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleSaveEdit(variant)}
                          className="flex-1 px-3 py-2 bg-[#5D4037] text-white rounded-lg text-sm font-medium hover:bg-[#8B6F47] transition-colors flex items-center justify-center gap-1"
                        >
                          <Save size={14} />
                          Simpan
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 px-3 py-2 border-2 border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    )}

                    {isSelected && !isEditing && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-[#8B6F47] font-medium flex items-center gap-2">
                          <ShoppingCart size={14} />
                          Klik "Tambah Varian Ini" untuk menambah 1 lagi dengan
                          kustomisasi yang sama
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 border-t pt-4">
              {selectedVariant && !editingVariantId && (
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
                  {isOutOfStock ? "Stok Habis" : `Tambah Varian Terpilih (+1)`}
                </button>
              )}

              {!editingVariantId && (
                <button
                  className="w-full px-4 py-3 rounded-lg font-medium border-2 border-[#8B6F47] text-[#8B6F47] hover:bg-[#8B6F47] hover:text-white transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                  onClick={handleAddNewCustomization}
                >
                  <Plus size={18} />
                  Buat Kustomisasi Baru
                </button>
              )}

              {!selectedVariant && !editingVariantId && (
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
  );
}
