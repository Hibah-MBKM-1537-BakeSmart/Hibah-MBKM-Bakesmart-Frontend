"use client";

import { X, Save, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/app/contexts/CartContext";
import { useTranslation } from "@/app/contexts/TranslationContext";
import type { MenuItem, ProductAttribute } from "@/lib/api/mockData";

interface EditCustomizationModalProps {
  item: MenuItem | null;
  cartItem: {
    cartId: string;
    id: number;
    nama_id: string;
    nama_en: string;
    quantity: number;
    selectedAttributes?: ProductAttribute[];
    orderDay: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditCustomizationModal({
  item,
  cartItem,
  isOpen,
  onClose,
}: EditCustomizationModalProps) {
  const { t, language } = useTranslation();
  const { updateQuantity, removeFromCart, addToCart } = useCart();
  const [selectedAttributes, setSelectedAttributes] = useState<
    ProductAttribute[]
  >([]);
  const [quantity, setQuantity] = useState(1);

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
    if (isOpen && cartItem) {
      setSelectedAttributes(cartItem.selectedAttributes || []);
      setQuantity(cartItem.quantity);
    }
  }, [isOpen, cartItem]);

  if (!isOpen || !item || !cartItem) return null;

  const handleAttributeToggle = (attribute: ProductAttribute) => {
    setSelectedAttributes((prev) => {
      const exists = prev.find((attr) => attr.id === attribute.id);
      if (exists) {
        return prev.filter((attr) => attr.id !== attribute.id);
      } else {
        return [...prev, attribute];
      }
    });
  };

  const handleSaveChanges = () => {
    // Remove old cart item
    removeFromCart(cartItem.cartId);

    // Add new cart item with updated customization
    const updatedItem = {
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
      selectedAttributes: selectedAttributes,
    };

    // Add the updated item with the new quantity
    for (let i = 0; i < quantity; i++) {
      addToCart(updatedItem);
    }

    onClose();
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

  const basePrice = item.harga_diskon || item.harga;
  const attributesPrice = selectedAttributes.reduce(
    (total, attr) => total + attr.harga,
    0
  );
  const totalPrice = (basePrice + attributesPrice) * quantity;
  const formattedTotalPrice = `Rp${totalPrice.toLocaleString("id-ID")}`;
  const formattedUnitPrice = `Rp${(basePrice + attributesPrice).toLocaleString(
    "id-ID"
  )}`;

  const shouldShowDiscount =
    item.harga_diskon && item.harga_diskon < item.harga;
  const itemName = language === "en" ? item.nama_en : item.nama_id;
  const itemImage = item.gambars?.[0]?.file_path || "/placeholder.svg";

  // Check if changes were made
  const originalAttributeIds = (cartItem.selectedAttributes || [])
    .map((attr) => attr.id)
    .sort();
  const currentAttributeIds = selectedAttributes.map((attr) => attr.id).sort();

  const hasAttributeChanges =
    JSON.stringify(originalAttributeIds) !==
    JSON.stringify(currentAttributeIds);
  const hasQuantityChanges = quantity !== cartItem.quantity;
  const hasChanges = hasAttributeChanges || hasQuantityChanges;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 overflow-hidden"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-hidden shadow-2xl transform transition-all duration-200 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Edit Kustomisasi
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Ubah pilihan dan jumlah item
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
                    {getDayLabel(cartItem.orderDay)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {shouldShowDiscount && (
                    <span className="text-sm text-gray-400 line-through">
                      Rp{item.harga.toLocaleString("id-ID")}
                    </span>
                  )}
                  <span className="text-lg font-semibold text-gray-900">
                    {formattedUnitPrice} / item
                  </span>
                  {shouldShowDiscount && (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded">
                      Promo
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quantity Control */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah:
              </label>
              <div className="flex items-center gap-3">
                <button
                  className="w-8 h-8 rounded-full border-2 border-[#8B6F47] text-[#8B6F47] hover:bg-[#8B6F47] hover:text-white transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="text-xl font-semibold text-gray-900 min-w-[2rem] text-center">
                  {quantity}
                </span>
                <button
                  className="w-8 h-8 rounded-full border-2 border-[#8B6F47] text-[#8B6F47] hover:bg-[#8B6F47] hover:text-white transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= item.stok}
                >
                  <Plus size={16} />
                </button>
                <span className="text-sm text-gray-500 ml-2">
                  (Max: {item.stok})
                </span>
              </div>
            </div>

            {/* Attributes Selection */}
            {item.attributes && item.attributes.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Pilihan Tambahan:
                </label>
                <div className="space-y-2">
                  {item.attributes.map((attribute) => {
                    const isSelected = selectedAttributes.some(
                      (attr) => attr.id === attribute.id
                    );
                    const attributeName =
                      language === "en" ? attribute.nama_en : attribute.nama_id;
                    return (
                      <div
                        key={attribute.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          isSelected
                            ? "border-[#8B6F47] bg-[#8B6F47]/5 ring-2 ring-[#8B6F47]/20"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleAttributeToggle(attribute)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                isSelected
                                  ? "border-[#8B6F47] bg-[#8B6F47]"
                                  : "border-gray-300"
                              }`}
                            >
                              {isSelected && (
                                <svg
                                  className="w-2.5 h-2.5 text-white"
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
                            <span className="font-medium text-gray-900">
                              {attributeName}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">
                            +Rp{attribute.harga.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-3">
                Ringkasan Harga:
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Harga dasar ({quantity}x)</span>
                  <span>
                    Rp{(basePrice * quantity).toLocaleString("id-ID")}
                  </span>
                </div>
                {selectedAttributes.length > 0 && (
                  <>
                    {selectedAttributes.map((attr) => {
                      const attrName =
                        language === "en" ? attr.nama_en : attr.nama_id;
                      return (
                        <div key={attr.id} className="flex justify-between">
                          <span>
                            {attrName} ({quantity}x)
                          </span>
                          <span>
                            +Rp{(attr.harga * quantity).toLocaleString("id-ID")}
                          </span>
                        </div>
                      );
                    })}
                  </>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-[#8B6F47]">{formattedTotalPrice}</span>
                </div>
              </div>
            </div>

            {/* Changes Indicator */}
            {hasChanges && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-700 font-medium">
                  Perubahan terdeteksi:
                </p>
                <ul className="text-xs text-blue-600 mt-1 ml-4">
                  {hasQuantityChanges && (
                    <li>
                      • Jumlah: {cartItem.quantity} → {quantity}
                    </li>
                  )}
                  {hasAttributeChanges && <li>• Kustomisasi diubah</li>}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  hasChanges
                    ? "bg-[#5D4037] text-white hover:bg-[#8B6F47] hover:scale-105 active:scale-95"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                onClick={handleSaveChanges}
                disabled={!hasChanges}
              >
                <Save size={18} />
                {hasChanges ? "Simpan Perubahan" : "Tidak Ada Perubahan"}
              </button>

              <button
                className="w-full px-4 py-3 rounded-lg font-medium border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-200"
                onClick={onClose}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
