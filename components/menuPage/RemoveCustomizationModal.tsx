"use client";

import { X, Minus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/app/contexts/CartContext";
import { useTranslation } from "@/app/contexts/TranslationContext";
import type { MenuItem } from "@/lib/api/mockData";

interface RemoveCustomizationModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RemoveCustomizationModal({
  item,
  isOpen,
  onClose,
}: RemoveCustomizationModalProps) {
  const { t, language } = useTranslation();
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const [refreshKey, setRefreshKey] = useState(0);

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

  // Force refresh when cartItems change
  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [cartItems]);

  if (!isOpen || !item) return null;

  // Get all cart items for this product - filter lebih spesifik
  const productCartItems = cartItems.filter(
    (cartItem) => cartItem.id === item.id
  );

  console.log("Product cart items:", productCartItems);

  if (productCartItems.length === 0) {
    onClose();
    return null;
  }

  // Simplified approach - show each cart item individually instead of grouping
  const cartItemsToShow = productCartItems.map((cartItem) => ({
    cartId: cartItem.cartId,
    cartItem: cartItem,
    quantity: cartItem.quantity,
    attributes: cartItem.selectedAttributes || [],
    orderDay: cartItem.orderDay,
  }));

  console.log("Cart items to show:", cartItemsToShow);

  const handleReduceQuantity = (cartId: string) => {
    const cartItem = cartItems.find((item) => item.cartId === cartId);
    if (!cartItem) return;

    if (cartItem.quantity > 1) {
      const success = updateQuantity(cartId, cartItem.quantity - 1);
      if (!success) {
        console.error("Failed to update quantity");
      }
    } else {
      removeFromCart(cartId);
      // Check if this was the last item
      const remainingItems = cartItems.filter(
        (item) => item.id === cartItem.id && item.cartId !== cartId
      );
      if (remainingItems.length === 0) {
        setTimeout(() => onClose(), 200);
      }
    }
  };

  const handleRemoveAll = (cartId: string) => {
    const cartItem = cartItems.find((item) => item.cartId === cartId);
    if (!cartItem) return;

    removeFromCart(cartId);

    // Check if this was the last item
    const remainingItems = cartItems.filter(
      (item) => item.id === cartItem.id && item.cartId !== cartId
    );
    if (remainingItems.length === 0) {
      setTimeout(() => onClose(), 200);
    }
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

  const calculatePrice = (cartItem: any) => {
    const basePrice = item!.harga_diskon || item!.harga;
    const attributesPrice = (cartItem.selectedAttributes || []).reduce(
      (total: number, attr: any) => total + (attr?.harga || 0),
      0
    );
    return basePrice + attributesPrice;
  };

  const shouldShowDiscount =
    item.harga_diskon && item.harga_diskon < item.harga;
  const basePrice = item.harga_diskon || item.harga;

  const totalQuantity = cartItemsToShow.reduce(
    (sum, item) => sum + item.quantity,
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
        className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl transform transition-all duration-200 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Pilih yang ingin dikurangi
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
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
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-900">
                    Total: {totalQuantity} item(s)
                  </span>
                </div>
              </div>
            </div>

            {/* Debug info - remove in production */}
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <p>Debug: Found {cartItemsToShow.length} cart entries</p>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {cartItemsToShow.map((itemData, index) => {
                const totalPrice = calculatePrice(itemData.cartItem);
                const formattedTotalPrice = `Rp${totalPrice.toLocaleString(
                  "id-ID"
                )}`;

                return (
                  <div
                    key={`${itemData.cartId}-${refreshKey}`}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                            {getDayLabel(itemData.orderDay)}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Qty: {itemData.quantity}
                          </span>
                          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                            #{index + 1}
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

                        {/* Customization Details */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          {itemData.attributes &&
                          itemData.attributes.length > 0 ? (
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Kustomisasi:
                              </p>
                              {itemData.attributes.map((attr: any) => {
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

                          {/* Debug cart ID */}
                          <p className="text-xs text-gray-400 mt-2">
                            Cart ID: {itemData.cartId}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <button
                        className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                        onClick={() => {
                          console.log(
                            "Reducing quantity for cart ID:",
                            itemData.cartId
                          );
                          handleReduceQuantity(itemData.cartId);
                        }}
                      >
                        <Minus size={16} />
                        Kurangi 1
                      </button>

                      <button
                        className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                        onClick={() => {
                          console.log(
                            "Removing all for cart ID:",
                            itemData.cartId
                          );
                          handleRemoveAll(itemData.cartId);
                        }}
                      >
                        <Trash2 size={16} />
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {cartItemsToShow.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Tidak ada item ditemukan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
